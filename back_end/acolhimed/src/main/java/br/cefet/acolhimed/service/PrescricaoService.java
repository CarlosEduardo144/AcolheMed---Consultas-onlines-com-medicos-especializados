package br.cefet.acolhimed.service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;

import br.cefet.acolhimed.dto.ItemPrescricaoRequestDTO;
import br.cefet.acolhimed.dto.PrescricaoRequestDTO;
import br.cefet.acolhimed.dto.PrescricaoResponseDTO;
import br.cefet.acolhimed.entity.Consulta;
import br.cefet.acolhimed.entity.ItemPrescricao;
import br.cefet.acolhimed.entity.Prescricao;
import br.cefet.acolhimed.enums.StatusConsulta;
import br.cefet.acolhimed.enums.TipoNotificacao;
import br.cefet.acolhimed.exception.BusinessException;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.ConsultaRepository;
import br.cefet.acolhimed.repository.PrescricaoRepository;
import br.cefet.acolhimed.repository.UsuarioRepository;

@Service
public class PrescricaoService {
    private static final String URL_VALIDACAO = "localhost:8100/validar-prescricao/";
    private static final Color AZUL_ESCURO = new Color(15, 36, 64);
    private static final Color AZUL = new Color(41, 171, 226);
    private static final Color CINZA_CLARO = new Color(244, 248, 252);
    private static final Color BORDA = new Color(205, 216, 228);
    private static final DateTimeFormatter DATA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATA_HORA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy 'as' HH:mm");

    @Autowired
    private PrescricaoRepository prescricaoRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired 
    private NotificacaoService notificacaoService;

    @Transactional
    public PrescricaoResponseDTO inserir(PrescricaoRequestDTO dto) {
        String consultaId = buscarConsultaId(dto);

        Consulta consulta = consultaRepository.findById(consultaId)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta nao encontrada. Id: " + consultaId));

        if (prescricaoRepository.existsByConsultaId(consultaId)) {
            throw new BusinessException("Ja existe uma prescricao cadastrada para esta consulta.");
        }

        Prescricao prescricao = new Prescricao();
        prescricao.setConsulta(consulta);
        prescricao.setData(dto.getData());
        prescricao.setTokenValidacao(gerarTokenValidacao(dto.getTokenValidacao()));

        dto.getItens().forEach(itemDTO -> prescricao.getItens().add(montarItem(itemDTO, prescricao)));

        consulta.setStatus(StatusConsulta.finalizada);
        consultaRepository.save(consulta);

        notificacaoService.criarNotificacao(
                consulta.getPaciente(),
                TipoNotificacao.receita,
                "Receita disponível",
                "O Dr. " + consulta.getMedico().getNome() + " adicionou sua prescrição.");

        return new PrescricaoResponseDTO(prescricaoRepository.save(prescricao));
    }

    @Transactional(readOnly = true)
    public PrescricaoResponseDTO buscarPorConsulta(String consultaId) {
        Prescricao prescricao = prescricaoRepository.findByConsultaId(consultaId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Prescricao nao encontrada para a consulta. Id: " + consultaId));

        return new PrescricaoResponseDTO(prescricao);
    }

    @Transactional(readOnly = true)
    public PrescricaoResponseDTO buscarPorUsuario(String usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException("Usuario nao encontrado. Id: " + usuarioId);
        }

        Prescricao prescricao = prescricaoRepository
                .findFirstByConsultaPacienteIdOrConsultaMedicoIdOrderByDataDesc(usuarioId, usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Prescricao nao encontrada para o usuario. Id: " + usuarioId));

        return new PrescricaoResponseDTO(prescricao);
    }

    @Transactional(readOnly = true)
    public PrescricaoResponseDTO validar(String tokenValidacao) {
        Prescricao prescricao = prescricaoRepository.findByTokenValidacao(tokenValidacao)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Prescricao nao encontrada ou nao emitida pelo AcolhiMed."));

        return new PrescricaoResponseDTO(prescricao);
    }

    @Transactional(readOnly = true)
    public byte[] gerarPdf(String id) {
        Prescricao prescricao = prescricaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescricao nao encontrada. Id: " + id));

        return montarPdf(prescricao);
    }

    private String buscarConsultaId(PrescricaoRequestDTO dto) {
        if (dto.getConsultaId() != null && !dto.getConsultaId().isBlank()) {
            return dto.getConsultaId();
        }

        if (dto.getConsulta() != null && dto.getConsulta().getId() != null && !dto.getConsulta().getId().isBlank()) {
            return dto.getConsulta().getId();
        }

        throw new BusinessException("O campo consultaId e obrigatorio.");
    }

    private String gerarTokenValidacao(String tokenInformado) {
        if (tokenInformado != null && !tokenInformado.isBlank()) {
            return tokenInformado;
        }

        String token = UUID.randomUUID().toString();
        while (prescricaoRepository.findByTokenValidacao(token).isPresent()) {
            token = UUID.randomUUID().toString();
        }

        return token;
    }

    private ItemPrescricao montarItem(ItemPrescricaoRequestDTO dto, Prescricao prescricao) {
        ItemPrescricao item = new ItemPrescricao();
        item.setMedicamento(dto.getMedicamento());
        item.setDosagem(dto.getDosagem());
        item.setFrequencia(dto.getFrequencia());
        item.setDuracao(dto.getDuracao());
        item.setVia(dto.getVia());
        item.setObservacoes(dto.getObservacoes());
        item.setPrescricao(prescricao);

        return item;
    }

    private byte[] montarPdf(Prescricao prescricao) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 56, 56, 40, 42);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            adicionarCabecalho(document);
            adicionarResumo(document, prescricao);
            adicionarConsulta(document, prescricao.getConsulta());
            adicionarItens(document, prescricao);
            adicionarAssinatura(document, prescricao);
            adicionarValidacao(document, prescricao);

            adicionarRodape(document, writer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new BusinessException("Nao foi possivel gerar o PDF da prescricao.");
        }
    }

    private void adicionarCabecalho(Document document) throws Exception {
        PdfPTable faixa = new PdfPTable(1);
        faixa.setWidthPercentage(100);
        PdfPCell faixaCell = new PdfPCell(new Phrase(""));
        faixaCell.setFixedHeight(18);
        faixaCell.setBorder(Rectangle.NO_BORDER);
        faixaCell.setBackgroundColor(AZUL_ESCURO);
        faixa.addCell(faixaCell);
        document.add(faixa);

        Paragraph icone = new Paragraph("+", fonte(28, Font.BOLD, Color.WHITE));
        icone.setAlignment(Element.ALIGN_CENTER);
        PdfPTable circulo = new PdfPTable(1);
        circulo.setWidthPercentage(10);
        PdfPCell iconeCell = new PdfPCell(icone);
        iconeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        iconeCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        iconeCell.setFixedHeight(42);
        iconeCell.setBorder(Rectangle.NO_BORDER);
        iconeCell.setBackgroundColor(AZUL_ESCURO);
        circulo.addCell(iconeCell);
        document.add(circulo);

        Paragraph titulo = new Paragraph("AcolhiMed - Prescricao", fonte(28, Font.BOLD, AZUL_ESCURO));
        titulo.setAlignment(Element.ALIGN_CENTER);
        titulo.setSpacingBefore(10);
        document.add(titulo);

        Paragraph subtitulo = new Paragraph("RECEITUARIO MEDICO ELETRONICO", fonte(10, Font.NORMAL, Color.GRAY));
        subtitulo.setAlignment(Element.ALIGN_CENTER);
        subtitulo.setSpacingAfter(12);
        document.add(subtitulo);

        adicionarLinha(document, AZUL_ESCURO, 2);
    }

    private void adicionarResumo(Document document, Prescricao prescricao) throws Exception {
        Consulta consulta = prescricao.getConsulta();
        PdfPTable tabela = new PdfPTable(2);
        tabela.setWidthPercentage(100);
        tabela.setSpacingBefore(12);
        tabela.setWidths(new float[] { 1, 1 });

        adicionarInfoCell(tabela, "PACIENTE", consulta.getPaciente().getNome());
        adicionarInfoCell(tabela, "MEDICO", montarMedicoComCrm(consulta));
        adicionarInfoCell(tabela, "DATA DA PRESCRICAO", formatarData(prescricao));
        adicionarInfoCell(tabela, "CODIGO DA PRESCRICAO", prescricao.getId());

        document.add(tabela);
    }

    private void adicionarConsulta(Document document, Consulta consulta) throws Exception {
        if (consulta == null) {
            return;
        }

        boolean temDataHora = consulta.getDataHora() != null;
        boolean temEspecialidade = consulta.getEspecialidade() != null
                && temTexto(consulta.getEspecialidade().getNome());
        boolean temObservacoes = temTexto(consulta.getObservacoes());

        if (!temDataHora && !temEspecialidade && !temObservacoes) {
            return;
        }

        adicionarSecao(document, "Informacoes da consulta");

        PdfPTable tabela = new PdfPTable(2);
        tabela.setWidthPercentage(100);
        tabela.setWidths(new float[] { 1, 1 });

        if (temDataHora) {
            adicionarInfoCell(tabela, "DATA E HORA DA CONSULTA", consulta.getDataHora().format(DATA_HORA_FORMATTER));
        }

        if (temEspecialidade) {
            adicionarInfoCell(tabela, "ESPECIALIDADE", consulta.getEspecialidade().getNome());
        }

        if (temDataHora ^ temEspecialidade) {
            PdfPCell vazio = new PdfPCell(new Phrase(""));
            vazio.setBorderColor(BORDA);
            tabela.addCell(vazio);
        }

        if (temObservacoes) {
            PdfPCell observacoes = criarInfoCell("DESCRICAO INFORMADA PELO PACIENTE", consulta.getObservacoes());
            observacoes.setColspan(2);
            tabela.addCell(observacoes);
        }

        document.add(tabela);
    }

    private void adicionarItens(Document document, Prescricao prescricao) throws Exception {
        adicionarSecao(document, "Medicamentos prescritos");

        int indice = 1;
        for (ItemPrescricao item : prescricao.getItens()) {
            PdfPTable tabela = new PdfPTable(2);
            tabela.setWidthPercentage(100);
            tabela.setWidths(new float[] { 0.08f, 0.92f });
            tabela.setSpacingAfter(10);

            PdfPCell numero = new PdfPCell(new Phrase(String.valueOf(indice), fonte(18, Font.BOLD, Color.WHITE)));
            numero.setHorizontalAlignment(Element.ALIGN_CENTER);
            numero.setVerticalAlignment(Element.ALIGN_TOP);
            numero.setBackgroundColor(AZUL_ESCURO);
            numero.setBorderColor(AZUL_ESCURO);
            numero.setPaddingTop(16);
            numero.setPaddingBottom(16);
            tabela.addCell(numero);

            PdfPCell conteudo = new PdfPCell();
            conteudo.setBorderColor(BORDA);
            conteudo.setPadding(12);
            conteudo.addElement(new Paragraph(valor(item.getMedicamento()), fonte(16, Font.BOLD, AZUL_ESCURO)));
            conteudo.addElement(camposItem(item));

            if (temTexto(item.getObservacoes())) {
                PdfPTable obs = new PdfPTable(1);
                obs.setWidthPercentage(100);
                PdfPCell obsCell = new PdfPCell();
                obsCell.setBorder(Rectangle.LEFT);
                obsCell.setBorderColor(AZUL);
                obsCell.setBorderWidthLeft(2);
                obsCell.setBackgroundColor(CINZA_CLARO);
                obsCell.setPadding(8);
                obsCell.addElement(new Paragraph("OBSERVACOES", fonte(8, Font.BOLD, AZUL)));
                obsCell.addElement(new Paragraph(item.getObservacoes(), fonte(10, Font.NORMAL, AZUL_ESCURO)));
                obs.addCell(obsCell);
                conteudo.addElement(obs);
            }

            tabela.addCell(conteudo);
            document.add(tabela);
            indice++;
        }
    }

    private PdfPTable camposItem(ItemPrescricao item) throws Exception {
        PdfPTable campos = new PdfPTable(4);
        campos.setWidthPercentage(100);
        campos.setSpacingBefore(8);
        campos.setSpacingAfter(8);
        campos.setWidths(new float[] { 1, 1, 1, 1 });

        adicionarCampoItem(campos, "DOSAGEM", item.getDosagem());
        adicionarCampoItem(campos, "FREQUENCIA", item.getFrequencia());
        adicionarCampoItem(campos, "DURACAO", item.getDuracao());
        adicionarCampoItem(campos, "VIA", item.getVia());

        return campos;
    }

    private void adicionarAssinatura(Document document, Prescricao prescricao) throws Exception {
        Consulta consulta = prescricao.getConsulta();
        PdfPTable tabela = new PdfPTable(1);
        tabela.setWidthPercentage(55);
        tabela.setSpacingBefore(22);

        PdfPCell linha = new PdfPCell(new Phrase(""));
        linha.setFixedHeight(1);
        linha.setBorder(Rectangle.TOP);
        linha.setBorderColor(AZUL_ESCURO);
        tabela.addCell(linha);

        PdfPCell medico = new PdfPCell();
        medico.setBorder(Rectangle.NO_BORDER);
        medico.setHorizontalAlignment(Element.ALIGN_CENTER);
        medico.addElement(textoCentralizado(consulta.getMedico().getNome(), fonte(11, Font.BOLD, AZUL_ESCURO)));
        medico.addElement(textoCentralizado(
                "CRM " + consulta.getMedico().getCrm() + "-" + consulta.getMedico().getUfEmissao()
                        + " - Assinado eletronicamente",
                fonte(9, Font.NORMAL, Color.GRAY)));
        tabela.addCell(medico);

        document.add(tabela);
    }

    private void adicionarValidacao(Document document, Prescricao prescricao) throws Exception {
        String url = URL_VALIDACAO + prescricao.getTokenValidacao();

        PdfPTable tabela = new PdfPTable(2);
        tabela.setWidthPercentage(100);
        tabela.setSpacingBefore(18);
        tabela.setWidths(new float[] { 0.28f, 0.72f });

        BitMatrix matrix = new MultiFormatWriter().encode(
                url,
                BarcodeFormat.QR_CODE,
                300,
                300);

        ByteArrayOutputStream qrOut = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", qrOut);

        Image qrImage = Image.getInstance(qrOut.toByteArray());
        qrImage.scaleAbsolute(100, 100);

        PdfPCell qrCell = new PdfPCell(qrImage, true);
        qrCell.setPadding(16);
        qrCell.setBorderColor(BORDA);
        qrCell.setBackgroundColor(CINZA_CLARO);
        qrCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        qrCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        tabela.addCell(qrCell);

        PdfPCell texto = new PdfPCell();
        texto.setBorderColor(BORDA);
        texto.setBackgroundColor(CINZA_CLARO);
        texto.setPadding(16);
        texto.addElement(new Paragraph("VALIDACAO DE AUTENTICIDADE", fonte(9, Font.BOLD, AZUL)));
        texto.addElement(new Paragraph(
                "Aponte a camera do celular para o QR Code ao lado, ou acesse o endereco abaixo, para confirmar que esta prescricao foi emitida pelo AcolhiMed.",
                fonte(10, Font.NORMAL, Color.GRAY)));
        texto.addElement(new Paragraph(url, fonte(9, Font.NORMAL, AZUL)));
        texto.addElement(new Paragraph("Codigo de validacao: " + prescricao.getTokenValidacao(),
                fonte(9, Font.BOLD, AZUL_ESCURO)));
        tabela.addCell(texto);

        document.add(tabela);
    }

    private void adicionarSecao(Document document, String titulo) throws Exception {
        Paragraph paragraph = new Paragraph(titulo, fonte(17, Font.BOLD, AZUL_ESCURO));
        paragraph.setSpacingBefore(16);
        paragraph.setSpacingAfter(5);
        document.add(paragraph);
        adicionarLinha(document, AZUL, 1);
    }

    private void adicionarLinha(Document document, Color cor, float largura) throws Exception {
        PdfPTable linha = new PdfPTable(1);
        linha.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell(new Phrase(""));
        cell.setFixedHeight(largura);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setBackgroundColor(cor);
        linha.addCell(cell);
        document.add(linha);
    }

    private void adicionarInfoCell(PdfPTable tabela, String label, String valor) {
        tabela.addCell(criarInfoCell(label, valor));
    }

    private PdfPCell criarInfoCell(String label, String valor) {
        PdfPCell cell = new PdfPCell();
        cell.setBorderColor(BORDA);
        cell.setBackgroundColor(CINZA_CLARO);
        cell.setPadding(12);
        cell.addElement(new Paragraph(label, fonte(8, Font.BOLD, AZUL)));
        cell.addElement(new Paragraph(valor(valor), fonte(12, Font.BOLD, AZUL_ESCURO)));
        return cell;
    }

    private void adicionarCampoItem(PdfPTable tabela, String label, String valor) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.addElement(new Paragraph(label, fonte(8, Font.BOLD, AZUL)));
        cell.addElement(new Paragraph(valor(valor), fonte(10, Font.NORMAL, AZUL_ESCURO)));
        tabela.addCell(cell);
    }

    private void adicionarRodape(Document document, PdfWriter writer) throws Exception {

        PdfPTable rodape = new PdfPTable(2);
        rodape.setWidthPercentage(100);
        rodape.setWidths(new float[] { 0.75f, 0.25f });
        rodape.setSpacingBefore(20);

        PdfPCell esquerda = new PdfPCell();
        esquerda.setBorder(Rectangle.TOP);
        esquerda.setBorderColor(BORDA);
        esquerda.setPaddingTop(8);

        esquerda.addElement(new Paragraph(
                "AcolhiMed · Documento gerado eletronicamente. A autenticidade pode ser conferida pelo QR Code.",
                fonte(8, Font.NORMAL, new Color(80, 100, 120))));

        rodape.addCell(esquerda);

        PdfPCell direita = new PdfPCell();
        direita.setBorder(Rectangle.TOP);
        direita.setBorderColor(BORDA);
        direita.setPaddingTop(8);
        direita.setHorizontalAlignment(Element.ALIGN_RIGHT);

        direita.addElement(new Paragraph(
                "Página " + writer.getPageNumber(),
                fonte(8, Font.NORMAL, new Color(80, 100, 120))));

        rodape.addCell(direita);

        document.add(rodape);
    }

    private Paragraph textoCentralizado(String texto, Font fonte) {
        Paragraph paragraph = new Paragraph(texto, fonte);
        paragraph.setAlignment(Element.ALIGN_CENTER);
        return paragraph;
    }

    private String montarMedicoComCrm(Consulta consulta) {
        String crm = consulta.getMedico().getCrm();
        String uf = consulta.getMedico().getUfEmissao();
        if (temTexto(crm) && temTexto(uf)) {
            return consulta.getMedico().getNome() + "\nCRM " + crm + "-" + uf;
        }
        return consulta.getMedico().getNome();
    }

    private String formatarData(Prescricao prescricao) {
        if (prescricao.getData() == null) {
            return "";
        }
        return prescricao.getData().format(DATA_FORMATTER);
    }

    private boolean temTexto(String valor) {
        return valor != null && !valor.isBlank();
    }

    private String valor(String valor) {
        return temTexto(valor) ? valor : "-";
    }

    private Font fonte(float tamanho, int estilo, Color cor) {
        return FontFactory.getFont(FontFactory.HELVETICA, tamanho, estilo, cor);
    }
}

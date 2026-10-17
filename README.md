\# **AcolhiMed** — Plataforma de Consultas Médicas Online



O **AcolhiMed** é uma plataforma de telemedicina desenvolvida como projeto de conclusão do curso Técnico em Desenvolvimento de Sistemas. Seu objetivo é facilitar o acesso a profissionais da saúde por meio de consultas médicas online, permitindo que pacientes encontrem médicos, agendem consultas e acompanhem seus atendimentos pela plataforma.



\## **Funcionalidades**



\### **Pacientes**

\- Cadastro e autenticação de usuários.

\- Exploração de médicos e especialidades médicas.

\- Visualização de informações e avaliações dos profissionais.

\- Agendamento, consulta e gerenciamento de consultas.

\- Remarcação e acompanhamento dos atendimentos.

\- Avaliação dos médicos após as consultas.

\- Gerenciamento do perfil e da foto.

\- Recebimento e visualização de notificações.

\- Acesso às prescrições médicas disponibilizadas pela plataforma.



\### **Médicos**

\- Cadastro e gerenciamento do perfil profissional.

\- Gerenciamento de especialidades e horários de atendimento.

\- Visualização e gerenciamento de agendamentos.

\- Realização de consultas online.

\- Emissão de prescrições médicas.

\- Acompanhamento das avaliações recebidas.



\### **Plataforma**

\- Autenticação baseada em JWT.

\- Controle de acesso conforme o tipo de usuário.

\- Integração com o Google Meet para geração de links de consultas online.

\- Armazenamento de imagens na nuvem.

\- Persistência dos dados em banco de dados relacional.



\## **Tecnologias utilizadas**



\### **Frontend**

\- \[Angular](https://angular.dev/)

\- \[Ionic Framework](https://ionicframework.com/)

\- TypeScript

\- HTML e SCSS

\- Capacitor



\### **Backend**

\- Java 21

\- Spring Boot

\- Spring Web

\- Spring Data JPA

\- Spring Security

\- JSON Web Token (JWT)

\- Maven



\### **Banco de dados e serviços**

\- PostgreSQL

\- \[Neon](https://neon.tech/) — hospedagem do banco de dados.

\- \[Cloudinary](https://cloudinary.com/) — armazenamento de imagens.

\- Google Meet API — geração de links para consultas online.

\- \[Render](https://render.com/) — hospedagem do backend.



\## **Segurança e configuração**



\- Senhas são armazenadas utilizando hash.

\- A autenticação utiliza tokens JWT.

\- O acesso aos recursos deve respeitar as permissões de cada tipo de usuário.

\- Credenciais, tokens de serviços externos e senhas do banco de dados não devem ser versionados no Git.

\- As variáveis de ambiente devem ser configuradas separadamente para desenvolvimento e produção.



\## **Objetivo acadêmico**



O AcolhiMed foi desenvolvido com o propósito de aplicar conhecimentos de desenvolvimento web, construção de APIs REST, integração entre frontend e backend, persistência de dados, autenticação e autorização de usuários.



O projeto também busca demonstrar como a tecnologia pode contribuir para facilitar o acesso a serviços de saúde.



\## **Licença**



Projeto desenvolvido para fins acadêmicos. Os direitos de utilização e distribuição devem seguir as definições estabelecidas pelos autores do projeto.


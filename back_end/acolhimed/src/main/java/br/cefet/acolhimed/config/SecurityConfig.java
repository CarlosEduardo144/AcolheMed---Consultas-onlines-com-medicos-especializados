package br.cefet.acolhimed.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import br.cefet.acolhimed.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse; 
 
@Configuration 
@EnableWebSecurity 
public class SecurityConfig { 
 
	@Autowired
	private JwtAuthenticationFilter jwtAuthenticationFilter;
	 
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http.csrf(csrf -> csrf.disable())
		.cors(cors -> Customizer.withDefaults())

		.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

		.authorizeHttpRequests(auth -> auth
				
		    .requestMatchers(
		        "/v3/api-docs/**",
		        "/swagger-ui/**",
		        "/swagger-ui.html",
				"/error"
		    ).permitAll()

			// Preflight CORS
			.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
			// Autenticação
			.requestMatchers(HttpMethod.POST, "/usuarios/login").permitAll()

			// Cadastro
			.requestMatchers(HttpMethod.POST, "/pacientes").permitAll()
			.requestMatchers(HttpMethod.POST, "/medicos").permitAll()

			// Catálogo público
			.requestMatchers(HttpMethod.GET, "/especialidades/**").permitAll()
			.requestMatchers(HttpMethod.GET, "/medicos/**").permitAll()
			.requestMatchers(HttpMethod.GET, "/horarios/**").permitAll()
			.requestMatchers(HttpMethod.GET, "/minhas-especialidades/**").permitAll()
			.requestMatchers(HttpMethod.GET, "/avaliacoes/**").permitAll()

			// Validação pública de prescrição pelo QR Code
			.requestMatchers(HttpMethod.GET, "/prescricao/validar/**").permitAll()

			// Usuários
			.requestMatchers(HttpMethod.GET, "/usuarios/{id}").hasAnyAuthority("paciente", "medico")

			// Pacientes
			.requestMatchers(HttpMethod.PUT, "/pacientes").hasAuthority("paciente")

			// Médicos
			.requestMatchers(HttpMethod.PUT, "/medicos").hasAuthority("medico")

			// Consultas
			.requestMatchers(HttpMethod.POST, "/consultas").hasAuthority("paciente")
			.requestMatchers(HttpMethod.GET, "/consultas/usuario/**").hasAnyAuthority("paciente", "medico")
			.requestMatchers(HttpMethod.GET, "/consultas/medico/**").hasAuthority("medico")
			.requestMatchers(HttpMethod.GET, "/consultas/em_andamento/**").hasAnyAuthority("paciente", "medico")
			.requestMatchers(HttpMethod.GET, "/consultas/{id}").hasAnyAuthority("paciente", "medico")
			.requestMatchers(HttpMethod.PATCH, "/consultas/cancelar/**").hasAnyAuthority("paciente", "medico")
			.requestMatchers(HttpMethod.PATCH, "/consultas/em_andamento/**").hasAnyAuthority("paciente", "medico")

			// Agenda e especialidades do médico
			.requestMatchers(HttpMethod.PUT, "/horarios").hasAuthority("medico")
			.requestMatchers(HttpMethod.PUT, "/minhas-especialidades").hasAuthority("medico")

			// Prescrições
			.requestMatchers(HttpMethod.POST, "/prescricao").hasAuthority("medico")
			.requestMatchers(HttpMethod.GET, "/prescricao/usuario/**").hasAnyAuthority("paciente", "medico")
			.requestMatchers(HttpMethod.GET, "/prescricao/*/pdf").hasAnyAuthority("paciente", "medico")
			.requestMatchers(HttpMethod.GET, "/prescricao/{consultaId}").hasAnyAuthority("paciente", "medico")

			// Avaliações
			.requestMatchers(HttpMethod.POST, "/avaliacoes").hasAuthority("paciente")

			// Notificações e fotos
			.requestMatchers("/notificacoes/**").hasAnyAuthority("paciente", "medico")
			.requestMatchers(HttpMethod.POST, "/fotos/**").hasAnyAuthority("paciente", "medico")

			// Qualquer endpoint não mapeado deve ser explicitamente analisado antes de ser liberado.
			.anyRequest().denyAll())

			.exceptionHandling(exception -> exception
				// Usuário não autenticado
				.authenticationEntryPoint((request, response, authException) -> {
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				})

				// Usuário autenticado, mas sem permissão
				.accessDeniedHandler((request, response, accessDeniedException) -> {
					response.setStatus(HttpServletResponse.SC_FORBIDDEN);
				})
			 )

			.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
	         );
		
		return http.build();
	} 
     
    @Bean 
    public PasswordEncoder passwordEncoder() { 
        return new BCryptPasswordEncoder(); 
    } 
     
    @Bean 
    public AuthenticationManager authenticationManager( 
            AuthenticationConfiguration authenticationConfiguration) throws Exception { 
 
        return authenticationConfiguration.getAuthenticationManager(); 
    }     
}

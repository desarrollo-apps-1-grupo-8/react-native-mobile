package ar.edu.uade.desa1.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import lombok.RequiredArgsConstructor;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {

    public static final String REPARTIDOR = "REPARTIDOR";
    public static final String USUARIO = "USUARIO";
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/h2-console/**",
                                "/api/v1/register",
                                "/api/v1/login",
                                "/api/v1/reset-password",
                                "/api/v1/send-verification-code",
                                "/api/v1/verify-code",
                                "/api/v1/validate-reset-token"
                        ).permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/v1/routes/update-status").hasRole(REPARTIDOR)
                        .requestMatchers(HttpMethod.GET, "/api/v1/routes").hasRole(REPARTIDOR)
                        .requestMatchers(HttpMethod.GET, "/api/v1/routes/user/**").hasRole(USUARIO)
                        .requestMatchers(HttpMethod.GET, "/api/v1/routes/history/**").hasAnyRole(USUARIO, REPARTIDOR)
                        .requestMatchers(HttpMethod.GET, "/api/v1/routes/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/routes").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

}
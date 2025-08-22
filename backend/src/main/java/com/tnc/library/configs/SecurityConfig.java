package com.tnc.library.configs;

import com.tnc.library.filters.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/book/add").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/secure/profile").permitAll()
                        .requestMatchers("/api/books").permitAll()
                        .requestMatchers("/api/book/find-by-isbn").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/book/find-by-title").permitAll()
                        .requestMatchers("/api/add/borrow-slip").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/borrow-slips").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api//update/borrow-slip").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/categories").permitAll()
                        .requestMatchers("/api/add/fine").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/fines").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/membership/add").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/add/reader").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/reader/find-by-phone").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/readers").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/type-memberships").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/payment/**").permitAll()
                        .requestMatchers("/api/borrow-slip/{id}").permitAll()
                        .requestMatchers("/api/type-fines").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*")); // Cho phép tất cả origin
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}

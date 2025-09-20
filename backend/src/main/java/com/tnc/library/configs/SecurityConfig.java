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
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/secure/profile").permitAll()
                        .requestMatchers("/api/users").hasRole("ADMIN")
                        .requestMatchers("/api/book/add").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/books").permitAll()
                        .requestMatchers("/api/book/find-by-isbn").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/book/find-by-title").permitAll()
                        .requestMatchers("/api/book/category/{categoryId}").permitAll()
                        .requestMatchers("/api/book/category/count").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/book/count").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/book/borrow-slip/count").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/add/borrow-slip").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/borrow-slips").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/borrow-slip/by-reader").hasRole("READER")
                        .requestMatchers("/api/update/borrow-slip").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/borrow-slip/count").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/borrow-slip/count/monthly").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/categories").permitAll()
                        .requestMatchers("/api/add/fine").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/fines").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/fine/amount/monthly").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/membership/add").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/add/reader").permitAll()
                        .requestMatchers("/api/reader/find-by-phone").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/readers").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/reader/count").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/type-memberships").permitAll()
                        .requestMatchers("/api/payment/**").permitAll()
                        .requestMatchers("/api/borrow-slip/{id}").hasAnyRole("ADMIN", "LIBRARIAN", "READER")
                        .requestMatchers("/api/type-fines").permitAll()
                        .requestMatchers("/api/update/fine/{id}").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/ebooks/{id}/file").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/api/add/interact").hasAnyRole("ADMIN", "READER", "LIBRARIAN")
                        .requestMatchers("/api/interacts/**").permitAll()
                        .requestMatchers("/api/user/forgot").permitAll()
                        .requestMatchers("/api/user/verify-forgot").permitAll()
                        .requestMatchers("/api/user/email").permitAll()
                        .requestMatchers("/api/user/reset-password").permitAll()
                        .requestMatchers("/api/conversation/by-user").hasAnyRole("READER", "LIBRARIAN")
                        .requestMatchers("/api/conversation/user/{userId}").hasAnyRole("LIBRARIAN")
                        .requestMatchers("/api/add/conversation").hasAnyRole("READER", "LIBRARIAN")
                        .requestMatchers("/app/**").permitAll()
                        .requestMatchers("/api/user/change-password").hasAnyRole("ADMIN", "LIBRARIAN", "READER")
                        .requestMatchers("/api/user/update").hasAnyRole("ADMIN", "LIBRARIAN", "READER")
                        .requestMatchers("/api/book/{id}").permitAll()
                        .requestMatchers("/api/book/update/{id}").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/book/delete/{id}").hasRole("ADMIN")
                        .requestMatchers("/api/borrow-slip/delete/{id}").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/borrow-slip/add/by-reader").hasRole("READER")
                        .requestMatchers("/api/borrow-slips/reader").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/fines/by-phone").hasAnyRole("ADMIN", "LIBRARIAN")
                        .requestMatchers("/api/fine/delete/{id}").hasRole("ADMIN")
                        .requestMatchers("/api/add/user").hasRole("ADMIN")
                        .requestMatchers("/api/user/update/{id}").hasRole("ADMIN")
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

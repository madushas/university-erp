package com.university.backend.config;

import com.university.backend.security.CustomUserDetailsService;
import com.university.backend.security.JwtAuthenticationEntryPoint;
import com.university.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager() throws Exception {
        return new ProviderManager(Arrays.asList(authenticationProvider()));
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .exceptionHandling(exception ->
                exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> {
                // Public auth endpoints
                auth.requestMatchers(
                    "/api/v1/auth/login",
                    "/api/v1/auth/register",
                    "/api/v1/auth/refresh"
                ).permitAll();
                // Current user endpoint requires authentication
                auth.requestMatchers(HttpMethod.GET, "/api/v1/auth/me").authenticated();
                // Swagger & OpenAPI
                auth.requestMatchers(
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/api-docs",
                    "/api-docs/**",
                    "/swagger-resources/**",
                    "/webjars/**",
                    "/configuration/ui",
                    "/configuration/security"
                ).permitAll();
                auth.requestMatchers("/actuator/**").permitAll();
                
                // Course endpoints
                auth.requestMatchers(HttpMethod.GET, "/api/v1/courses/**").hasAnyRole("STUDENT", "ADMIN", "INSTRUCTOR");
                auth.requestMatchers(HttpMethod.GET, "/api/v1/instructors/**").hasAnyRole("ADMIN", "INSTRUCTOR");
                auth.requestMatchers(HttpMethod.POST, "/api/v1/courses").hasRole("ADMIN");
                auth.requestMatchers(HttpMethod.PUT, "/api/v1/courses/**").hasRole("ADMIN");
                auth.requestMatchers(HttpMethod.DELETE, "/api/v1/courses/**").hasRole("ADMIN");
                
                // Registration endpoints
                auth.requestMatchers(HttpMethod.GET, "/api/v1/registrations/**").hasAnyRole("STUDENT", "ADMIN", "INSTRUCTOR");
                auth.requestMatchers(HttpMethod.POST, "/api/v1/registrations").hasRole("STUDENT");
                auth.requestMatchers(HttpMethod.PUT, "/api/v1/registrations/**").hasAnyRole("STUDENT", "ADMIN");
                auth.requestMatchers(HttpMethod.DELETE, "/api/v1/registrations/**").hasAnyRole("STUDENT", "ADMIN");
                
                // User endpoints
                auth.requestMatchers(HttpMethod.GET, "/api/v1/users/me").hasAnyRole("STUDENT", "ADMIN", "INSTRUCTOR");
                auth.requestMatchers(HttpMethod.PUT, "/api/v1/users/me").hasAnyRole("STUDENT", "ADMIN", "INSTRUCTOR");
                auth.requestMatchers(HttpMethod.GET, "/api/v1/users/**").hasRole("ADMIN");
                
                // Admin endpoints - All require ADMIN role
                auth.requestMatchers("/api/v1/admin/**").hasRole("ADMIN");
                
                // Analytics endpoints
                auth.requestMatchers("/api/v1/analytics/**").hasAnyRole("STUDENT", "ADMIN");
                
                // Financial endpoints
                auth.requestMatchers(HttpMethod.GET, "/api/v1/financial/**").hasAnyRole("STUDENT", "ADMIN");
                auth.requestMatchers(HttpMethod.POST, "/api/v1/financial/**").hasAnyRole("STUDENT", "ADMIN");
                auth.requestMatchers(HttpMethod.PUT, "/api/v1/financial/**").hasRole("ADMIN");
                auth.requestMatchers(HttpMethod.DELETE, "/api/v1/financial/**").hasRole("ADMIN");
                
                // HR endpoints
                auth.requestMatchers("/api/v1/hr/**").hasRole("ADMIN");
                
                // All other requests require authentication
                auth.anyRequest().authenticated();
            });

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

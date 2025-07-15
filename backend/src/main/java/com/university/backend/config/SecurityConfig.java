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
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
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
import java.util.List;

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
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
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
                // Public endpoints
                auth.requestMatchers("/auth/**").permitAll();
                auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll();
                auth.requestMatchers("/actuator/health").permitAll();
                
                // Course endpoints
                auth.requestMatchers(HttpMethod.GET, "/courses/**").hasAnyRole("STUDENT", "ADMIN");
                auth.requestMatchers(HttpMethod.POST, "/courses").hasRole("ADMIN");
                auth.requestMatchers(HttpMethod.PUT, "/courses/**").hasRole("ADMIN");
                auth.requestMatchers(HttpMethod.DELETE, "/courses/**").hasRole("ADMIN");
                
                // Registration endpoints
                auth.requestMatchers(HttpMethod.GET, "/registrations/**").hasAnyRole("STUDENT", "ADMIN");
                auth.requestMatchers(HttpMethod.POST, "/registrations").hasRole("STUDENT");
                auth.requestMatchers(HttpMethod.PUT, "/registrations/**").hasAnyRole("STUDENT", "ADMIN");
                auth.requestMatchers(HttpMethod.DELETE, "/registrations/**").hasAnyRole("STUDENT", "ADMIN");
                
                // User endpoints
                auth.requestMatchers(HttpMethod.GET, "/users/me").hasAnyRole("STUDENT", "ADMIN");
                auth.requestMatchers(HttpMethod.GET, "/users/**").hasRole("ADMIN");
                
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
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

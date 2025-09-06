package com.university.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            log.debug("JWT Authentication Filter - Path: {}, JWT present: {}", request.getServletPath(), jwt != null);

            if (StringUtils.hasText(jwt)) {
                log.debug("JWT Token: {}", jwt.substring(0, Math.min(jwt.length(), 50)) + "...");
                
                if (tokenProvider.validateToken(jwt)) {
                    log.debug("JWT token is valid");
                    String username = tokenProvider.getUsernameFromToken(jwt);
                    log.debug("Username from token: {}", username);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    log.debug("User details loaded: {}, authorities: {}", userDetails.getUsername(), userDetails.getAuthorities());
                    
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("Authentication set in security context");
                } else {
                    log.warn("JWT token validation failed for path: {}", request.getServletPath());
                }
            } else {
                log.debug("No JWT token found in request for path: {}", request.getServletPath());
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/docs/swagger-ui.html")
            || path.startsWith("/docs/swagger-ui")
            || path.startsWith("/api-docs")
            || path.startsWith("/swagger-resources")
            || path.startsWith("/webjars")
            || path.equals("/configuration/ui")
            || path.equals("/configuration/security")
            || path.equals("/actuator/health");
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

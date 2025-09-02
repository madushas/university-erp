package com.university.backend.modules.auth.service;

import com.university.backend.dto.request.LoginRequest;
import com.university.backend.dto.request.RefreshTokenRequest;
import com.university.backend.dto.request.RegisterRequest;
import com.university.backend.dto.response.AuthResponse;
import com.university.backend.dto.response.UserResponse;
import com.university.backend.modules.core.entity.Role;
import com.university.backend.modules.core.entity.User;
import com.university.backend.exception.UserAlreadyExistsException;
import com.university.backend.modules.core.repository.UserRepository;
import com.university.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.expiration}")
    private int jwtExpirationInMs;

    public AuthResponse login(LoginRequest request) {
        log.info("Attempting login for user: {}", request.getUsername());
        
        try {
            // Validate input
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                throw new IllegalArgumentException("Username cannot be empty");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                throw new IllegalArgumentException("Password cannot be empty");
            }

            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername().trim(),
                    request.getPassword()
                )
            );

            String accessToken = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(authentication);

            User user = userRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            log.info("User {} logged in successfully", request.getUsername());

            return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn((long) jwtExpirationInMs)
                .user(mapToUserResponse(user))
                .build();
        } catch (Exception e) {
            log.error("Login failed for user: {} - {}", request.getUsername(), e.getMessage());
            throw e;
        }
    }

    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user: {}", request.getUsername());
        
        try {
            // Validate input
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                throw new IllegalArgumentException("Username cannot be empty");
            }
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email cannot be empty");
            }

            String trimmedUsername = request.getUsername().trim();
            String trimmedEmail = request.getEmail().trim();

            if (userRepository.existsByUsername(trimmedUsername)) {
                throw new UserAlreadyExistsException("Username '" + trimmedUsername + "' already exists");
            }

            if (userRepository.existsByEmail(trimmedEmail)) {
                throw new UserAlreadyExistsException("Email '" + trimmedEmail + "' already exists");
            }

            User user = User.builder()
                .username(trimmedUsername)
                .email(trimmedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role(request.getRole() != null ? request.getRole() : Role.STUDENT)
                .build();

            User savedUser = userRepository.save(user);

            String accessToken = tokenProvider.generateTokenFromUsername(savedUser.getUsername());
            String refreshToken = tokenProvider.generateRefreshTokenFromUsername(savedUser.getUsername());

            log.info("User {} registered successfully", trimmedUsername);

            return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn((long) jwtExpirationInMs)
                .user(mapToUserResponse(savedUser))
                .build();
        } catch (Exception e) {
            log.error("Registration failed for user: {} - {}", request.getUsername(), e.getMessage());
            throw e;
        }
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefreshToken();
            
            if (refreshToken == null || refreshToken.trim().isEmpty()) {
                throw new IllegalArgumentException("Refresh token cannot be empty");
            }
            
            if (tokenProvider.validateToken(refreshToken)) {
                String username = tokenProvider.getUsernameFromToken(refreshToken);
                User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

                String newAccessToken = tokenProvider.generateTokenFromUsername(username);
                String newRefreshToken = tokenProvider.generateRefreshTokenFromUsername(username);

                log.info("Token refreshed for user: {}", username);

                return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .expiresIn((long) jwtExpirationInMs)
                    .user(mapToUserResponse(user))
                    .build();
            } else {
                throw new RuntimeException("Invalid refresh token");
            }
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw e;
        }
    }

    public void logout(RefreshTokenRequest request) {
        log.info("User logout requested");
        
        try {
            // Validate refresh token
            if (request.getRefreshToken() == null || request.getRefreshToken().trim().isEmpty()) {
                throw new IllegalArgumentException("Refresh token cannot be empty");
            }

            // For now, we just log the logout. In a production system, you might want to:
            // 1. Add the token to a blacklist
            // 2. Store it in Redis with expiration
            // 3. Update the user's refresh token in the database to null
            
            log.info("User logged out successfully");
            
        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage());
            throw e;
        }
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}

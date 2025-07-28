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

    public AuthResponse login(LoginRequest request) {
        log.info("Attempting login for user: {}", request.getUsername());
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found after authentication"));

        log.info("User {} logged in successfully", request.getUsername());

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .user(mapToUserResponse(user))
            .build();
    }

    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user: {}", request.getUsername());
        
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username '" + request.getUsername() + "' already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email '" + request.getEmail() + "' already exists");
        }

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .role(request.getRole() != null ? request.getRole() : Role.STUDENT) // Use provided role or default to STUDENT
            .build();

        User savedUser = userRepository.save(user);

        // Create authentication token for automatic login after registration
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            savedUser.getUsername(), 
            request.getPassword()
        );

        String accessToken = tokenProvider.generateTokenFromUsername(savedUser.getUsername());
        String refreshToken = tokenProvider.generateRefreshTokenFromUsername(savedUser.getUsername());

        log.info("User {} registered successfully", request.getUsername());

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .user(mapToUserResponse(savedUser))
            .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        
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
                .user(mapToUserResponse(user))
                .build();
        } else {
            throw new RuntimeException("Invalid refresh token");
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

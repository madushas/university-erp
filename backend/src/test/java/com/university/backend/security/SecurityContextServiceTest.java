package com.university.backend.security;

import com.university.backend.modules.core.entity.Role;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityContextServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private SecurityContextService securityContextService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .role(Role.STUDENT)
                .build();

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void getCurrentUser_WithValidAuthentication_ReturnsUser() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = securityContextService.getCurrentUser();

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testUser, result.get());
    }

    @Test
    void getCurrentUser_WithNoAuthentication_ReturnsEmpty() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(null);

        // Act
        Optional<User> result = securityContextService.getCurrentUser();

        // Assert
        assertFalse(result.isPresent());
    }

    @Test
    void getCurrentUserOrThrow_WithValidAuthentication_ReturnsUser() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        User result = securityContextService.getCurrentUserOrThrow();

        // Assert
        assertEquals(testUser, result);
    }

    @Test
    void getCurrentUserOrThrow_WithNoAuthentication_ThrowsException() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(null);

        // Act & Assert
        assertThrows(SecurityException.class, () -> securityContextService.getCurrentUserOrThrow());
    }

    @Test
    void currentUserOwnsResource_WithMatchingUserId_ReturnsTrue() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        boolean result = securityContextService.currentUserOwnsResource(1L);

        // Assert
        assertTrue(result);
    }

    @Test
    void currentUserOwnsResource_WithDifferentUserId_ReturnsFalse() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        boolean result = securityContextService.currentUserOwnsResource(2L);

        // Assert
        assertFalse(result);
    }

    @Test
    void isCurrentUserStudent_WithStudentRole_ReturnsTrue() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        boolean result = securityContextService.isCurrentUserStudent();

        // Assert
        assertTrue(result);
    }

    @Test
    void validateResourceAccess_WithOwner_DoesNotThrow() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertDoesNotThrow(() -> securityContextService.validateResourceAccess(1L));
    }

    @Test
    void validateResourceAccess_WithNonOwner_ThrowsException() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(SecurityException.class, () -> securityContextService.validateResourceAccess(2L));
    }
}
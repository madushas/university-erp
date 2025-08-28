package com.university.backend.security;

import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service for handling security context operations and current user retrieval
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityContextService {
    
    private final UserRepository userRepository;
    
    /**
     * Get the current authenticated user from security context
     * @return Optional containing the current user, empty if not authenticated
     */
    public Optional<User> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                log.debug("No authenticated user found in security context");
                return Optional.empty();
            }
            
            String username = null;
            Object principal = authentication.getPrincipal();
            
            if (principal instanceof UserDetails) {
                username = ((UserDetails) principal).getUsername();
            } else if (principal instanceof String) {
                username = (String) principal;
            }
            
            if (username == null) {
                log.debug("Could not extract username from authentication principal");
                return Optional.empty();
            }
            
            return userRepository.findByUsername(username);
            
        } catch (Exception e) {
            log.error("Error retrieving current user from security context", e);
            return Optional.empty();
        }
    }
    
    /**
     * Get the current authenticated user, throwing exception if not found
     * @return Current user
     * @throws SecurityException if no authenticated user is found
     */
    public User getCurrentUserOrThrow() {
        return getCurrentUser()
            .orElseThrow(() -> new SecurityException("No authenticated user found"));
    }
    
    /**
     * Get the current authenticated username
     * @return Optional containing the current username, empty if not authenticated
     */
    public Optional<String> getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return Optional.empty();
            }
            
            Object principal = authentication.getPrincipal();
            
            if (principal instanceof UserDetails) {
                return Optional.of(((UserDetails) principal).getUsername());
            } else if (principal instanceof String) {
                return Optional.of((String) principal);
            }
            
            return Optional.empty();
            
        } catch (Exception e) {
            log.error("Error retrieving current username from security context", e);
            return Optional.empty();
        }
    }
    
    /**
     * Check if the current user owns the specified resource by user ID
     * @param userId The user ID to check ownership against
     * @return true if current user owns the resource, false otherwise
     */
    public boolean currentUserOwnsResource(Long userId) {
        if (userId == null) {
            return false;
        }
        
        return getCurrentUser()
            .map(user -> user.getId().equals(userId))
            .orElse(false);
    }
    
    /**
     * Check if the current user has admin privileges
     * @return true if current user is admin, false otherwise
     */
    public boolean isCurrentUserAdmin() {
        return getCurrentUser()
            .map(user -> user.getRole().name().equals("ADMIN"))
            .orElse(false);
    }
    
    /**
     * Check if the current user has HR privileges
     * @return true if current user has HR role, false otherwise
     */
    public boolean isCurrentUserHR() {
        return getCurrentUser()
            .map(user -> user.getRole().name().equals("HR"))
            .orElse(false);
    }
    
    /**
     * Check if the current user has faculty privileges
     * @return true if current user is faculty, false otherwise
     */
    public boolean isCurrentUserFaculty() {
        return getCurrentUser()
            .map(user -> user.getRole().name().equals("FACULTY"))
            .orElse(false);
    }
    
    /**
     * Check if the current user has student privileges
     * @return true if current user is student, false otherwise
     */
    public boolean isCurrentUserStudent() {
        return getCurrentUser()
            .map(user -> user.getRole().name().equals("STUDENT"))
            .orElse(false);
    }
    
    /**
     * Validate that current user can access resource owned by specified user ID
     * Admins can access any resource, others can only access their own
     * @param resourceOwnerId The ID of the user who owns the resource
     * @throws SecurityException if access is not allowed
     */
    public void validateResourceAccess(Long resourceOwnerId) {
        User currentUser = getCurrentUserOrThrow();
        
        // Admins can access any resource
        if (isCurrentUserAdmin()) {
            return;
        }
        
        // Users can only access their own resources
        if (!currentUser.getId().equals(resourceOwnerId)) {
            throw new SecurityException("Access denied: User can only access their own resources");
        }
    }
    
    /**
     * Validate that current user can access student-specific resource
     * Students can only access their own data, staff/faculty/admin can access any
     * @param studentId The ID of the student whose resource is being accessed
     * @throws SecurityException if access is not allowed
     */
    public void validateStudentResourceAccess(Long studentId) {
        User currentUser = getCurrentUserOrThrow();
        
        // Admin, HR, Faculty, and Academic Staff can access any student resource
        if (isCurrentUserAdmin() || isCurrentUserHR() || isCurrentUserFaculty()) {
            return;
        }
        
        // Students can only access their own resources
        if (isCurrentUserStudent() && !currentUser.getId().equals(studentId)) {
            throw new SecurityException("Access denied: Students can only access their own academic records");
        }
    }
}
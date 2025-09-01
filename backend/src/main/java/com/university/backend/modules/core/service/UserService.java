package com.university.backend.modules.core.service;

import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.entity.UserStatus;
import com.university.backend.modules.core.entity.Role;
import com.university.backend.modules.core.repository.UserRepository;
import com.university.backend.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        log.info("Fetching all users");
        return userRepository.findAll();
    }
    
    @Cacheable(value = "users", key = "#id")
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        log.info("Fetching user by id: {}", id);
        return userRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public User getUserByIdOrThrow(Long id) {
        log.info("Fetching user by id: {}", id);
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }
    
    @Cacheable(value = "users", key = "#username")
    @Transactional(readOnly = true)
    public Optional<User> getUserByUsername(String username) {
        log.info("Fetching user by username: {}", username);
        return userRepository.findByUsername(username);
    }
    
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        log.info("Fetching user by email: {}", email);
        return userRepository.findByEmail(email);
    }
    
    @CacheEvict(value = "users", allEntries = true)
    public User createUser(User user) {
        log.info("Creating new user with username: {}", user.getUsername());
        validateUserBeforeCreation(user);
        User savedUser = userRepository.save(user);
        log.info("User created successfully with id: {}", savedUser.getId());
        return savedUser;
    }
    
    @CacheEvict(value = "users", allEntries = true)
    public User updateUser(User user) {
        log.info("Updating user with id: {}", user.getId());
        validateUserBeforeUpdate(user);
        User updatedUser = userRepository.save(user);
        log.info("User updated successfully with id: {}", updatedUser.getId());
        return updatedUser;
    }
    
    public void deleteUser(Long id) {
        log.info("Deleting user with id: {}", id);
        User user = getUserByIdOrThrow(id);
        
        // Soft delete - update status instead of hard delete
        user.setStatus(UserStatus.INACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("User soft-deleted successfully with id: {}", id);
    }
    
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }
    
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByRole(Role role) {
        log.info("Fetching users by role: {}", role);
        return userRepository.findByRole(role);
    }

    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        log.info("Fetching active users");
        return userRepository.findByStatus(UserStatus.ACTIVE);
    }

    /**
     * Update user's last login timestamp
     */
    public void updateLastLogin(Long userId) {
        log.info("Updating last login for user: {}", userId);
        User user = getUserByIdOrThrow(userId);
        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0); // Reset failed attempts on successful login
        userRepository.save(user);
    }

    /**
     * Increment failed login attempts
     */
    public void incrementFailedLoginAttempts(String username) {
        log.info("Incrementing failed login attempts for user: {}", username);
        Optional<User> userOpt = getUserByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            
            // Lock account after 5 failed attempts
            if (user.getFailedLoginAttempts() >= 5) {
                user.setAccountLockedUntil(LocalDateTime.now().plusHours(1));
                log.warn("Account locked for user: {} due to too many failed login attempts", username);
            }
            
            userRepository.save(user);
        }
    }

    /**
     * Check if user account is locked
     */
    @Transactional(readOnly = true)
    public boolean isAccountLocked(String username) {
        Optional<User> userOpt = getUserByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return user.getAccountLockedUntil() != null && 
                   user.getAccountLockedUntil().isAfter(LocalDateTime.now());
        }
        return false;
    }

    /**
     * Validate user before creation
     */
    private void validateUserBeforeCreation(User user) {
        if (existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + user.getUsername());
        }
        
        if (existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }

        if (user.getEmployeeId() != null && userRepository.existsByEmployeeId(user.getEmployeeId())) {
            throw new IllegalArgumentException("Employee ID already exists: " + user.getEmployeeId());
        }

        if (user.getStudentId() != null && userRepository.existsByStudentId(user.getStudentId())) {
            throw new IllegalArgumentException("Student ID already exists: " + user.getStudentId());
        }
    }

    /**
     * Validate user before update
     */
    private void validateUserBeforeUpdate(User user) {
        if (user.getId() == null) {
            throw new IllegalArgumentException("User ID is required for update");
        }

        // Check if user exists
        User existingUser = getUserByIdOrThrow(user.getId());

        // Check username uniqueness if changed
        if (!existingUser.getUsername().equals(user.getUsername()) && 
            existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + user.getUsername());
        }

        // Check email uniqueness if changed
        if (!existingUser.getEmail().equals(user.getEmail()) && 
            existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
    }
}
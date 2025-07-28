package com.university.backend.modules.core.repository;

import com.university.backend.modules.core.entity.Role;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByEmployeeId(String employeeId);
    
    boolean existsByStudentId(String studentId);
    
    List<User> findByRole(Role role);
    
    Page<User> findByRole(Role role, Pageable pageable);
    
    List<User> findByStatus(UserStatus status);
    
    Page<User> findByStatus(UserStatus status, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = :status")
    List<User> findByRoleAndStatus(@Param("role") Role role, @Param("status") UserStatus status);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = :status")
    Page<User> findByRoleAndStatus(@Param("role") Role role, @Param("status") UserStatus status, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.department = :department")
    List<User> findByDepartment(@Param("department") String department);
    
    @Query("SELECT u FROM User u WHERE u.role = 'STUDENT' AND u.yearOfStudy = :year")
    List<User> findStudentsByYear(@Param("year") Integer year);
    
    @Query("SELECT u FROM User u WHERE u.firstName LIKE %:name% OR u.lastName LIKE %:name%")
    List<User> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT u FROM User u WHERE u.studentId = :studentId")
    Optional<User> findByStudentId(@Param("studentId") String studentId);
    
    @Query("SELECT u FROM User u WHERE u.employeeId = :employeeId")
    Optional<User> findByEmployeeId(@Param("employeeId") String employeeId);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'STUDENT' AND u.status = 'ACTIVE'")
    long countActiveStudents();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'ADMIN' AND u.status = 'ACTIVE'")
    long countActiveFaculty();
    
    @Query("SELECT u FROM User u WHERE u.role = 'STUDENT' AND u.gpa >= :minGpa ORDER BY u.gpa DESC")
    List<User> findStudentsWithMinGpa(@Param("minGpa") Double minGpa);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.registrations WHERE u.username = :username")
    Optional<User> findByUsernameWithRegistrations(@Param("username") String username);
    
    boolean existsByDepartment(String department);
}
package com.university.backend.modules.academic.repository;

import com.university.backend.modules.academic.entity.Department;
import com.university.backend.modules.academic.entity.DepartmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    Optional<Department> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<Department> findByStatus(DepartmentStatus status);
    
    List<Department> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT d FROM Department d WHERE d.headOfDepartment = :headName")
    List<Department> findByHeadOfDepartment(@Param("headName") String headName);
    
    @Query("SELECT d FROM Department d WHERE d.building = :building")
    List<Department> findByBuilding(@Param("building") String building);
    
    @Query("SELECT d FROM Department d WHERE d.status = 'ACTIVE' ORDER BY d.name")
    List<Department> findActiveDepartmentsOrderByName();
}
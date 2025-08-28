package com.university.backend.modules.academic.repository;

import com.university.backend.modules.academic.entity.AcademicProgram;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicProgramRepository extends JpaRepository<AcademicProgram, Long> {
    
    List<AcademicProgram> findByDepartmentId(Long departmentId);
    
    @Query("SELECT ap FROM AcademicProgram ap WHERE ap.department.id = :departmentId AND ap.status = 'ACTIVE'")
    List<AcademicProgram> findActiveProgramsByDepartment(@Param("departmentId") Long departmentId);
    
    Optional<AcademicProgram> findByNameAndDepartmentId(String name, Long departmentId);
    
    @Query("SELECT ap FROM AcademicProgram ap WHERE ap.degreeType = :degreeType AND ap.status = 'ACTIVE'")
    Page<AcademicProgram> findByDegreeType(@Param("degreeType") String degreeType, Pageable pageable);
    
    @Query("SELECT ap FROM AcademicProgram ap WHERE ap.status = 'ACTIVE' ORDER BY ap.name")
    List<AcademicProgram> findAllActivePrograms();
}

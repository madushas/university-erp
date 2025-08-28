package com.university.backend.modules.student.repository;

import com.university.backend.modules.student.entity.StudentAcademicRecord;
import com.university.backend.modules.student.entity.StudentAcademicRecord.AcademicStanding;
import com.university.backend.modules.student.entity.StudentAcademicRecord.EnrollmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAcademicRecordRepository extends JpaRepository<StudentAcademicRecord, Long> {
    
    List<StudentAcademicRecord> findByStudentId(Long studentId);
    
    List<StudentAcademicRecord> findByEnrollmentStatus(EnrollmentStatus enrollmentStatus);
    
    List<StudentAcademicRecord> findByAcademicStanding(AcademicStanding academicStanding);
    
    @Query("SELECT sar FROM StudentAcademicRecord sar WHERE sar.student.id = :studentId ORDER BY sar.recordDate DESC")
    List<StudentAcademicRecord> findByStudentIdOrderByRecordDateDesc(@Param("studentId") Long studentId);
    
    @Query("SELECT sar FROM StudentAcademicRecord sar WHERE sar.student.id = :studentId AND sar.recordDate = " +
           "(SELECT MAX(sar2.recordDate) FROM StudentAcademicRecord sar2 WHERE sar2.student.id = :studentId)")
    Optional<StudentAcademicRecord> findLatestByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT sar FROM StudentAcademicRecord sar WHERE sar.academicProgram.id = :programId")
    List<StudentAcademicRecord> findByAcademicProgramId(@Param("programId") Long programId);
    
    @Query("SELECT sar FROM StudentAcademicRecord sar WHERE sar.academicSemester.id = :semesterId")
    List<StudentAcademicRecord> findByAcademicSemesterId(@Param("semesterId") Long semesterId);
    
    @Query("SELECT sar FROM StudentAcademicRecord sar WHERE sar.cumulativeGpa >= :minGpa")
    List<StudentAcademicRecord> findByMinimumGpa(@Param("minGpa") BigDecimal minGpa);
    
    @Query("SELECT sar FROM StudentAcademicRecord sar WHERE sar.deansListEligible = true")
    List<StudentAcademicRecord> findDeansListStudents();
    
    @Query("SELECT sar FROM StudentAcademicRecord sar WHERE sar.graduationEligibilityVerified = true")
    List<StudentAcademicRecord> findGraduationEligibleStudents();
    
    @Query("SELECT sar FROM StudentAcademicRecord sar WHERE sar.expectedGraduationDate BETWEEN :startDate AND :endDate")
    List<StudentAcademicRecord> findByExpectedGraduationDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT sar FROM StudentAcademicRecord sar " +
           "LEFT JOIN FETCH sar.student " +
           "LEFT JOIN FETCH sar.academicProgram " +
           "LEFT JOIN FETCH sar.academicYear " +
           "LEFT JOIN FETCH sar.academicSemester " +
           "WHERE sar.id = :id")
    Optional<StudentAcademicRecord> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT COUNT(sar) FROM StudentAcademicRecord sar WHERE sar.academicStanding = :standing")
    Long countByAcademicStanding(@Param("standing") AcademicStanding standing);
    
    @Query("SELECT COUNT(sar) FROM StudentAcademicRecord sar WHERE sar.enrollmentStatus = :status")
    Long countByEnrollmentStatus(@Param("status") EnrollmentStatus status);
    
    @Query("SELECT AVG(sar.cumulativeGpa) FROM StudentAcademicRecord sar WHERE sar.enrollmentStatus = 'ACTIVE'")
    BigDecimal findAverageCumulativeGpa();
    
    @Query("SELECT sar FROM StudentAcademicRecord sar WHERE sar.academicStanding IN ('ACADEMIC_PROBATION', 'ACADEMIC_SUSPENSION') ORDER BY sar.recordDate DESC")
    List<StudentAcademicRecord> findStudentsOnProbationOrSuspension();
    
    Page<StudentAcademicRecord> findByEnrollmentStatus(EnrollmentStatus enrollmentStatus, Pageable pageable);
    
    Page<StudentAcademicRecord> findByAcademicStanding(AcademicStanding academicStanding, Pageable pageable);
    
    List<StudentAcademicRecord> findByStudentIdOrderByAcademicYearDesc(Long studentId);
    
    @Query("SELECT s FROM StudentAcademicRecord s WHERE s.student.id = :studentId AND s.enrollmentStatus = 'ACTIVE' ORDER BY s.effectiveDate DESC")
    Page<StudentAcademicRecord> findCurrentRecordsByStudentId(@Param("studentId") Long studentId, Pageable pageable);
    
    Page<StudentAcademicRecord> findByAcademicProgramIdAndAcademicSemesterId(Long programId, Long semesterId, Pageable pageable);
    
    @Query("SELECT s FROM StudentAcademicRecord s WHERE s.graduationEligibilityVerified = true AND s.enrollmentStatus = 'ACTIVE'")
    List<StudentAcademicRecord> findEligibleForGraduation();
    
    Long countByAcademicProgramIdAndAcademicYearId(Long programId, Long academicYearId);
    
    @Query("SELECT AVG(s.cumulativeGpa) FROM StudentAcademicRecord s WHERE s.academicProgram.id = :programId AND s.academicYear.id = :academicYearId")
    Double getAverageGpaByProgram(@Param("programId") Long programId, @Param("academicYearId") Long academicYearId);
    
    @Query("SELECT COUNT(s) FROM StudentAcademicRecord s WHERE s.academicProgram.id = :programId AND s.academicYear.id = :academicYearId AND s.enrollmentStatus = 'GRADUATED'")
    Long countGraduatedStudents(@Param("programId") Long programId, @Param("academicYearId") Long academicYearId);

}

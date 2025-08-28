package com.university.backend.modules.student.repository;

import com.university.backend.modules.student.entity.Application;
import com.university.backend.modules.student.entity.Application.ApplicationStatus;
import com.university.backend.modules.student.entity.Application.ApplicationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    Optional<Application> findByApplicationNumber(String applicationNumber);
    
    List<Application> findByApplicantId(Long applicantId);
    
    List<Application> findByStatus(ApplicationStatus status);
    
    List<Application> findByApplicationType(ApplicationType applicationType);
    
    Page<Application> findByStatus(ApplicationStatus status, Pageable pageable);
    
    Page<Application> findByApplicationType(ApplicationType applicationType, Pageable pageable);
    
    @Query("SELECT a FROM Application a WHERE a.applicant.id = :applicantId ORDER BY a.applicationDate DESC")
    List<Application> findByApplicantIdOrderByApplicationDateDesc(@Param("applicantId") Long applicantId);
    
    @Query("SELECT a FROM Application a WHERE a.academicProgram.id = :programId")
    List<Application> findByAcademicProgramId(@Param("programId") Long programId);
    
    @Query("SELECT a FROM Application a WHERE a.applicationDeadline BETWEEN :startDate AND :endDate")
    List<Application> findByApplicationDeadlineBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT a FROM Application a WHERE a.status = :status AND a.reviewStatus = :reviewStatus")
    List<Application> findByStatusAndReviewStatus(@Param("status") ApplicationStatus status, @Param("reviewStatus") Application.ReviewStatus reviewStatus);
    
    @Query("SELECT a FROM Application a WHERE a.academicYear.id = :academicYearId AND a.academicSemester.id = :semesterId")
    List<Application> findByAcademicYearAndSemester(@Param("academicYearId") Long academicYearId, @Param("semesterId") Long semesterId);
    
    @Query("SELECT a FROM Application a " +
           "LEFT JOIN FETCH a.applicant " +
           "LEFT JOIN FETCH a.academicProgram " +
           "LEFT JOIN FETCH a.academicYear " +
           "LEFT JOIN FETCH a.academicSemester " +
           "WHERE a.id = :id")
    Optional<Application> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT COUNT(a) FROM Application a WHERE a.status = :status")
    Long countByStatus(@Param("status") ApplicationStatus status);
    
    @Query("SELECT COUNT(a) FROM Application a WHERE a.academicProgram.id = :programId AND a.status = :status")
    Long countByAcademicProgramIdAndStatus(@Param("programId") Long programId, @Param("status") ApplicationStatus status);
    
    @Query("SELECT a FROM Application a WHERE a.applicationFeePaid = false AND a.applicationFeeWaived = false")
    List<Application> findApplicationsWithOutstandingFees();
    
    @Query("SELECT a FROM Application a WHERE a.submittedDate IS NOT NULL AND a.lastReviewedDate IS NULL")
    List<Application> findUnreviewedApplications();
    
    @Query("SELECT a FROM Application a WHERE a.status IN :statuses ORDER BY a.applicationDate DESC")
    Page<Application> findByStatusInOrderByApplicationDateDesc(@Param("statuses") List<ApplicationStatus> statuses, Pageable pageable);
    
    // Additional methods for ApplicationService
    
    Page<Application> findByReviewStatus(Application.ReviewStatus reviewStatus, Pageable pageable);
    
    Long countByAcademicYearId(Long academicYearId);
    
    Long countByAcademicYearIdAndStatus(Long academicYearId, ApplicationStatus status);
    
    Long countByApplicationDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Application> findByApplicationDeadlineLessThanAndStatusIn(LocalDate deadline, List<ApplicationStatus> statuses);
    
    Page<Application> findByAcademicProgramIdAndAcademicYearId(Long programId, Long academicYearId, Pageable pageable);

}

package com.university.backend.repository;

import com.university.backend.entity.LeaveRequest;
import com.university.backend.entity.LeaveRequestStatus;
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
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    Optional<LeaveRequest> findByRequestNumber(String requestNumber);
    
    List<LeaveRequest> findByEmployeeId(Long employeeId);
    
    List<LeaveRequest> findByStatus(LeaveRequestStatus status);
    
    Page<LeaveRequest> findByEmployeeIdAndStatus(
        Long employeeId, LeaveRequestStatus status, Pageable pageable);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.startDate <= :endDate AND lr.endDate >= :startDate")
    List<LeaveRequest> findOverlappingRequests(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.id = :employeeId AND lr.startDate <= :endDate AND lr.endDate >= :startDate AND lr.status IN :statuses")
    List<LeaveRequest> findEmployeeOverlappingRequests(
        @Param("employeeId") Long employeeId,
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate,
        @Param("statuses") List<LeaveRequestStatus> statuses);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.status = 'PENDING' ORDER BY lr.createdAt ASC")
    List<LeaveRequest> findPendingRequestsOrderByCreatedDate();
    
    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.status = :status")
    long countByStatus(@Param("status") LeaveRequestStatus status);
    
    @Query("SELECT SUM(lr.totalDays) FROM LeaveRequest lr WHERE lr.employee.id = :employeeId AND lr.leaveType.id = :leaveTypeId AND lr.status IN :statuses AND EXTRACT(YEAR FROM lr.startDate) = :year")
    Double sumDaysByEmployeeAndLeaveTypeAndYear(
        @Param("employeeId") Long employeeId,
        @Param("leaveTypeId") Long leaveTypeId,
        @Param("statuses") List<LeaveRequestStatus> statuses,
        @Param("year") Integer year);
}
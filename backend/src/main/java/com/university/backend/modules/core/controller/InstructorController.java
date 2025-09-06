package com.university.backend.modules.core.controller;

import com.university.backend.modules.core.dto.InstructorDto;
import com.university.backend.modules.core.entity.Role;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.entity.UserStatus;
import com.university.backend.modules.core.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/instructors")
@RequiredArgsConstructor
@Tag(name = "Instructor Management", description = "APIs for managing instructor information")
public class InstructorController {

    private final UserRepository userRepository;

    @Operation(summary = "Get all active instructors", description = "Retrieve all active instructors for course assignment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved instructors"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<InstructorDto>> getAllActiveInstructors() {
        List<User> instructors = userRepository.findByRoleAndStatus(Role.INSTRUCTOR, UserStatus.ACTIVE);
        
        List<InstructorDto> instructorDtos = instructors.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(instructorDtos);
    }

    @Operation(summary = "Get instructor by ID", description = "Retrieve a specific instructor by their ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved instructor"),
        @ApiResponse(responseCode = "404", description = "Instructor not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<InstructorDto> getInstructorById(@PathVariable Long id) {
        return userRepository.findById(id)
            .filter(user -> user.getRole() == Role.INSTRUCTOR)
            .map(this::convertToDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Search instructors by name", description = "Search instructors by first or last name")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved instructors"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<InstructorDto>> searchInstructors(@RequestParam String name) {
        List<User> instructors = userRepository.findByNameContaining(name).stream()
            .filter(user -> user.getRole() == Role.INSTRUCTOR && user.getStatus() == UserStatus.ACTIVE)
            .collect(Collectors.toList());
            
        List<InstructorDto> instructorDtos = instructors.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(instructorDtos);
    }

    private InstructorDto convertToDto(User user) {
        return InstructorDto.builder()
            .id(user.getId())
            .username(user.getUsername())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .department(user.getDepartment())
            .employeeId(user.getEmployeeId())
            .build();
    }
}

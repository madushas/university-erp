package com.university.backend.modules.core.controller;

import com.university.backend.dto.response.UserResponse;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.mapper.DtoMapper;
import com.university.backend.security.SecurityContextService;
import com.university.backend.dto.request.UpdateProfileRequest;
import com.university.backend.modules.core.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "User management APIs")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final SecurityContextService securityContextService;
    private final DtoMapper dtoMapper;
    private final UserService userService;

    @Operation(summary = "Get current user", description = "Get the currently authenticated user's profile")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved user profile"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token")
    })
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        User currentUser = securityContextService.getCurrentUserOrThrow();
        UserResponse userResponse = dtoMapper.toUserResponse(currentUser);
        return ResponseEntity.ok(userResponse);
    }

    @Operation(summary = "Update current user", description = "Update the currently authenticated user's profile (limited fields)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully updated user profile"),
        @ApiResponse(responseCode = "400", description = "Bad request - invalid payload"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token")
    })
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(@Valid @RequestBody UpdateProfileRequest request) {
        User currentUser = securityContextService.getCurrentUserOrThrow();

        // Allow limited fields to be updated by the user themself
        if (request.getFirstName() != null) currentUser.setFirstName(request.getFirstName());
        if (request.getLastName() != null) currentUser.setLastName(request.getLastName());
        // Email updates are not allowed via self-service

        if (request.getPhoneNumber() != null) currentUser.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) currentUser.setAddress(request.getAddress());
        if (request.getCity() != null) currentUser.setCity(request.getCity());
        if (request.getState() != null) currentUser.setState(request.getState());
        if (request.getPostalCode() != null) currentUser.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) currentUser.setCountry(request.getCountry());

        User updated = userService.updateUser(currentUser);
        return ResponseEntity.ok(dtoMapper.toUserResponse(updated));
    }
}

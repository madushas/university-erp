package com.university.backend.modules.core.controller;

import com.university.backend.dto.response.UserResponse;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.mapper.DtoMapper;
import com.university.backend.security.SecurityContextService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "User management APIs")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final SecurityContextService securityContextService;
    private final DtoMapper dtoMapper;

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
}

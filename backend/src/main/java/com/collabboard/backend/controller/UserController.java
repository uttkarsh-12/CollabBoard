package com.collabboard.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.collabboard.backend.dto.UserRequest;
import com.collabboard.backend.dto.UserResponse;
import com.collabboard.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

   @PostMapping
public ResponseEntity<UserResponse> createUser(
        @Valid @RequestBody UserRequest request) {

    UserResponse response = userService.createUser(request);

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
}

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }
    @GetMapping("/me")
public ResponseEntity<UserResponse> getCurrentUser(
        Authentication authentication) {

    String email = authentication.getName();

    return ResponseEntity.ok(
            userService.getUserByEmail(email)
    );
}
}




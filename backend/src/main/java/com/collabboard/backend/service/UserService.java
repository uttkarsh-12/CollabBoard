package com.collabboard.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.collabboard.backend.dto.UserRequest;
import com.collabboard.backend.dto.UserResponse;
import com.collabboard.backend.entity.User;
import com.collabboard.backend.exception.EmailAlreadyExistsException;
import com.collabboard.backend.exception.UserNotFoundException;
import com.collabboard.backend.repository.UserRepository;
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
}



    public UserResponse createUser(UserRequest request) {

    // Check whether email already exists
    if (userRepository.existsByEmail(request.getEmail())) {
    throw new EmailAlreadyExistsException(
            "Email is already registered"
    );
}

    User user = new User();

    user.setName(request.getName());
    user.setEmail(request.getEmail());

    // Hash password before storing it
    user.setPassword(passwordEncoder.encode(request.getPassword()));

    User savedUser = userRepository.save(user);

    return new UserResponse(
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail()
    );
}

    public UserResponse getUserById(Long id) {

       User user = userRepository.findById(id)
        .orElseThrow(() ->
                new UserNotFoundException("User not found with id: " + id)
        );
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
    public UserResponse getUserByEmail(String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new UserNotFoundException("User not found")
            );

    return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail()
    );
}
}
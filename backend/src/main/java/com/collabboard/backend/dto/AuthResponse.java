package com.collabboard.backend.dto;

public class AuthResponse {

    private String token;
    private String tokenType;
    private Long userId;
    private String email;

    public AuthResponse(String token, Long userId, String email) {
        this.token = token;
        this.tokenType = "Bearer";
        this.userId = userId;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }
}
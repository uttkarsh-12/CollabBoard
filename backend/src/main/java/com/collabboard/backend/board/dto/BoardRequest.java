package com.collabboard.backend.board.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BoardRequest {

    @NotBlank(message = "Board title is required")
    @Size(max = 100, message = "Board title cannot exceed 100 characters")
    private String title;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
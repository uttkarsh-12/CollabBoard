
package com.collabboard.backend.board.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.collabboard.backend.board.dto.BoardRequest;
import com.collabboard.backend.board.dto.BoardResponse;
import com.collabboard.backend.board.entity.Board;
import com.collabboard.backend.board.service.BoardService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(
            @Valid @RequestBody BoardRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        Board board = boardService.createBoard(
                request.getTitle(),
                email
        );

        BoardResponse response = new BoardResponse(
                board.getId(),
                board.getTitle(),
                board.getOwner().getId(),
                board.getCreatedAt(),
                board.getUpdatedAt()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

@GetMapping
public ResponseEntity<List<BoardResponse>> getMyBoards(
        Authentication authentication) {

    String email = authentication.getName();

    List<BoardResponse> boards =
            boardService.getMyBoards(email);

    return ResponseEntity.ok(boards);
}
@GetMapping("/{boardId}")
public ResponseEntity<BoardResponse> getBoardById(
        @PathVariable Long boardId,
        Authentication authentication) {

    String email = authentication.getName();

    BoardResponse response =
            boardService.getBoardById(boardId, email);

    return ResponseEntity.ok(response);
}

@PutMapping("/{boardId}")
public ResponseEntity<BoardResponse> updateBoard(
        @PathVariable Long boardId,
        @Valid @RequestBody BoardRequest request,
        Authentication authentication) {

    BoardResponse response = boardService.updateBoard(
            boardId,
            request.getTitle(),
            authentication.getName()
    );

    return ResponseEntity.ok(response);
}

@DeleteMapping("/{boardId}")
public ResponseEntity<Void> deleteBoard(
        @PathVariable Long boardId,
        Authentication authentication) {

    boardService.deleteBoard(
            boardId,
            authentication.getName()
    );

    return ResponseEntity.noContent().build();
}

}

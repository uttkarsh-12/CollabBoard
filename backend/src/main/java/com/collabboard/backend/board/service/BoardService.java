
package com.collabboard.backend.board.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.collabboard.backend.board.dto.BoardResponse;
import com.collabboard.backend.board.entity.Board;
import com.collabboard.backend.board.repository.BoardRepository;
import com.collabboard.backend.entity.User;
import com.collabboard.backend.repository.UserRepository;
@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    public BoardService(
            BoardRepository boardRepository,
            UserRepository userRepository) {

        this.boardRepository = boardRepository;
        this.userRepository = userRepository;
    }

    public Board createBoard(String title, String email) {

        // Find the logged-in user
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Create a new board
        Board board = new Board();
        board.setTitle(title);
        board.setOwner(owner);

        // Save board in database
        return boardRepository.save(board);
    }

public List<BoardResponse> getMyBoards(String email) {

    User owner = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    List<Board> boards =
            boardRepository.findByOwnerId(owner.getId());

    return boards.stream()
            .map(board -> new BoardResponse(
                    board.getId(),
                    board.getTitle(),
                    owner.getId(),
                    board.getCreatedAt(),
                    board.getUpdatedAt()
            ))
            .toList();
}
public BoardResponse getBoardById(Long boardId, String email) {

    User owner = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Board board = boardRepository
            .findByIdAndOwnerId(boardId, owner.getId())
            .orElseThrow(() ->
                    new RuntimeException("Board not found"));

    return new BoardResponse(
            board.getId(),
            board.getTitle(),
            owner.getId(),
            board.getCreatedAt(),
            board.getUpdatedAt()
    );
}

public BoardResponse updateBoard(
        Long boardId,
        String title,
        String email) {

    User owner = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Board board = boardRepository
            .findByIdAndOwnerId(boardId, owner.getId())
            .orElseThrow(() ->
                    new RuntimeException("Board not found"));

    board.setTitle(title);

    Board updatedBoard = boardRepository.save(board);

    return new BoardResponse(
            updatedBoard.getId(),
            updatedBoard.getTitle(),
            owner.getId(),
            updatedBoard.getCreatedAt(),
            updatedBoard.getUpdatedAt()
    );
}


public void deleteBoard(Long boardId, String email) {

    User owner = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Board board = boardRepository
            .findByIdAndOwnerId(boardId, owner.getId())
            .orElseThrow(() ->
                    new RuntimeException("Board not found"));

    boardRepository.delete(board);
}

}

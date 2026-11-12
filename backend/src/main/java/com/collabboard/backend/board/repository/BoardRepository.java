
package com.collabboard.backend.board.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.collabboard.backend.board.entity.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {

    List<Board> findByOwnerId(Long ownerId);
Optional<Board> findByIdAndOwnerId(Long id, Long ownerId);
}

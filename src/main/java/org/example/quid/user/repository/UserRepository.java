package org.example.quid.user.repository;

import org.example.quid.user.entity.User;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u JOIN FETCH u.workspace WHERE u.email = :email")
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findAllByWorkspace(Workspace workspace);
    Optional<User> findByIdAndWorkspace(Long id, Workspace workspace);
}
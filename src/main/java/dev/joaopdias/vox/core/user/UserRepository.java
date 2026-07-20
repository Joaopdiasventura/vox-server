package dev.joaopdias.vox.core.user;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import dev.joaopdias.vox.core.user.entities.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    User findByEmail(String email);   
}
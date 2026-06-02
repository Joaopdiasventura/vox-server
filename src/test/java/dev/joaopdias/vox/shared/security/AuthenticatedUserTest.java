package dev.joaopdias.vox.shared.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

class AuthenticatedUserTest {
    @Test
    void exposesAuthenticatedUserId() {
        UUID id = UUID.randomUUID();

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(id);

        assertThat(authenticatedUser.id()).isEqualTo(id);
    }
}

package dev.joaopdias.vox.core.user;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.util.Arrays;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import dev.joaopdias.vox.core.user.entities.User;

class UserRepositoryTest {
    @Test
    void declaresJpaRepositoryContractWithoutConnectingToDatabase() throws Exception {
        assertThat(UserRepository.class).isInterface();
        assertThat(UserRepository.class.isAnnotationPresent(Repository.class)).isTrue();

        ParameterizedType jpaRepository = Arrays.stream(UserRepository.class.getGenericInterfaces())
            .filter(ParameterizedType.class::isInstance)
            .map(ParameterizedType.class::cast)
            .filter(type -> type.getRawType().equals(JpaRepository.class))
            .findFirst()
            .orElseThrow();

        assertThat(jpaRepository.getActualTypeArguments()).containsExactly(User.class, UUID.class);

        Method findByEmail = UserRepository.class.getMethod("findByEmail", String.class);
        assertThat(findByEmail.getReturnType()).isEqualTo(User.class);
    }
}

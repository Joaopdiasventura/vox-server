package dev.joaopdias.vox;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;

class VoxApplicationTests {

	@Test
	void isSpringBootApplication() {
		assertThat(VoxApplication.class.isAnnotationPresent(SpringBootApplication.class)).isTrue();
	}

}

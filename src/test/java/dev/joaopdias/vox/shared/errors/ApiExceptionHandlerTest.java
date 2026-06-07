package dev.joaopdias.vox.shared.errors;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

class ApiExceptionHandlerTest {
    private final ApiExceptionHandler handler = new ApiExceptionHandler();

    @Test
    void returnsResponseStatusExceptionReasonAsMessage() {
        ResponseStatusException exception = new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Conta não validada. Verifique seu email para validar a conta."
        );

        ResponseEntity<ApiExceptionHandler.ApiErrorResponse> response =
            handler.handleResponseStatusException(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody())
            .isEqualTo(new ApiExceptionHandler.ApiErrorResponse(
                "Conta não validada. Verifique seu email para validar a conta."
            ));
    }

    @Test
    void fallsBackToStatusCodeWhenReasonIsMissing() {
        ResponseStatusException exception = new ResponseStatusException(HttpStatus.NOT_FOUND);

        ResponseEntity<ApiExceptionHandler.ApiErrorResponse> response =
            handler.handleResponseStatusException(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody())
            .isEqualTo(new ApiExceptionHandler.ApiErrorResponse("404 NOT_FOUND"));
    }
}

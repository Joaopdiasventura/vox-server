package dev.joaopdias.vox.shared.errors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(ResponseStatusException exception) {
        String message = exception.getReason();

        if (message == null || message.isBlank())
            message = exception.getStatusCode().toString();

        return ResponseEntity
            .status(exception.getStatusCode())
            .body(new ApiErrorResponse(message));
    }

    public record ApiErrorResponse(String message) {
    }
}
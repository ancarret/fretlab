package com.fretlab.shared.error;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Single source of truth for API error responses.
 *
 * <p>Bodies follow RFC 9457 (<em>Problem Details for HTTP APIs</em>), which Spring models as
 * {@link ProblemDetail}, extended with two FretLab members: a stable {@code code} and a
 * {@code timestamp}. Extending {@link ResponseEntityExceptionHandler} keeps Spring's own status
 * mapping for framework exceptions — a wrong media type stays a 415 rather than collapsing into a
 * generic 500 — while giving one hook to decorate every response it produces.
 */
@RestControllerAdvice
class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body,
            HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {

        ResponseEntity<Object> response =
                super.handleExceptionInternal(ex, body, headers, statusCode, request);

        if (response != null && response.getBody() instanceof ProblemDetail problem) {
            decorate(problem, codeFor(ex, statusCode));
            if (ex instanceof NoResourceFoundException) {
                // Spring's default reads "No static resource ...", which leaks how an unmatched
                // path is resolved and means nothing to an API client.
                problem.setDetail("No endpoint matches this request.");
            }
            if (ex instanceof MethodArgumentNotValidException validation) {
                problem.setProperty("errors", fieldErrors(validation));
            }
        }
        return response;
    }

    /**
     * A broken musical rule is a client error, not a server fault: the request asked for something
     * that cannot exist, such as the note H or a fret past the end of the neck.
     */
    @ExceptionHandler(DomainException.class)
    ProblemDetail handleDomainRuleViolation(DomainException ex, HttpServletRequest request) {
        ProblemDetail problem =
                ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problem.setInstance(URI.create(request.getRequestURI()));
        decorate(problem, ex.code());
        return problem;
    }

    /** An application error with its own status — a duplicate email, bad login credentials. */
    @ExceptionHandler(ApiException.class)
    ProblemDetail handleApiException(ApiException ex, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(ex.status(), ex.getMessage());
        problem.setInstance(URI.create(request.getRequestURI()));
        decorate(problem, ex.code());
        return problem;
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception on {} {}", request.getMethod(), request.getRequestURI(), ex);

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error.");
        problem.setInstance(URI.create(request.getRequestURI()));
        decorate(problem, ErrorCode.INTERNAL_ERROR);
        return problem;
    }

    private static void decorate(ProblemDetail problem, ErrorCode code) {
        problem.setProperty("code", code.name());
        problem.setProperty("timestamp", Instant.now());
    }

    private static ErrorCode codeFor(Exception ex, HttpStatusCode status) {
        if (ex instanceof MethodArgumentNotValidException
                || ex instanceof HandlerMethodValidationException) {
            return ErrorCode.VALIDATION_FAILED;
        }
        if (ex instanceof NoResourceFoundException
                || status.value() == HttpStatus.NOT_FOUND.value()) {
            return ErrorCode.RESOURCE_NOT_FOUND;
        }
        return status.is5xxServerError() ? ErrorCode.INTERNAL_ERROR : ErrorCode.REQUEST_NOT_VALID;
    }

    private static Map<String, String> fieldErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return errors;
    }
}

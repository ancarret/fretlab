package com.fretlab.shared.error;

import org.springframework.http.HttpStatus;

/**
 * An application-level error that is not a music-theory rule violation — a duplicate email at
 * registration, bad login credentials — and so is not a {@link DomainException}, which is reserved
 * for the theory domain and is always a 400.
 *
 * <p>This carries its own {@link HttpStatus} because these errors are not all the same status: a
 * duplicate registration is a 409, bad credentials a 401.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final ErrorCode code;

    public ApiException(HttpStatus status, ErrorCode code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus status() {
        return status;
    }

    public ErrorCode code() {
        return code;
    }
}

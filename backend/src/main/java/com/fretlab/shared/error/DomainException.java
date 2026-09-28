package com.fretlab.shared.error;

/**
 * Thrown when a request violates a musical rule — an unparseable note, an interval that cannot
 * exist, a fret outside the neck.
 *
 * <p>It carries an {@link ErrorCode} so the API can report precisely what went wrong without a
 * translation layer between the domain and the web tier. The domain pays for that with knowledge
 * of a small, stable vocabulary of error codes; in exchange it stays free of any Spring or HTTP
 * type, and the exception needs no mapping code to become a correct response.
 */
public class DomainException extends RuntimeException {

    private final ErrorCode code;

    public DomainException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public ErrorCode code() {
        return code;
    }
}

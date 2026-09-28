package com.fretlab.shared.error;

/**
 * Stable, machine-readable identifiers clients can branch on.
 *
 * <p>Unlike the HTTP status and the human-readable message, these values are part of the API
 * contract and must not be renamed once published.
 */
public enum ErrorCode {

    // Transport-level
    VALIDATION_FAILED,
    RESOURCE_NOT_FOUND,
    REQUEST_NOT_VALID,
    INTERNAL_ERROR,
    UNAUTHENTICATED,

    // Auth / user domain
    EMAIL_ALREADY_REGISTERED,
    INVALID_CREDENTIALS,

    // Music theory domain
    INVALID_NOTE,
    INVALID_ACCIDENTAL,
    INVALID_INTERVAL,
    INVALID_FRET_POSITION,
    INVALID_CHORD_TYPE,
    INVALID_SCALE_TYPE,
    INVALID_INVERSION
}

package com.example.ticket.exception;

public class UnauthorizedException
    extends RuntimeException {

    public UnauthorizedException(
        String message
    ) {
        super(message);
    }

}
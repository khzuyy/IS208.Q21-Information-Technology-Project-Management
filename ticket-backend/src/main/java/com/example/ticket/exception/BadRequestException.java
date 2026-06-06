package com.example.ticket.exception;

public class BadRequestException
    extends RuntimeException {

    public BadRequestException(
        String message
    ) {

        super(message);

    }

}
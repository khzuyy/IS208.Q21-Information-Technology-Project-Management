package com.example.ticket.exception;

public class NotFoundException
    extends RuntimeException {

    public NotFoundException(
        String message
    ) {

        super(message);

    }

}
package com.example.ticket.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<String> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(e.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<String> handleNotFound(NotFoundException e) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(e.getMessage());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleEntityNotFound(EntityNotFoundException e) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(e.getMessage());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<String> handleDuplicate(DuplicateResourceException e) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(e.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<String> handleBadRequest(BadRequestException e) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneric(Exception e) {
        e.printStackTrace(); // in ra console để thấy lỗi thật
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Lỗi hệ thống: " + e.getMessage()); // trả về message thật khi dev
    }
}
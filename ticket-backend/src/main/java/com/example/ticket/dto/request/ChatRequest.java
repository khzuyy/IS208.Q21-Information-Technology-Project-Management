package com.example.ticket.dto.request;

public class ChatRequest {

    private String sessionId;
    private Long userId;      // null nếu chưa đăng nhập
    private String message;

    public ChatRequest() {}

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
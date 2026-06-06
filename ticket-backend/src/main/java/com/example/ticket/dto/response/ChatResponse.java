package com.example.ticket.dto.response;

public class ChatResponse {

    private boolean success;
    private String message;
    private String sessionId;
    private String error;

    public ChatResponse() {}

    public static ChatResponse ok(String message, String sessionId) {
        ChatResponse r = new ChatResponse();
        r.success   = true;
        r.message   = message;
        r.sessionId = sessionId;
        return r;
    }

    public static ChatResponse error(String error) {
        ChatResponse r = new ChatResponse();
        r.success = false;
        r.error   = error;
        return r;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
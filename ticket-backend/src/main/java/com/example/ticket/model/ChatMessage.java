package com.example.ticket.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CHAT_MESSAGES")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "chat_seq")
    @SequenceGenerator(name = "chat_seq", sequenceName = "CHAT_MSG_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "SESSION_ID", nullable = false, length = 100)
    private String sessionId;

    @Column(name = "USER_ID")
    private Long userId;

    // "user" hoặc "assistant"
    @Column(name = "ROLE", nullable = false, length = 20)
    private String role;

    @Lob
    @Column(name = "CONTENT", nullable = false)
    private String content;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
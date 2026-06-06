package com.example.ticket.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ticket.dto.request.ChatRequest;
import com.example.ticket.dto.response.ChatResponse;
import com.example.ticket.model.ChatMessage;
import com.example.ticket.service.ChatbotService;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    private static final Logger log = LoggerFactory.getLogger(ChatbotController.class);

    @Autowired
    private ChatbotService chatbotService;

    /**
     * POST /api/chatbot/chat
     * Body: { "sessionId": "abc", "userId": 1, "message": "Xin chao" }
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        if (request.getSessionId() == null || request.getMessage() == null
                || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ChatResponse.error("sessionId và message không được để trống"));
        }
        try {
            String reply = chatbotService.processMessage(
                    request.getSessionId(),
                    request.getUserId(),
                    request.getMessage()
            );
            return ResponseEntity.ok(ChatResponse.ok(reply, request.getSessionId()));
        } catch (Exception e) {
            log.error("Chatbot error for session {}", 
          request.getSessionId(), 
          e);
            return ResponseEntity.internalServerError()
                    .body(ChatResponse.error("Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau."));
        }
    }

    /**
     * GET /api/chatbot/history/{sessionId}
     */
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getHistory(@PathVariable String sessionId) {
        try {
            List<ChatMessage> history = chatbotService.getHistory(sessionId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Failed to retrieve history for session {}: {}", sessionId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * DELETE /api/chatbot/history/{sessionId}
     */
    @DeleteMapping("/history/{sessionId}")
    public ResponseEntity<Void> clearHistory(@PathVariable String sessionId) {
        chatbotService.clearHistory(sessionId);
        return ResponseEntity.noContent().build();
    }
}
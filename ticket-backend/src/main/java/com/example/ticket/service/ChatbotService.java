package com.example.ticket.service;

import com.example.ticket.model.ChatMessage;
import com.example.ticket.repository.ChatMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);
    private static final int MAX_HISTORY = 10;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatContextBuilder chatContextBuilder; // <-- THÊM MỚI

    // -------------------------------------------------------------------------
    // System prompt tĩnh (vai trò & quy tắc)
    // -------------------------------------------------------------------------
    private static final String BASE_SYSTEM_PROMPT = """
            Bạn là trợ lý hỗ trợ khách hàng của hệ thống bán vé sự kiện.

            Nhiệm vụ của bạn:
            - Giải đáp thắc mắc về đặt vé, hủy vé, hoàn tiền
            - Tra cứu thông tin sự kiện (thời gian, địa điểm, giá vé) từ dữ liệu được cung cấp
            - Hướng dẫn quy trình mua vé
            - Tra cứu đơn hàng của khách hàng từ dữ liệu được cung cấp
            - Hỗ trợ xử lý sự cố đơn hàng

            Quy tắc QUAN TRỌNG:
            - Luôn trả lời bằng tiếng Việt
            - Ngắn gọn, thân thiện, chuyên nghiệp
            - CHỈ sử dụng thông tin sự kiện và đơn hàng từ "DỮ LIỆU HỆ THỐNG" được cung cấp bên dưới
            - KHÔNG bịa thông tin về sự kiện, giá vé, hay đơn hàng
            - Nếu không tìm thấy thông tin trong dữ liệu, hãy nói thật và đề nghị khách gọi hotline: 1900-xxxx
            - Khi khách hỏi về đơn hàng cụ thể, tra trong danh sách đơn hàng được cung cấp
            """;

    // -------------------------------------------------------------------------
    // Core method — bây giờ inject context vào system prompt
    // -------------------------------------------------------------------------
    @Transactional
    public String processMessage(String sessionId, Long userId, String userMessage) throws Exception {
        // 1. Lưu tin nhắn của user
        ChatMessage userMsg = new ChatMessage();
        userMsg.setSessionId(sessionId);
        userMsg.setUserId(userId);
        userMsg.setRole("user");
        userMsg.setContent(userMessage);
        chatMessageRepository.save(userMsg);

        // 2. Lấy lịch sử gần nhất
        List<ChatMessage> recentHistory = chatMessageRepository
                .findRecentBySessionId(sessionId, MAX_HISTORY);

        // 3. Chuyển sang format cho Gemini
        List<Map<String, String>> historyForAI = recentHistory.stream()
                .map(msg -> Map.of("role", msg.getRole(), "content", msg.getContent()))
                .collect(Collectors.toList());

        // 4. Build system prompt = vai trò tĩnh + dữ liệu DB thật  <-- THÊM MỚI
        String dbContext = chatContextBuilder.buildContext(userId);
        String fullSystemPrompt = BASE_SYSTEM_PROMPT + dbContext;

        // 5. Gọi Gemini với prompt đã được inject dữ liệu thật
        log.info("Calling Gemini for session: {} (userId: {})", sessionId, userId);
        String aiReply = geminiService.chat(fullSystemPrompt, historyForAI);

        // 6. Lưu câu trả lời của AI
        ChatMessage aiMsg = new ChatMessage();
        aiMsg.setSessionId(sessionId);
        aiMsg.setUserId(userId);
        aiMsg.setRole("assistant");
        aiMsg.setContent(aiReply);
        chatMessageRepository.save(aiMsg);

        return aiReply;
    }

    public List<ChatMessage> getHistory(String sessionId) {
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public void clearHistory(String sessionId) {
        chatMessageRepository.deleteBySessionId(sessionId);
    }
}
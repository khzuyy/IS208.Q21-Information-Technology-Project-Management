package com.example.ticket.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Goi Gemini qua OpenAI-compatible endpoint cua Google.
 * Khong can SDK, dung Java HttpClient co san tu JDK 11+.
 *
 * Docs: https://ai.google.dev/gemini-api/docs/openai
 */
@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    // Gemini ho tro OpenAI-compatible format tai endpoint nay
    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String model;

    @Value("${gemini.max-tokens:1000}")
    private int maxTokens;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Goi Gemini voi lich su hoi thoai (multi-turn).
     * Signature giong het OpenAIService.chat() de ChatbotService khong phai sua.
     *
     * @param systemPrompt huong dan vai tro cho AI
     * @param history      [{role: "user"/"assistant", content: "..."}]
     * @return cau tra loi tu AI
     */
    public String chat(String systemPrompt, List<Map<String, String>> history) {
        try {
            // Xay dung mang messages
            ArrayNode messages = mapper.createArrayNode();

            // System message
            ObjectNode systemMsg = mapper.createObjectNode();
            systemMsg.put("role", "system");
            systemMsg.put("content", systemPrompt);
            messages.add(systemMsg);

            // Lich su hoi thoai
            for (Map<String, String> msg : history) {
                ObjectNode histMsg = mapper.createObjectNode();
                histMsg.put("role", msg.get("role"));
                histMsg.put("content", msg.get("content"));
                messages.add(histMsg);
            }

            // Request body — format OpenAI, Gemini chap nhan 100%
            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", maxTokens);
            body.set("messages", messages);

            String requestBody = mapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GEMINI_URL))
                    .header("Authorization", "Bearer " + apiKey)  // Gemini dung Bearer giong OpenAI
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(60))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini API error: {} - {}", response.statusCode(), response.body());

                throw new RuntimeException(
                    "Gemini HTTP " + response.statusCode()
                    + " | Response: " + response.body()
                );
            }

            // Response format giong OpenAI: choices[0].message.content
            JsonNode json = mapper.readTree(response.body());
            return json.at("/choices/0/message/content").asText();

        } catch (IOException | InterruptedException e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            Thread.currentThread().interrupt();
            throw new RuntimeException("Loi khi goi Gemini: " + e.getMessage());
        }
    }
}
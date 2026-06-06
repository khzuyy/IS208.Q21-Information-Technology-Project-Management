package com.example.ticket.repository;

import com.example.ticket.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    @Query(value = "SELECT * FROM (SELECT * FROM CHAT_MESSAGES WHERE SESSION_ID = :sessionId ORDER BY CREATED_AT DESC) WHERE ROWNUM <= :limit ORDER BY CREATED_AT ASC", nativeQuery = true)
    List<ChatMessage> findRecentBySessionId(@Param("sessionId") String sessionId, @Param("limit") int limit);

    void deleteBySessionId(String sessionId);
}
package com.projectc.model;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@MongoEntity(collection = "chat_sessions")
public class ChatSession extends PanacheMongoEntity {

    public String userId;
    public String title;
    public List<ChatMessage> messages = new ArrayList<>();
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    public ChatSession() {
    }

    public ChatSession(String userId, String initialTitle) {
        this.userId = userId;
        this.title = initialTitle;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void addMessage(String role, String content) {
        this.messages.add(new ChatMessage(role, content, LocalDateTime.now()));
        this.updatedAt = LocalDateTime.now();
    }

    public static class ChatMessage {
        public String role; // "user", "assistant"
        public String content;
        public LocalDateTime timestamp;

        public ChatMessage() {
        }

        public ChatMessage(String role, String content, LocalDateTime timestamp) {
            this.role = role;
            this.content = content;
            this.timestamp = timestamp;
        }
    }
}

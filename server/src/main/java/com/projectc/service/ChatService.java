package com.projectc.service;

import com.projectc.model.ChatSession;
import jakarta.enterprise.context.ApplicationScoped;
import org.bson.types.ObjectId;

import java.util.List;

@ApplicationScoped
public class ChatService {

    public ChatSession createSession(String userId, String initialTitle) {
        ChatSession session = new ChatSession(userId, initialTitle);
        session.persist();
        return session;
    }

    public ChatSession getSession(String sessionId) {
        if (sessionId == null || !ObjectId.isValid(sessionId)) {
            return null;
        }
        try {
            return ChatSession.findById(new ObjectId(sessionId));
        } catch (Exception e) {
            return null;
        }
    }

    public void addMessage(String sessionId, String role, String content) {
        try {
            ChatSession session = getSession(sessionId);
            if (session != null) {
                session.addMessage(role, content);
                session.update();
            }
        } catch (Exception e) {
            // Log but don't crash
            System.err.println("Failed to save chat message: " + e.getMessage());
        }
    }

    public void updateTitle(String sessionId, String newTitle) {
        try {
            ChatSession session = getSession(sessionId);
            if (session != null) {
                session.title = newTitle;
                session.update();
            }
        } catch (Exception e) {
            System.err.println("Failed to update chat title: " + e.getMessage());
        }
    }

    public List<ChatSession> getUserSessions(String userId) {
        return ChatSession.list("userId", userId);
    }
}

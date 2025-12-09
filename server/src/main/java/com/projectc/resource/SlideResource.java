package com.projectc.resource;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectc.model.GenerationHistory;
import com.projectc.service.SlideService;
import com.projectc.service.SlideService.SlideResponse;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SlideResource {

    @Inject
    SlideService slideService;

    @Inject
    com.projectc.service.ChatService chatService;

    @Inject
    ObjectMapper objectMapper;

    @POST
    @Path("/analyze")
    public Response analyze(GenerateRequest request) {
        try {
            SlideService.ArchitectResponse response = slideService.analyzeRequest(request.rawText());

            if ("CHAT".equals(response.intent()) && request.sessionId() != null) {
                try {
                    chatService.addMessage(request.sessionId(), "user", request.rawText());
                    chatService.addMessage(request.sessionId(), "assistant", response.reply());

                    // Title Gen for new chats
                    com.projectc.model.ChatSession session = chatService.getSession(request.sessionId());
                    if (session != null && "New Conversation".equals(session.title)) {
                        String newTitle = slideService.generateTitle(request.rawText());
                        chatService.updateTitle(request.sessionId(), newTitle);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to save chat history: " + e.getMessage());
                }
            }

            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.serverError().entity("Error interpreting request: " + e.getMessage()).build();
        }
    }

    @POST
    @Path("/render")
    public Response render(RenderRequest request) {
        try {
            // 1. Render Slide (Long Running)
            SlideService.SlideResponse response = slideService.renderSlide(null, request.strategy(), request.rawText());

            // 2. Persist History (Short Transaction)
            try {
                String jsonEntry = objectMapper.writeValueAsString(response);
                GenerationHistory history = new GenerationHistory(null, request.rawText(), jsonEntry,
                        response.actionTitle());
                history.persist();

                // 3. Update Chat Session if exists
                if (request.sessionId() != null) {
                    chatService.addMessage(request.sessionId(), "user", request.rawText());
                    chatService.addMessage(request.sessionId(), "assistant",
                            "Generated slide: " + response.actionTitle() + " #SLIDE_ID:" + history.id.toString());

                    // 4. Update Title if it's the first message (roughly)
                    com.projectc.model.ChatSession session = chatService.getSession(request.sessionId());
                    if (session != null && "New Conversation".equals(session.title)) {
                        String newTitle = slideService.generateTitle(request.rawText());
                        chatService.updateTitle(request.sessionId(), newTitle);
                    }
                }
            } catch (Exception e) {
                // Log persistence error but return successful response to user
                System.err.println("Persistence Failed: " + e.getMessage());
            }

            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.serverError().entity("Error rendering slide: " + e.getMessage()).build();
        }
    }

    @POST
    @Path("/chats")
    public Response createChat(StartChatRequest request) {
        com.projectc.model.ChatSession session = chatService.createSession(request.userId(), request.title());
        return Response.ok(session).build();
    }

    @GET
    @Path("/chats")
    public List<com.projectc.model.ChatSession> getUserChats(@QueryParam("userId") String userId) {
        return chatService.getUserSessions(userId);
    }

    @GET
    @Path("/chats/{id}")
    public Response getChat(@PathParam("id") String id) {
        com.projectc.model.ChatSession session = chatService.getSession(id);
        if (session == null)
            return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(session).build();
    }

    @DELETE
    @Path("/chats/{id}")
    public Response deleteChat(@PathParam("id") String id) {
        boolean deleted = chatService.deleteSession(id);
        if (!deleted)
            return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }

    @PUT
    @Path("/chats/{id}")
    public Response updateChatTitle(@PathParam("id") String id, UpdateChatRequest request) {
        chatService.updateTitle(id, request.title());
        return Response.ok().build();
    }

    @POST
    @Path("/generate")
    public Response generate(GenerateRequest request) {
        try {
            // Backward Compatibility Wrapper
            SlideService.SlideResponse response = slideService.generateSlide(request.rawText());

            // Persist
            try {
                String jsonEntry = objectMapper.writeValueAsString(response);
                GenerationHistory history = new GenerationHistory(null, request.rawText(), jsonEntry,
                        response.actionTitle());
                history.persist();

                if (request.sessionId() != null) {
                    chatService.addMessage(request.sessionId(), "user", request.rawText());
                    chatService.addMessage(request.sessionId(), "assistant",
                            "Generated slide: " + response.actionTitle() + " #SLIDE_ID:" + history.id.toString());

                    // Auto Rename Title
                    com.projectc.model.ChatSession session = chatService.getSession(request.sessionId());
                    if (session != null && "New Conversation".equals(session.title)) {
                        String newTitle = slideService.generateTitle(request.rawText());
                        chatService.updateTitle(request.sessionId(), newTitle);
                    }
                }
            } catch (Exception e) {
                System.err.println("Persistence Failed (Generate): " + e.getMessage());
            }
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.serverError().entity("Error generating slide: " + e.getMessage()).build();
        }
    }

    // Download endpoint removed as we are using Client-Side React rendering.

    @GET
    @Path("/history")
    public List<GenerationHistory> listHistory() {
        return GenerationHistory.listAll();
    }

    @GET
    @Path("/history/{id}")
    public Response getHistory(@PathParam("id") String id) {
        if (id == null || !org.bson.types.ObjectId.isValid(id)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        GenerationHistory history = GenerationHistory.findById(new org.bson.types.ObjectId(id));
        if (history == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(history).build();
    }

    // DTO
    public record GenerateRequest(String rawText, String sessionId) {
    }

    public record RenderRequest(com.projectc.service.SlideService.SlideStrategy strategy, String rawText,
            String sessionId) {
    }

    public record StartChatRequest(String userId, String title) {
    }

    public record UpdateChatRequest(String title) {
    }
}

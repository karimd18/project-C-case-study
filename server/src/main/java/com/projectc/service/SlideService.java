package com.projectc.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectc.client.AnthropicClient;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import com.projectc.model.GenerationHistory;

@ApplicationScoped
public class SlideService {

    private static final Logger LOG = LoggerFactory.getLogger(SlideService.class);

    @RestClient
    AnthropicClient anthropicClient;

    @ConfigProperty(name = "anthropic.model")
    String model;

    @ConfigProperty(name = "anthropic.api.key")
    String apiKey;

    @Inject
    ObjectMapper objectMapper;

    // 1. Analyze Request (Architect)
    public ArchitectResponse analyzeRequest(String userInput) {
        try {
            LOG.info("Step 1: Architect Analysis for: {}", userInput);
            return callArchitect(userInput);
        } catch (Exception e) {
            LOG.error("Architect Error", e);
            throw new RuntimeException("Architect Analysis Failed: " + e.getMessage());
        }
    }

    // 2. Render Slide (Designer)
    public SlideResponse renderSlide(String userId, SlideStrategy strategy, String userInput) {
        try {
            LOG.info("Step 2: Designer Execution (Strategy: {})", strategy.actionTitle);

            String designerTemplate = loadResource("/designer-prompt.md");
            String designerSystemPrompt = designerTemplate
                    .replace("{{STRATEGIST_BRIEF}}", objectMapper.writeValueAsString(strategy))
                    .replace("{{USER_REQUEST}}", userInput);

            DesignerResponse designerOutput = callDesigner(userInput, designerSystemPrompt);

            // 3. Call Corrector (Quality Assurance)
            LOG.info("Step 3: Corrector Execution");
            String correctorTemplate = loadResource("/corrector-prompt.md");
            String correctorSystemPrompt = correctorTemplate
                    .replace("{{STRATEGIST_BRIEF}}", strategy.narrativeGoal)
                    .replace("{{DESIGNER_CODE}}", designerOutput.htmlCode)
                    .replace("{{USER_REQUEST}}", userInput);

            DesignerResponse correctedOutput = callCorrector(userInput, correctorSystemPrompt);

            // Map corrected output to API response
            SlideResponse finalResponse = new SlideResponse(
                    "HTML_CODE",
                    correctedOutput.layout_strategy, // Use corrector explanation
                    correctedOutput.htmlCode,
                    strategy.actionTitle, // Carry over title from Architect
                    null,
                    null);

            // Save History to MongoDB
            if (userId != null) {
                GenerationHistory history = new GenerationHistory(
                        userId,
                        userInput,
                        objectMapper.writeValueAsString(finalResponse),
                        finalResponse.actionTitle());
                history.persist();
            }

            return finalResponse;

        } catch (Exception e) {
            LOG.error("Designer Error", e);
            return fallback("Designer Error: " + e.getMessage());
        }
    }

    // Kept for backward compatibility if needed, but preferred flow is analyze ->
    // render
    public SlideResponse generateSlide(String userInput) {
        ArchitectResponse plan = analyzeRequest(userInput);
        if ("CHAT".equalsIgnoreCase(plan.intent)) {
            return new SlideResponse("CONVERSATION", plan.reply, null, null, null, null);
        }
        return renderSlide(null, plan.slideStrategy, userInput); // Pass null userId
    }

    private ArchitectResponse callArchitect(String userInput) throws Exception {
        // Updated to 8192 tokens to fix JsonEOFException
        String prompt = loadResource("/architect-prompt.md");

        // Sanitize input to prevent 400 Bad Request from weird chars
        String safeInput = userInput.replace("\r", "").trim();

        AnthropicClient.AnthropicRequest request = new AnthropicClient.AnthropicRequest(
                model, 8192, List.of(new AnthropicClient.Message("user", safeInput)), prompt);

        String json = extractJson(callClaude(request));
        return objectMapper.readValue(json, ArchitectResponse.class);
    }

    private DesignerResponse callDesigner(String userInput, String systemPrompt) throws Exception {
        AnthropicClient.AnthropicRequest request = new AnthropicClient.AnthropicRequest(
                model, 8192, List.of(new AnthropicClient.Message("user", userInput)), systemPrompt);

        String json = extractJson(callClaude(request));
        return objectMapper.readValue(json, DesignerResponse.class);
    }

    private DesignerResponse callCorrector(String userInput, String systemPrompt) throws Exception {
        // Reuse generic request logic, effectively same as Designer but with different
        // prompt
        AnthropicClient.AnthropicRequest request = new AnthropicClient.AnthropicRequest(
                model, 8192, List.of(new AnthropicClient.Message("user", "QA Review Required.")), systemPrompt);

        String json = extractJson(callClaude(request));
        return objectMapper.readValue(json, DesignerResponse.class);
    }

    public String generateTitle(String userInput) {
        try {
            String prompt = "Summarize this request into a short, punchy 3-5 word title for a slide presentation history list. Do not use quotes. Request: "
                    + userInput;
            AnthropicClient.AnthropicRequest request = new AnthropicClient.AnthropicRequest(
                    model, 100, List.of(new AnthropicClient.Message("user", prompt)), "");
            return callClaude(request).trim();
        } catch (Exception e) {
            LOG.error("Failed to generate title", e);
            return "New Conversation";
        }
    }

    private String callClaude(AnthropicClient.AnthropicRequest request) {
        AnthropicClient.AnthropicResponse response = anthropicClient.chat(apiKey, "2023-06-01", request);
        return response.content().get(0).text();
    }

    private String extractJson(String text) {
        String jsonText = text;
        int startJson = text.indexOf("```json");
        int endJson = text.lastIndexOf("```");

        if (startJson != -1) {
            int startContent = startJson + 7;
            if (endJson > startContent) {
                jsonText = text.substring(startContent, endJson);
            } else {
                jsonText = text.substring(startContent);
            }
        } else {
            int openBrace = text.indexOf("{");
            int closeBrace = text.lastIndexOf("}");
            if (openBrace != -1 && closeBrace > openBrace) {
                jsonText = text.substring(openBrace, closeBrace + 1);
            }
        }
        return jsonText;
    }

    private SlideResponse fallback(String reason) {
        return new SlideResponse(
                "ERROR", reason, null, "System Error", "Analysis Failed", new ArrayList<>());
    }

    private String loadResource(String path) {
        try (InputStream is = getClass().getResourceAsStream(path)) {
            if (is == null)
                return "Prompt not found: " + path;
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            LOG.error("Failed to load resource: {}", path, e);
            return "Error loading prompt.";
        }
    }

    // --- Records ---

    // Architect Response Schema
    public record ArchitectResponse(String intent, String reply, SlideStrategy slideStrategy) {
    }

    public record SlideStrategy(String actionTitle, String slideArchetype, List<String> components,
            String narrativeGoal,
            String designBrief,
            List<String> loadingStrings) {
    }

    // New Designer Output Schema
    public record DesignerResponse(String layout_strategy, String htmlCode) {
    }

    // Slide Response Schema (Target)
    public record SlideResponse(
            String layout,
            String conversationText,
            String htmlCode,
            String actionTitle,
            String subtitle,
            List<ContentBlock> blocks) {
    }

    public record ContentBlock(
            String title, String type, String description, ChartData chartData, Metric metric) {
    }

    public record ChartData(List<String> labels, List<Dataset> datasets) {
    }

    public record Dataset(String label, List<Double> data, String color) {
    }

    public record Metric(String value, String label, String trend) {
    }
}

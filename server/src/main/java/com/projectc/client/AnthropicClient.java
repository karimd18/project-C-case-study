package com.projectc.client;

import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.HeaderParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import java.util.List;

@RegisterRestClient(configKey = "anthropic-api")
public interface AnthropicClient {

    @POST
    @Path("/v1/messages")
    AnthropicResponse chat(@HeaderParam("x-api-key") String apiKey,
            @HeaderParam("anthropic-version") String version,
            AnthropicRequest request);

    // Records for Request/Response
    record AnthropicRequest(String model, int max_tokens, List<Message> messages, String system) {
    }

    record Message(String role, String content) {
    }

    // Response
    record AnthropicResponse(List<Content> content, Usage usage) {
    }

    record Content(String type, String text) {
    }

    record Usage(int input_tokens, int output_tokens) {
    }
}

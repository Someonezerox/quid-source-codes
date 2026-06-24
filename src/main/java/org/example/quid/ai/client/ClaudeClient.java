package org.example.quid.ai.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.example.quid.ai.dto.AiResponse;
import org.example.quid.ai.properties.AiProperties;
import org.example.quid.conversation.entity.Message;
import org.example.quid.conversation.enums.MessageRole;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Component
public class ClaudeClient {

    private static final String SYSTEM_PROMPT = """
            You are a customer support AI. Answer using the knowledge base below.
            Respond ONLY with valid JSON in exactly this format (no markdown, no extra text):
            {"reply": "your response", "confidence": 0.95}
            confidence is 0.0–1.0: how certain you are you can handle this query well.

            Knowledge base:
            %s
            """;

    private final RestClient http;
    private final AiProperties props;
    private final ObjectMapper mapper;

    public ClaudeClient(AiProperties props, ObjectMapper mapper) {
        this.props = props;
        this.mapper = mapper;
        this.http = RestClient.builder()
                .baseUrl("https://api.anthropic.com")
                .defaultHeader("x-api-key", props.anthropicApiKey())
                .defaultHeader("anthropic-version", "2023-06-01")
                .defaultHeader("content-type", "application/json")
                .build();
    }

    public AiResponse chat(String knowledgeContext, List<Message> history) {
        var messages = history.stream()
                .map(m -> new Msg(toClaudeRole(m.getRole()), m.getContent()))
                .toList();

        var request = new Request(
                props.anthropicModel(),
                1024,
                SYSTEM_PROMPT.formatted(knowledgeContext.isBlank() ? "No specific knowledge provided." : knowledgeContext),
                messages
        );

        try {
            var response = http.post()
                    .uri("/v1/messages")
                    .body(request)
                    .retrieve()
                    .body(Response.class);

            String text = response.content().get(0).text();
            return mapper.readValue(text, AiResponse.class);
        } catch (Exception e) {
            log.error("Claude API call failed", e);
            return new AiResponse("I'm unable to assist at the moment. A human agent will help you shortly.", 0.0);
        }
    }

    private static String toClaudeRole(MessageRole role) {
        return role == MessageRole.CUSTOMER ? "user" : "assistant";
    }

    private record Msg(String role, String content) {}

    private record Request(String model, @JsonProperty("max_tokens") int maxTokens, String system, List<Msg> messages) {}

    private record ContentBlock(String type, String text) {}

    private record Response(List<ContentBlock> content) {}
}

package org.example.quid.ai.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.example.quid.ai.dto.AiResponse;
import org.example.quid.ai.properties.AiProperties;
import org.example.quid.conversation.entity.Message;
import org.example.quid.conversation.enums.MessageRole;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class ChatClient {

    private static final String PROMPT_SUFFIX = """

            Respond ONLY with valid JSON in exactly this format (no markdown, no extra text):
            {"reply": "your response", "confidence": 0.95}
            confidence is 0.0–1.0: how certain you are you can handle this query well.

            Knowledge base:
            %s
            """;

    private final RestClient http;
    private final AiProperties props;
    private final ObjectMapper mapper;

    public ChatClient(AiProperties props, ObjectMapper mapper) {
        this.props = props;
        this.mapper = mapper;
        this.http = RestClient.builder()
                .baseUrl("https://openrouter.ai/api/v1")
                .defaultHeader("Authorization", "Bearer " + props.openRouterApiKey())
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("X-Title", "QUID")
                .build();
    }

    public AiResponse chat(String agentPersona, String knowledgeContext, List<Message> history) {
        String systemPrompt = agentPersona + PROMPT_SUFFIX.formatted(
                knowledgeContext.isBlank() ? "No specific knowledge provided." : knowledgeContext);

        List<ChatMsg> messages = new ArrayList<>();
        messages.add(new ChatMsg("system", systemPrompt));
        history.stream()
                .map(m -> new ChatMsg(toRole(m.getRole()), m.getContent()))
                .forEach(messages::add);

        try {
            var response = http.post()
                    .uri("/chat/completions")
                    .body(new Request(props.chatModel(), messages))
                    .retrieve()
                    .body(Response.class);

            String text = response.choices().get(0).message().content();
            return mapper.readValue(text, AiResponse.class);
        } catch (Exception e) {
            log.error("Chat API call failed", e);
            return new AiResponse("I'm unable to assist at the moment. A human agent will help you shortly.", 0.0);
        }
    }

    private static String toRole(MessageRole role) {
        return role == MessageRole.CUSTOMER ? "user" : "assistant";
    }

    private record ChatMsg(String role, String content) {}

    private record Request(String model, List<ChatMsg> messages) {}

    private record MsgContent(String content) {}

    private record Choice(MsgContent message) {}

    private record Response(List<Choice> choices) {}
}

package org.example.quid.ai.client;

import lombok.extern.slf4j.Slf4j;
import org.example.quid.ai.properties.AiProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Component
public class EmbeddingClient {

    private final RestClient http;
    private final AiProperties props;

    public EmbeddingClient(AiProperties props) {
        this.props = props;
        this.http = RestClient.builder()
                .baseUrl("https://openrouter.ai/api/v1")
                .defaultHeader("Authorization", "Bearer " + props.openRouterApiKey())
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("X-Title", "QUID")
                .build();
    }

    public float[] embed(String text) {
        try {
            var response = http.post()
                    .uri("/embeddings")
                    .body(new Request(props.embeddingModel(), text))
                    .retrieve()
                    .body(Response.class);

            List<Double> embedding = response.data().get(0).embedding();
            float[] result = new float[embedding.size()];
            for (int i = 0; i < embedding.size(); i++) result[i] = embedding.get(i).floatValue();
            return result;
        } catch (Exception e) {
            log.error("Embedding API call failed", e);
            return new float[0];
        }
    }

    private record Request(String model, String input) {}

    private record EmbeddingData(List<Double> embedding) {}

    private record Response(List<EmbeddingData> data) {}
}

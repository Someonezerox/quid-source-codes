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

    public EmbeddingClient(AiProperties props) {
        this.http = RestClient.builder()
                .baseUrl("https://api.openai.com")
                .defaultHeader("Authorization", "Bearer " + props.openaiApiKey())
                .defaultHeader("content-type", "application/json")
                .build();
    }

    public float[] embed(String text) {
        try {
            var response = http.post()
                    .uri("/v1/embeddings")
                    .body(new Request("text-embedding-3-small", text))
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

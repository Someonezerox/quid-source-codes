package org.example.quid.ai.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.agent.entity.Agent;
import org.example.quid.ai.client.EmbeddingClient;
import org.example.quid.ai.properties.AiProperties;
import org.example.quid.knowledge.repository.KnowledgeEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RagService {

    private final EmbeddingClient embeddingClient;
    private final KnowledgeEntryRepository entryRepository;
    private final AiProperties props;

    public String buildContext(String query, Agent agent) {
        float[] embedding = embeddingClient.embed(query);
        if (embedding.length == 0) return "";

        List<Long> ids = entryRepository.findTopKByEmbeddingSimilarity(
                agent.getId(), toVectorString(embedding), props.ragTopK());

        if (ids.isEmpty()) return "";

        return entryRepository.findAllById(ids).stream()
                .map(e -> "## " + e.getTitle() + "\n" + e.getContent())
                .collect(Collectors.joining("\n\n"));
    }

    public static String toVectorString(float[] v) {
        return IntStream.range(0, v.length)
                .mapToObj(i -> String.valueOf(v[i]))
                .collect(Collectors.joining(",", "[", "]"));
    }
}

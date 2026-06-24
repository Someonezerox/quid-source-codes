package org.example.quid.infrastructure;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class VectorStoreInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbc;

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbc.execute("CREATE EXTENSION IF NOT EXISTS vector");
            jdbc.execute("ALTER TABLE knowledge_entries ADD COLUMN IF NOT EXISTS embedding vector(1536)");
            jdbc.execute("""
                    CREATE INDEX IF NOT EXISTS knowledge_entries_embedding_idx
                    ON knowledge_entries USING ivfflat (embedding vector_cosine_ops)
                    WITH (lists = 100)
                    """);
        } catch (Exception e) {
            log.warn("pgvector setup incomplete (extension may not be installed): {}", e.getMessage());
        }
    }
}

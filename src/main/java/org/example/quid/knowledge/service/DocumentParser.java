package org.example.quid.knowledge.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.example.quid.exception.ResourceNotFoundException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/** Extracts plain text from an uploaded document and splits it into embeddable chunks. */
final class DocumentParser {

    private static final int CHUNK_CHARS = 1000;   // ~250 tokens per chunk
    private static final int MAX_CHUNKS = 200;      // safety cap per upload

    private DocumentParser() {}

    static String extractText(MultipartFile file) {
        String name = (file.getOriginalFilename() == null ? "" : file.getOriginalFilename()).toLowerCase();
        try {
            byte[] bytes = file.getBytes();
            if (name.endsWith(".pdf")) {
                try (PDDocument doc = Loader.loadPDF(bytes)) {
                    return new PDFTextStripper().getText(doc);
                }
            }
            if (name.endsWith(".txt") || name.endsWith(".csv") || name.endsWith(".md")) {
                return new String(bytes, StandardCharsets.UTF_8);
            }
            // ponytail: DOCX needs Apache POI; not pulled in yet. Add if customers ask.
            throw new IllegalArgumentException("Unsupported file type. Supported: PDF, TXT, CSV, MD.");
        } catch (IOException e) {
            throw new ResourceNotFoundException("Could not read the uploaded file.");
        }
    }

    /** Greedy chunker: accumulates paragraphs up to ~CHUNK_CHARS, splitting on blank lines. */
    static List<String> chunk(String text) {
        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (String para : text.split("\\n\\s*\\n")) {
            String trimmed = para.strip();
            if (trimmed.isEmpty()) continue;
            if (current.length() + trimmed.length() > CHUNK_CHARS && current.length() > 0) {
                chunks.add(current.toString());
                current.setLength(0);
                if (chunks.size() >= MAX_CHUNKS) return chunks;
            }
            if (current.length() > 0) current.append("\n\n");
            current.append(trimmed);
        }
        if (current.length() > 0 && chunks.size() < MAX_CHUNKS) chunks.add(current.toString());
        return chunks;
    }
}

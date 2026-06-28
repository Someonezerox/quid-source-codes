package org.example.quid.ai.dto;

import java.util.Map;

public record MemoryExtraction(String summary, Map<String, String> preferences) {}

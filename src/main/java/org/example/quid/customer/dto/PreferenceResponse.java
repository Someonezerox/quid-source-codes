package org.example.quid.customer.dto;

import java.time.Instant;

public record PreferenceResponse(String key, String value, Instant updatedAt) {}

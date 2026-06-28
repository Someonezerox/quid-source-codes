package org.example.quid.customer.dto;

import jakarta.validation.constraints.NotBlank;

public record PreferenceRequest(@NotBlank String value) {}

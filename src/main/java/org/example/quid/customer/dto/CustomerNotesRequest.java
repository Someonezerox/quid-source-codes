package org.example.quid.customer.dto;

import jakarta.validation.constraints.NotNull;

public record CustomerNotesRequest(@NotNull String notes) {}

package org.example.quid.userbot.dto;

import jakarta.validation.constraints.NotBlank;

public final class UserbotDtos {
    private UserbotDtos() {}

    public record SendCodeRequest(@NotBlank String phone) {}

    public record SendCodeResult(String phoneCodeHash) {}

    public record SignInRequest(
            @NotBlank String phone,
            @NotBlank String code,
            @NotBlank String phoneCodeHash,
            String password,
            String channelName
    ) {}

    /** Pushed by the sidecar when a userbot account receives a message. */
    public record InboundRequest(
            @NotBlank String sessionId,
            Long chatId,
            Long senderId,
            String senderName,
            String text,
            Boolean isPrivate
    ) {}

    /** A group/supergroup the userbot account is a member of. */
    public record GroupDto(Long id, String title) {}

    public record SetGroupRequest(Long chatId) {}
}

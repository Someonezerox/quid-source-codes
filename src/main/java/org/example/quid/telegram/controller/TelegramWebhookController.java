package org.example.quid.telegram.controller;

import lombok.RequiredArgsConstructor;
import org.example.quid.ai.service.AiRoutingService;
import org.example.quid.telegram.dto.TelegramUpdate;
import org.example.quid.telegram.service.TelegramWebhookService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhook/telegram")
@RequiredArgsConstructor
public class TelegramWebhookController {

    private final TelegramWebhookService webhookService;
    private final AiRoutingService aiRoutingService;

    @PostMapping("/{channelId}")
    public void handle(@PathVariable Long channelId, @RequestBody TelegramUpdate update) {
        // webhook transaction commits here; AI routing starts async after
        Long conversationId = webhookService.handle(channelId, update);
        if (conversationId != null) aiRoutingService.process(conversationId);
    }
}

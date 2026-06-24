package org.example.quid.telegram.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class TelegramBotClient {

    public void sendMessage(String botToken, Long chatId, String text) {
        try {
            RestClient.create("https://api.telegram.org")
                    .post()
                    .uri("/bot{token}/sendMessage", botToken)
                    .body(new SendMessageRequest(chatId, text))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.error("Failed to send Telegram message to chat {}: {}", chatId, e.getMessage());
        }
    }

    private record SendMessageRequest(Long chat_id, String text) {}
}

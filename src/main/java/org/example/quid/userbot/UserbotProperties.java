package org.example.quid.userbot;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Config for the Telegram userbot sidecar. */
@ConfigurationProperties(prefix = "app.userbot")
public record UserbotProperties(String url, String internalToken) {}

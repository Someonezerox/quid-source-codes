package org.example.quid.userbot;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/** Thin HTTP client for the Telethon userbot sidecar. */
@Component
public class UserbotClient {

    private final RestClient http;

    public UserbotClient(UserbotProperties props) {
        this.http = RestClient.builder()
                .baseUrl(props.url() == null ? "http://localhost:8090" : props.url())
                .defaultHeader("X-Internal-Token", props.internalToken() == null ? "" : props.internalToken())
                .build();
    }

    public String sendCode(String phone) {
        SendCodeResponse res = http.post().uri("/auth/send-code")
                .body(Map.of("phone", phone))
                .retrieve().body(SendCodeResponse.class);
        return res == null ? null : res.phoneCodeHash();
    }

    public String signIn(String phone, String code, String phoneCodeHash, String password) {
        var body = new java.util.HashMap<String, Object>();
        body.put("phone", phone);
        body.put("code", code);
        body.put("phoneCodeHash", phoneCodeHash);
        if (password != null) body.put("password", password);
        SignInResponse res = http.post().uri("/auth/sign-in")
                .body(body)
                .retrieve().body(SignInResponse.class);
        return res == null ? null : res.sessionId();
    }

    public void send(String sessionId, Long peer, String text) {
        http.post().uri("/messages/send")
                .body(Map.of("sessionId", sessionId, "peer", peer, "text", text))
                .retrieve().toBodilessEntity();
    }

    private record SendCodeResponse(String phoneCodeHash) {}
    private record SignInResponse(String sessionId) {}
}

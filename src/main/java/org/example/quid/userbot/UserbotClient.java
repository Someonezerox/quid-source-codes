package org.example.quid.userbot;

import org.example.quid.exception.ConflictException;
import org.example.quid.userbot.dto.UserbotDtos.GroupDto;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.HttpClientErrorException;

import java.net.http.HttpClient;
import java.util.List;

/** Thin HTTP client for the Telethon userbot sidecar. */
@Component
public class UserbotClient {

    private final RestClient http;

    public UserbotClient(UserbotProperties props) {
        // Pin HTTP/1.1: the JDK client otherwise tries an h2c upgrade over plain HTTP,
        // which uvicorn rejects ("Unsupported upgrade request") and drops the request body.
        HttpClient jdk = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
        this.http = RestClient.builder()
                .requestFactory(new JdkClientHttpRequestFactory(jdk))
                .baseUrl(props.url() == null ? "http://localhost:8090" : props.url())
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("X-Internal-Token", props.internalToken() == null ? "" : props.internalToken())
                .build();
    }

    public String sendCode(String phone) {
        try {
            SendCodeResponse res = http.post().uri("/auth/send-code")
                    .body(new SendCodeBody(phone))
                    .retrieve().body(SendCodeResponse.class);
            return res == null ? null : res.phoneCodeHash();
        } catch (HttpClientErrorException.BadRequest e) {
            // sidecar 400 → Telegram rejected the number
            throw new IllegalArgumentException("Invalid phone number — include the correct country code");
        }
    }

    public String signIn(String phone, String code, String phoneCodeHash, String password) {
        try {
            SignInResponse res = http.post().uri("/auth/sign-in")
                    .body(new SignInBody(phone, code, phoneCodeHash, password))
                    .retrieve().body(SignInResponse.class);
            return res == null ? null : res.sessionId();
        } catch (HttpClientErrorException.Conflict e) {
            // sidecar 409 → this account has 2FA; the wizard should prompt for the cloud password
            throw new ConflictException("2FA password required");
        } catch (HttpClientErrorException.BadRequest e) {
            // sidecar 400 → wrong/expired login code
            throw new IllegalArgumentException("Invalid or expired code");
        }
    }

    public void send(String sessionId, Long peer, String text) {
        http.post().uri("/messages/send")
                .body(new SendBody(sessionId, peer, text))
                .retrieve().toBodilessEntity();
    }

    public List<GroupDto> listGroups(String sessionId) {
        DialogsResponse res = http.get().uri("/sessions/{id}/dialogs", sessionId)
                .retrieve().body(DialogsResponse.class);
        return res == null || res.dialogs() == null ? List.of() : res.dialogs();
    }

    private record DialogsResponse(List<GroupDto> dialogs) {}
    private record SendCodeBody(String phone) {}
    private record SignInBody(String phone, String code, String phoneCodeHash, String password) {}
    private record SendBody(String sessionId, Long peer, String text) {}
    private record SendCodeResponse(String phoneCodeHash) {}
    private record SignInResponse(String sessionId) {}
}

package org.example.quid.userbot;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.quid.channel.dto.ChannelResponse;
import org.example.quid.user.entity.User;
import org.example.quid.userbot.dto.UserbotDtos.GroupDto;
import org.example.quid.userbot.dto.UserbotDtos.InboundRequest;
import org.example.quid.userbot.dto.UserbotDtos.SendCodeRequest;
import org.example.quid.userbot.dto.UserbotDtos.SendCodeResult;
import org.example.quid.userbot.dto.UserbotDtos.SetGroupRequest;
import org.example.quid.userbot.dto.UserbotDtos.SignInRequest;
import org.example.quid.ai.service.AiRoutingService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/userbot")
@RequiredArgsConstructor
public class UserbotController {

    private final UserbotService userbotService;
    private final AiRoutingService aiRoutingService;
    private final UserbotProperties props;

    @PostMapping("/send-code")
    @PreAuthorize("hasRole('ADMIN')")
    public SendCodeResult sendCode(@Valid @RequestBody SendCodeRequest request) {
        return new SendCodeResult(userbotService.sendCode(request.phone()));
    }

    @PostMapping("/sign-in")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ChannelResponse signIn(@Valid @RequestBody SignInRequest request,
                                  @AuthenticationPrincipal User user) {
        return userbotService.signIn(request, user.getWorkspace());
    }

    @GetMapping("/channels/{channelId}/groups")
    @PreAuthorize("hasRole('ADMIN')")
    public List<GroupDto> groups(@PathVariable Long channelId, @AuthenticationPrincipal User user) {
        return userbotService.listGroups(channelId, user.getWorkspace());
    }

    @PutMapping("/channels/{channelId}/group")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setGroup(@PathVariable Long channelId,
                         @RequestBody SetGroupRequest request,
                         @AuthenticationPrincipal User user) {
        userbotService.setGroup(channelId, request.chatId(), user.getWorkspace());
    }

    /** Called by the sidecar (no JWT). Guarded by the shared internal token. */
    @PostMapping("/inbound")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void inbound(@Valid @RequestBody InboundRequest request,
                        @RequestHeader(value = "X-Internal-Token", required = false) String token) {
        if (props.internalToken() != null && !props.internalToken().isBlank()
                && !props.internalToken().equals(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "bad internal token");
        }
        Long conversationId = userbotService.inbound(request);
        if (conversationId != null) aiRoutingService.process(conversationId);
    }
}

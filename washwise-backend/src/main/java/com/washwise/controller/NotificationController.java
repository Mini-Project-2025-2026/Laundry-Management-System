package com.washwise.controller;

import com.washwise.entity.Notification;
import com.washwise.entity.User;
import com.washwise.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/mine")
    public List<Notification> getMine(@AuthenticationPrincipal User user) {
        return notificationService.getForUser(user.getId());
    }

    @GetMapping("/mine/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal User user) {
        return notificationService.unreadCount(user.getId());
    }

    @PatchMapping("/{id}/read")
    public Notification markRead(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return notificationService.markRead(id, user);
    }
}

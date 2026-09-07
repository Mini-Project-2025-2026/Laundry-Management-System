package com.washwise.service;

import com.washwise.entity.Notification;
import com.washwise.entity.NotificationType;
import com.washwise.entity.User;
import com.washwise.exception.ResourceNotFoundException;
import com.washwise.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ExpoPushService expoPushService;

    public Notification create(User user, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        Notification saved = notificationRepository.save(notification);

        expoPushService.send(user.getPushToken(), "WashWise", message);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Notification> getForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> unreadCount(Long userId) {
        return Map.of("unread", notificationRepository.countByUserIdAndReadFlagFalse(userId));
    }

    public Notification markRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("This notification doesn't belong to you");
        }
        notification.setReadFlag(true);
        return notificationRepository.save(notification);
    }
}

package com.washwise.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Sends push notifications through Expo's push API (https://exp.host).
 * Requires no API key — Expo's push service is free and keyed by the
 * device's Expo push token, which the app registers via PATCH /api/auth/push-token.
 *
 * Note: Expo Go on Android no longer supports *receiving* remote push in
 * recent SDKs (a Google Play Services restriction Expo can't work around
 * in the shared Expo Go client) — this call will still succeed and iOS
 * Expo Go / any custom dev build will receive it normally. The in-app
 * notification inbox always works regardless of push delivery.
 */
@Service
public class ExpoPushService {

    private static final Logger log = LoggerFactory.getLogger(ExpoPushService.class);
    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final RestTemplate restTemplate = new RestTemplate();

    public void send(String expoPushToken, String title, String body) {
        if (expoPushToken == null || expoPushToken.isBlank()) {
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");

            Map<String, Object> payload = Map.of(
                    "to", expoPushToken,
                    "title", title,
                    "body", body,
                    "sound", "default"
            );

            restTemplate.postForEntity(EXPO_PUSH_URL, new HttpEntity<>(payload, headers), String.class);
        } catch (Exception e) {
            // Push delivery is best-effort — never let a failed push break the
            // request that triggered it (e.g. a booking status update).
            log.warn("Failed to send push notification: {}", e.getMessage());
        }
    }
}

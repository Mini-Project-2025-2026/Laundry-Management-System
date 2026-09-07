package com.washwise.controller;

import com.washwise.dto.AuthResponse;
import com.washwise.dto.ChangePasswordRequest;
import com.washwise.dto.LoginRequest;
import com.washwise.dto.PushTokenRequest;
import com.washwise.dto.SignupRequest;
import com.washwise.entity.User;
import com.washwise.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserSummary me(@AuthenticationPrincipal User user) {
        return new UserSummary(user.getId(), user.getFullName(), user.getEmail(), user.getPhoneNumber(), user.getRole());
    }

    @PatchMapping("/change-password")
    public void changePassword(@AuthenticationPrincipal User user, @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(user, request);
    }

    @PatchMapping("/push-token")
    public void registerPushToken(@AuthenticationPrincipal User user, @Valid @RequestBody PushTokenRequest request) {
        authService.updatePushToken(user, request.getToken());
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(@AuthenticationPrincipal User user) {
        authService.deleteAccount(user);
    }

    public record UserSummary(Long id, String fullName, String email, String phoneNumber,
                               com.washwise.entity.UserRole role) {
    }
}

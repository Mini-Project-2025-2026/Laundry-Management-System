package com.washwise.service;

import com.washwise.dto.AuthResponse;
import com.washwise.dto.ChangePasswordRequest;
import com.washwise.dto.LoginRequest;
import com.washwise.dto.SignupRequest;
import com.washwise.entity.User;
import com.washwise.repository.BookingRepository;
import com.washwise.repository.LaundryBusinessRepository;
import com.washwise.repository.NotificationRepository;
import com.washwise.repository.ReviewRepository;
import com.washwise.repository.UserRepository;
import com.washwise.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final LaundryBusinessRepository laundryBusinessRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("An account with this email already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(request.getRole());
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Incorrect email or password");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Incorrect email or password"));

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }

    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void deleteAccount(User user) {
        if (user == null || user.getId() == null) {
            return;
        }
        Long userId = user.getId();

        notificationRepository.deleteByUserId(userId);

        if (user.getRole() == com.washwise.entity.UserRole.LAUNDRY_OWNER) {
            reviewRepository.deleteByLaundryBusinessOwnerId(userId);
            bookingRepository.deleteByLaundryBusinessOwnerId(userId);
            laundryBusinessRepository.deleteByOwnerId(userId);
        }

        reviewRepository.deleteByCustomerId(userId);
        bookingRepository.deleteByCustomerId(userId);

        userRepository.delete(user);
    }

    public void updatePushToken(User user, String token) {
        user.setPushToken(token);
        userRepository.save(user);
    }
}

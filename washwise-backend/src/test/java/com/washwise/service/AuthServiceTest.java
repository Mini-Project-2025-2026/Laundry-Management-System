package com.washwise.service;

import com.washwise.dto.AuthResponse;
import com.washwise.dto.ChangePasswordRequest;
import com.washwise.dto.LoginRequest;
import com.washwise.dto.SignupRequest;
import com.washwise.entity.User;
import com.washwise.entity.UserRole;
import com.washwise.repository.BookingRepository;
import com.washwise.repository.LaundryBusinessRepository;
import com.washwise.repository.NotificationRepository;
import com.washwise.repository.ReviewRepository;
import com.washwise.repository.UserRepository;
import com.washwise.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private LaundryBusinessRepository laundryBusinessRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(10L);
        user.setEmail("test@washwise.app");
        user.setFullName("Test User");
        user.setPasswordHash("hashed_pw");
        user.setRole(UserRole.CUSTOMER);
    }

    @Test
    void testSignupSuccess() {
        SignupRequest req = new SignupRequest();
        req.setEmail("new@washwise.app");
        req.setFullName("New User");
        req.setPassword("secret123");
        req.setRole(UserRole.CUSTOMER);

        when(userRepository.existsByEmail("new@washwise.app")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded_secret");
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token-xyz");

        AuthResponse resp = authService.signup(req);

        assertNotNull(resp);
        assertEquals("jwt-token-xyz", resp.getToken());
        assertEquals("new@washwise.app", resp.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testSignupDuplicateEmailThrows() {
        SignupRequest req = new SignupRequest();
        req.setEmail("existing@washwise.app");

        when(userRepository.existsByEmail("existing@washwise.app")).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> authService.signup(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testLoginSuccess() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@washwise.app");
        req.setPassword("secret123");

        when(userRepository.findByEmail("test@washwise.app")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-token-login");

        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("jwt-token-login", resp.getToken());
        assertEquals(user.getEmail(), resp.getEmail());
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void testLoginBadCredentialsThrows() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@washwise.app");
        req.setPassword("wrong");

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    void testChangePasswordSuccess() {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("old");
        req.setNewPassword("new");

        when(passwordEncoder.matches("old", "hashed_pw")).thenReturn(true);
        when(passwordEncoder.encode("new")).thenReturn("new_hash");

        authService.changePassword(user, req);

        assertEquals("new_hash", user.getPasswordHash());
        verify(userRepository).save(user);
    }

    @Test
    void testDeleteAccountCustomerCleansUpCascadingData() {
        authService.deleteAccount(user);

        verify(notificationRepository).deleteByUserId(10L);
        verify(reviewRepository).deleteByCustomerId(10L);
        verify(bookingRepository).deleteByCustomerId(10L);
        verify(userRepository).delete(user);
    }

    @Test
    void testDeleteAccountOwnerCleansUpBusinessData() {
        user.setRole(UserRole.LAUNDRY_OWNER);

        authService.deleteAccount(user);

        verify(notificationRepository).deleteByUserId(10L);
        verify(reviewRepository).deleteByLaundryBusinessOwnerId(10L);
        verify(bookingRepository).deleteByLaundryBusinessOwnerId(10L);
        verify(laundryBusinessRepository).deleteByOwnerId(10L);
        verify(userRepository).delete(user);
    }
}

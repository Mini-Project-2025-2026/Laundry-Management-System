package com.washwise.service;

import com.washwise.dto.BookingRequest;
import com.washwise.entity.*;
import com.washwise.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private LaundryBusinessService laundryBusinessService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingService bookingService;

    private User customer;
    private User owner;
    private LaundryBusiness business;
    private Booking booking;

    @BeforeEach
    void setUp() {
        customer = new User();
        customer.setId(1L);
        customer.setEmail("customer@test.com");
        customer.setFullName("Customer One");
        customer.setRole(UserRole.CUSTOMER);

        owner = new User();
        owner.setId(2L);
        owner.setEmail("owner@test.com");
        owner.setFullName("Owner One");
        owner.setRole(UserRole.LAUNDRY_OWNER);

        business = new LaundryBusiness();
        business.setId(10L);
        business.setBusinessName("Fresh Wash");
        business.setOwner(owner);
        business.setOffersDelivery(true);

        booking = new Booking();
        booking.setId(100L);
        booking.setBookingCode("BK-20260909-ABCDEF");
        booking.setCustomer(customer);
        booking.setLaundryBusiness(business);
        booking.setStatus(BookingStatus.PENDING);
    }

    @Test
    void testCreateBookingSuccess() {
        when(laundryBusinessService.getById(10L)).thenReturn(business);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingRequest req = new BookingRequest();
        req.setLaundryBusinessId(10L);
        req.setDeliveryRequested(true);
        req.setNotes("Handle with care");

        Booking created = bookingService.create(customer, req);

        assertNotNull(created);
        assertEquals(customer, created.getCustomer());
        assertEquals(business, created.getLaundryBusiness());
        assertTrue(created.isDeliveryRequested());
        assertTrue(created.getBookingCode().startsWith("BK-"));
        assertEquals(18, created.getBookingCode().length()); // "BK-yyyyMMdd-XXXXXX" = 3 + 8 + 1 + 6 = 18
        verify(laundryBusinessService).incrementBookingCount(business);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void testCreateBookingDeliveryNotOfferedThrows() {
        business.setOffersDelivery(false);
        when(laundryBusinessService.getById(10L)).thenReturn(business);

        BookingRequest req = new BookingRequest();
        req.setLaundryBusinessId(10L);
        req.setDeliveryRequested(true);

        assertThrows(IllegalArgumentException.class, () -> bookingService.create(customer, req));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void testAdvanceStatusSuccess() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking updated = bookingService.updateStatus(100L, owner, BookingStatus.ACCEPTED);

        assertEquals(BookingStatus.ACCEPTED, updated.getStatus());
        verify(bookingRepository).save(booking);
    }

    @Test
    void testCannotMoveStatusBackwards() {
        booking.setStatus(BookingStatus.IN_PROGRESS);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        assertThrows(IllegalArgumentException.class, () ->
                bookingService.updateStatus(100L, owner, BookingStatus.ACCEPTED));
    }

    @Test
    void testCompletedBookingSendsCustomerNotification() {
        booking.setStatus(BookingStatus.READY);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking updated = bookingService.updateStatus(100L, owner, BookingStatus.COMPLETED);

        assertEquals(BookingStatus.COMPLETED, updated.getStatus());
        verify(notificationService).create(eq(customer), anyString(), eq(NotificationType.ORDER_COMPLETED));
    }

    @Test
    void testGetForOwner() {
        when(bookingRepository.findByLaundryBusinessOwnerIdOrderByCreatedAtDesc(2L))
                .thenReturn(List.of(booking));

        List<Booking> list = bookingService.getForOwner(owner);

        assertEquals(1, list.size());
        assertEquals(booking, list.get(0));
    }
}

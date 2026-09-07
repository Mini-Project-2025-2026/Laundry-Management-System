package com.washwise.config;

import com.washwise.entity.*;
import com.washwise.repository.BookingRepository;
import com.washwise.repository.LaundryBusinessRepository;
import com.washwise.repository.PriceListRepository;
import com.washwise.repository.ReviewRepository;
import com.washwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

/**
 * Seeds a sensible default price list, 50+ demo laundry businesses (a
 * handful with real reviews, the rest with realistic aggregate stats), and
 * a few demo bookings for the demo customer — so the app has real content
 * to browse/test immediately. Safe to run every startup since it only
 * inserts when the relevant table is empty.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PriceListRepository priceListRepository;
    private final UserRepository userRepository;
    private final LaundryBusinessRepository laundryBusinessRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    // Deterministic so re-seeding (on a fresh DB) always looks the same.
    private final Random random = new Random(42);

    private static final String[] PREFIXES = {
            "Sparkle", "Fresh", "Royal", "Rapid", "QuickCare", "CleanCut", "Pure", "Silver",
            "Golden", "Crystal", "Bright", "Elite", "Prime", "Urban", "Metro", "Swift", "Star",
            "Blue Wave", "Green Leaf", "Sunrise", "Downtown", "Westside", "Eastgate", "Northland",
            "Southbank", "Zenith", "Vogue", "Classic", "Modern", "Trusty", "Diamond", "Velvet",
            "Cascade", "Harbor", "Meadow", "Highline",
    };

    private static final String[] SUFFIXES = {
            "Laundry", "Wash House", "Dry Cleaners", "Laundromat", "Fabric Care", "Wash & Fold",
            "Cleaners", "Laundry Hub", "Suds Co.", "Linen Care", "Laundry Lounge", "Wash Bar",
    };

    private static final String[] AREAS = {
            "Adum", "Bantama", "Asokwa", "Suame", "Nhyiaeso", "Ahodwo", "Kwadaso", "Tafo",
            "Asafo", "Danyame", "Ridge", "North Suntreso", "Amakom", "Bomso", "Krofrom",
            "Atonsu", "Santasi", "Deduako", "Fante Newtown", "Pankrono", "Ayigya", "Oforikrom",
    };

    private static final String[] STREET_WORDS = {
            "Street", "Road", "Avenue", "Lane", "Close", "Drive",
    };

    private static final String[] REVIEWER_NAMES = {
            "Ama Owusu", "Kwame Boateng", "Efua Mensah", "Kofi Asante", "Abena Sarpong",
            "Yaw Darko", "Akosua Frimpong", "Kwabena Osei",
    };

    private static final String[] REVIEW_COMMENTS = {
            "Quick turnaround and my clothes came back smelling amazing.",
            "Delivery was right on time and the driver was friendly.",
            "A bit pricier than others nearby but the quality is worth it.",
            "Stains I thought were permanent came out completely. Impressed!",
            "Good service overall, though pickup was 30 minutes late once.",
            "My go-to for suits — always pressed perfectly.",
            "Friendly staff, clean facility, will definitely book again.",
            "Great value for the price, especially for bulk orders.",
            "They handled my delicate fabrics with real care.",
            "Booking through the app was seamless and the order was ready early.",
    };

    // Kumasi city-center coordinates, jittered per business.
    private static final double BASE_LAT = 6.6885;
    private static final double BASE_LNG = -1.6244;

    @Override
    public void run(String... args) {
        seedPriceList();
        seedDemoData();
    }

    private void seedPriceList() {
        if (priceListRepository.count() > 0) {
            return;
        }

        seed(GarmentType.SHIRT, ServiceType.WASH, 3.00);
        seed(GarmentType.SHIRT, ServiceType.IRON, 2.00);
        seed(GarmentType.SHIRT, ServiceType.WASH_AND_IRON, 4.50);
        seed(GarmentType.SHIRT, ServiceType.DRY_CLEAN, 6.00);

        seed(GarmentType.TROUSER, ServiceType.WASH, 3.50);
        seed(GarmentType.TROUSER, ServiceType.IRON, 2.50);
        seed(GarmentType.TROUSER, ServiceType.WASH_AND_IRON, 5.50);
        seed(GarmentType.TROUSER, ServiceType.DRY_CLEAN, 7.00);

        seed(GarmentType.SUIT, ServiceType.DRY_CLEAN, 15.00);
        seed(GarmentType.SUIT, ServiceType.WASH_AND_IRON, 12.00);

        seed(GarmentType.DRESS, ServiceType.WASH, 5.00);
        seed(GarmentType.DRESS, ServiceType.DRY_CLEAN, 10.00);

        seed(GarmentType.BEDSHEET, ServiceType.WASH_AND_FOLD, 6.00);
        seed(GarmentType.CURTAIN, ServiceType.WASH, 8.00);
        seed(GarmentType.JACKET, ServiceType.DRY_CLEAN, 12.00);
        seed(GarmentType.TOWEL, ServiceType.WASH_AND_FOLD, 2.50);
        seed(GarmentType.OTHER, ServiceType.WASH, 4.00);
    }

    private void seed(GarmentType garmentType, ServiceType serviceType, double price) {
        PriceList entry = new PriceList();
        entry.setGarmentType(garmentType);
        entry.setServiceType(serviceType);
        entry.setPrice(BigDecimal.valueOf(price));
        priceListRepository.save(entry);
    }

    private void seedDemoData() {
        if (laundryBusinessRepository.count() > 0) {
            return;
        }

        User owner = getOrCreateUser("Demo Laundry Owner", "owner@demo.com", "0200000000", UserRole.LAUNDRY_OWNER);
        User customer = getOrCreateUser("Demo Customer", "customer@demo.com", "0244000000", UserRole.CUSTOMER);

        List<User> reviewers = new ArrayList<>();
        for (int i = 0; i < REVIEWER_NAMES.length; i++) {
            String[] parts = REVIEWER_NAMES[i].split(" ");
            String email = (parts[0] + "." + parts[1] + i + "@demo.com").toLowerCase();
            reviewers.add(getOrCreateUser(REVIEWER_NAMES[i], email, "020000" + (1000 + i), UserRole.CUSTOMER));
        }

        Set<DayOfWeek> weekdays = Set.of(
                DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY
        );
        Set<DayOfWeek> everyDay = Set.of(DayOfWeek.values());

        List<LaundryBusiness> created = new ArrayList<>();
        int count = 0;
        for (String prefix : PREFIXES) {
            for (int s = 0; s < SUFFIXES.length && count < 58; s++) {
                // Not every prefix x suffix combo — skip most to get varied, not
                // exhaustive, coverage while still comfortably clearing 50+.
                if (random.nextDouble() > 0.35) continue;

                String name = prefix + " " + SUFFIXES[s];
                String area = AREAS[random.nextInt(AREAS.length)];
                String street = (10 + random.nextInt(90)) + " " + area + " " + STREET_WORDS[random.nextInt(STREET_WORDS.length)];
                double lat = BASE_LAT + (random.nextDouble() - 0.5) * 0.09;
                double lng = BASE_LNG + (random.nextDouble() - 0.5) * 0.09;
                boolean offersDelivery = random.nextDouble() < 0.65;
                boolean allWeek = random.nextDouble() < 0.3;
                int openHour = 6 + random.nextInt(4); // 6-9
                int closeHour = 17 + random.nextInt(6); // 17-22
                double rating = Math.round((3.4 + random.nextDouble() * 1.6) * 10) / 10.0;
                int reviewCount = 3 + random.nextInt(300);
                int totalBookings = reviewCount + random.nextInt(reviewCount + 50);

                LaundryBusiness business = seedBusiness(
                        owner, name, describeBusiness(area), street + ", " + area + ", Kumasi",
                        lat, lng, allWeek ? everyDay : weekdays, openHour, closeHour, offersDelivery,
                        rating, reviewCount, totalBookings
                );
                created.add(business);
                count++;
            }
        }

        // Give the first several businesses real, varied reviews so the
        // business-detail review list has actual content to show, and
        // recompute their aggregate rating from those real reviews.
        int businessesWithRealReviews = Math.min(15, created.size());
        for (int i = 0; i < businessesWithRealReviews; i++) {
            LaundryBusiness business = created.get(i);
            int numReviews = 2 + random.nextInt(3);
            int sum = 0;
            for (int r = 0; r < numReviews; r++) {
                User reviewer = reviewers.get(random.nextInt(reviewers.size()));
                int overall = 3 + random.nextInt(3); // 3-5, keeps demo data upbeat
                sum += overall;
                Review review = new Review();
                review.setLaundryBusiness(business);
                review.setCustomer(reviewer);
                review.setOverall(overall);
                review.setCleanliness(clamp(overall + random.nextInt(2) - 1));
                review.setAccuracy(clamp(overall + random.nextInt(2) - 1));
                review.setQualityAndTimeliness(clamp(overall + random.nextInt(2) - 1));
                review.setPricingFairness(clamp(overall + random.nextInt(2) - 1));
                review.setPickupDeliveryConvenience(clamp(overall + random.nextInt(2) - 1));
                review.setComment(REVIEW_COMMENTS[random.nextInt(REVIEW_COMMENTS.length)]);
                reviewRepository.save(review);
            }
            business.setAverageRating(Math.round((sum / (double) numReviews) * 10.0) / 10.0);
            business.setReviewCount(numReviews);
            laundryBusinessRepository.save(business);
        }

        // A few demo bookings for the demo customer, in different statuses,
        // so My Bookings has real content (including one COMPLETED-but-
        // unreviewed booking to test the review prompt).
        if (created.size() >= 3) {
            seedBooking(customer, created.get(0), true, "2 loads, mostly shirts", BookingStatus.COMPLETED, false);
            seedBooking(customer, created.get(1), false, "Suit for a wedding, handle with care", BookingStatus.IN_PROGRESS, false);
            seedBooking(customer, created.get(2), true, null, BookingStatus.PENDING, false);
            if (created.size() >= 4) {
                seedBooking(customer, created.get(3), true, "Bedsheets and towels", BookingStatus.READY, false);
            }
        }
    }

    private String describeBusiness(String area) {
        String[] templates = {
                "Fast, friendly laundry service in " + area + ".",
                "Same-day wash and fold, no minimum order.",
                "Specialists in suits, gowns, and delicate fabrics.",
                "Affordable, transparent pricing with convenient pickup.",
                "Trusted by the " + area + " community for over a decade.",
                "Eco-friendly detergents and careful, hygienic handling.",
        };
        return templates[random.nextInt(templates.length)];
    }

    private int clamp(int value) {
        return Math.max(1, Math.min(5, value));
    }

    private User getOrCreateUser(String fullName, String email, String phone, UserRole role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setFullName(fullName);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode("password123"));
            user.setPhoneNumber(phone);
            user.setRole(role);
            return userRepository.save(user);
        });
    }

    private LaundryBusiness seedBusiness(User owner, String name, String description, String address,
                                          double lat, double lng, Set<DayOfWeek> workingDays,
                                          int openHour, int closeHour, boolean offersDelivery,
                                          double averageRating, int reviewCount, int totalBookings) {
        LaundryBusiness business = new LaundryBusiness();
        business.setOwner(owner);
        business.setBusinessName(name);
        business.setDescription(description);
        business.setAddress(address);
        business.setLatitude(lat);
        business.setLongitude(lng);
        business.setWorkingDays(workingDays);
        business.setOpenTime(LocalTime.of(openHour, 0));
        business.setCloseTime(LocalTime.of(closeHour, 0));
        business.setOffersDelivery(offersDelivery);
        business.setAverageRating(averageRating);
        business.setReviewCount(reviewCount);
        business.setTotalBookings(totalBookings);
        return laundryBusinessRepository.save(business);
    }

    private void seedBooking(User customer, LaundryBusiness business, boolean delivery, String notes,
                              BookingStatus status, boolean reviewed) {
        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setLaundryBusiness(business);
        booking.setDeliveryRequested(delivery);
        booking.setNotes(notes);
        booking.setBookingCode("BK-DEMO-" + (1000 + random.nextInt(9000)));
        booking.setStatus(status);
        booking.setReviewed(reviewed);
        bookingRepository.save(booking);
    }
}

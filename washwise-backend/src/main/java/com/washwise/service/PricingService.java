package com.washwise.service;

import com.washwise.entity.GarmentType;
import com.washwise.entity.PriceList;
import com.washwise.entity.ServiceType;
import com.washwise.repository.PriceListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class PricingService {

    private final PriceListRepository priceListRepository;

    /** Fallback price used only if no PriceList entry exists for a combination. */
    private static final BigDecimal DEFAULT_PRICE = BigDecimal.valueOf(10.00);

    public BigDecimal getUnitPrice(GarmentType garmentType, ServiceType serviceType) {
        return priceListRepository.findByGarmentTypeAndServiceType(garmentType, serviceType)
                .map(PriceList::getPrice)
                .orElse(DEFAULT_PRICE);
    }

    /**
     * Applies a loyalty-based discount on top of any manually supplied discount percent.
     * Every 100 loyalty points earns an extra 1% discount, capped at 20%.
     */
    public BigDecimal calculateDiscountPercent(BigDecimal requestedDiscountPercent, int loyaltyPoints) {
        BigDecimal manual = requestedDiscountPercent != null ? requestedDiscountPercent : BigDecimal.ZERO;
        BigDecimal loyaltyBonus = BigDecimal.valueOf(Math.min(loyaltyPoints / 100, 20));
        BigDecimal total = manual.add(loyaltyBonus);
        BigDecimal cap = BigDecimal.valueOf(50);
        return total.min(cap);
    }

    public BigDecimal applyDiscount(BigDecimal subtotal, BigDecimal discountPercent) {
        BigDecimal discountFraction = discountPercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        return subtotal.multiply(discountFraction).setScale(2, RoundingMode.HALF_UP);
    }
}

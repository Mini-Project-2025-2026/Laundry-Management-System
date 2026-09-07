package com.washwise.service;

import com.washwise.dto.LaundryBusinessRequest;
import com.washwise.entity.LaundryBusiness;
import com.washwise.entity.User;
import com.washwise.entity.UserRole;
import com.washwise.exception.ResourceNotFoundException;
import com.washwise.repository.LaundryBusinessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LaundryBusinessService {

    private final LaundryBusinessRepository laundryBusinessRepository;

    public LaundryBusiness register(User owner, LaundryBusinessRequest request) {
        if (owner.getRole() != UserRole.LAUNDRY_OWNER) {
            throw new IllegalStateException("Only laundry-owner accounts can register a business");
        }

        LaundryBusiness business = new LaundryBusiness();
        applyRequest(business, request);
        business.setOwner(owner);
        return laundryBusinessRepository.save(business);
    }

    public LaundryBusiness update(User owner, Long businessId, LaundryBusinessRequest request) {
        LaundryBusiness business = getById(businessId);
        if (!business.getOwner().getId().equals(owner.getId())) {
            throw new IllegalStateException("You can only edit your own laundry business");
        }
        applyRequest(business, request);
        return laundryBusinessRepository.save(business);
    }

    private void applyRequest(LaundryBusiness business, LaundryBusinessRequest request) {
        business.setBusinessName(request.getBusinessName());
        business.setDescription(request.getDescription());
        business.setAddress(request.getAddress());
        business.setLatitude(request.getLatitude());
        business.setLongitude(request.getLongitude());
        business.setWorkingDays(request.getWorkingDays());
        business.setOpenTime(request.getOpenTime());
        business.setCloseTime(request.getCloseTime());
        business.setOffersDelivery(request.isOffersDelivery());
    }

    @Transactional(readOnly = true)
    public LaundryBusiness getById(Long id) {
        return laundryBusinessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laundry business not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<LaundryBusiness> getAll() {
        return laundryBusinessRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<LaundryBusiness> search(String keyword) {
        return laundryBusinessRepository.search(keyword);
    }

    @Transactional(readOnly = true)
    public List<LaundryBusiness> getByOwner(Long ownerId) {
        return laundryBusinessRepository.findByOwnerId(ownerId);
    }

    public void incrementBookingCount(LaundryBusiness business) {
        business.setTotalBookings(business.getTotalBookings() + 1);
        laundryBusinessRepository.save(business);
    }
}

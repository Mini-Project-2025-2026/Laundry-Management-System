package com.washwise.repository;

import com.washwise.entity.GarmentType;
import com.washwise.entity.PriceList;
import com.washwise.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PriceListRepository extends JpaRepository<PriceList, Long> {
    Optional<PriceList> findByGarmentTypeAndServiceType(GarmentType garmentType, ServiceType serviceType);
}

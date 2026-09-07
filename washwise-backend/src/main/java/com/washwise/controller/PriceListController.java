package com.washwise.controller;

import com.washwise.entity.PriceList;
import com.washwise.repository.PriceListRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price-list")
@RequiredArgsConstructor
public class PriceListController {

    private final PriceListRepository priceListRepository;

    @GetMapping
    public List<PriceList> getAll() {
        return priceListRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PriceList create(@Valid @RequestBody PriceList priceList) {
        return priceListRepository.save(priceList);
    }

    @PutMapping("/{id}")
    public PriceList update(@PathVariable Long id, @Valid @RequestBody PriceList updated) {
        PriceList existing = priceListRepository.findById(id)
                .orElseThrow(() -> new com.washwise.exception.ResourceNotFoundException(
                        "Price list entry not found with id: " + id));
        existing.setGarmentType(updated.getGarmentType());
        existing.setServiceType(updated.getServiceType());
        existing.setPrice(updated.getPrice());
        return priceListRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        priceListRepository.deleteById(id);
    }
}

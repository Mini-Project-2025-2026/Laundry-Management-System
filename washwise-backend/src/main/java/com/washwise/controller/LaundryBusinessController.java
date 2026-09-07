package com.washwise.controller;

import com.washwise.dto.LaundryBusinessRequest;
import com.washwise.entity.LaundryBusiness;
import com.washwise.entity.User;
import com.washwise.service.LaundryBusinessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laundry-businesses")
@RequiredArgsConstructor
public class LaundryBusinessController {

    private final LaundryBusinessService laundryBusinessService;

    @GetMapping
    public List<LaundryBusiness> getAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return laundryBusinessService.search(search);
        }
        return laundryBusinessService.getAll();
    }

    @GetMapping("/{id}")
    public LaundryBusiness getById(@PathVariable Long id) {
        return laundryBusinessService.getById(id);
    }

    @GetMapping("/mine")
    public List<LaundryBusiness> getMine(@AuthenticationPrincipal User owner) {
        return laundryBusinessService.getByOwner(owner.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LaundryBusiness register(@AuthenticationPrincipal User owner,
                                     @Valid @RequestBody LaundryBusinessRequest request) {
        return laundryBusinessService.register(owner, request);
    }

    @PutMapping("/{id}")
    public LaundryBusiness update(@AuthenticationPrincipal User owner,
                                   @PathVariable Long id,
                                   @Valid @RequestBody LaundryBusinessRequest request) {
        return laundryBusinessService.update(owner, id, request);
    }
}

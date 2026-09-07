package com.washwise.dto;

import com.washwise.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingStatusRequest {

    @NotNull(message = "Status is required")
    private BookingStatus status;
}

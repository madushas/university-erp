package com.university.backend.dto.request;

import com.university.backend.entity.BillingStatus;
import lombok.Data;

@Data
public class UpdateBillingStatusRequest {
    private BillingStatus status;
}
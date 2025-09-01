package com.university.backend.modules.financial.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Holds payment instrument details coming from the frontend.
 * Sensitive data should not be persisted; only last four digits will be used.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDetailsDto {
    // Card fields
    private String cardNumber; // full or masked; backend will extract last four only
    private String expiryMonth;
    private String expiryYear;
    private String cvv; // will not be stored
    private String cardholderName;

    // Bank transfer fields
    private String bankAccountNumber; // full or masked; backend will extract last four only
    private String routingNumber; // optional - may be masked in storage
    private String bankName;
}

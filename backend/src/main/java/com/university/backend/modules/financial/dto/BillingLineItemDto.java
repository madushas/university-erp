package com.university.backend.modules.financial.dto;

import com.university.backend.modules.core.dto.BaseDto;
import com.university.backend.modules.financial.entity.ItemCategory;
import com.university.backend.modules.financial.entity.ItemType;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BillingLineItemDto extends BaseDto {
    private Integer lineNumber;
    private String description;
    private ItemType itemType;
    private ItemCategory itemCategory;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private LocalDate servicePeriodStart;
    private LocalDate servicePeriodEnd;
}
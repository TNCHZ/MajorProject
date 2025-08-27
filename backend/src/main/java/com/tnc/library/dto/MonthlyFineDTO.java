package com.tnc.library.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MonthlyFineDTO {
    private String month;
    private BigDecimal revenue;

    public MonthlyFineDTO(String month, BigDecimal revenue) {
        this.month = month;
        this.revenue = revenue;
    }
}

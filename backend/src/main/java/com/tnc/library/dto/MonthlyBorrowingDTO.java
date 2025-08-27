package com.tnc.library.dto;


import lombok.Data;

@Data
public class MonthlyBorrowingDTO {
    private String month;
    private Long borrowings;

    public MonthlyBorrowingDTO(String month, Long borrowings) {
        this.month = month;
        this.borrowings = borrowings;
    }
}

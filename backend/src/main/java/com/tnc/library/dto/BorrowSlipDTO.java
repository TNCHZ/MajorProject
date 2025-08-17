package com.tnc.library.dto;

import lombok.Data;

@Data
public class BorrowSlipDTO {
    private Integer readerId;
    private String borrowDate;
    private String dueDate;
    private String note;
}

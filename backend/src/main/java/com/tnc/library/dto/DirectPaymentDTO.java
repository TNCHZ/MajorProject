package com.tnc.library.dto;

import lombok.Data;

@Data
public class DirectPaymentDTO {
    private String title;
    private Integer readerId;
    private String paymentDate;
    private String amount;
    private String method;
    private String note;
    private Integer typeId;
}

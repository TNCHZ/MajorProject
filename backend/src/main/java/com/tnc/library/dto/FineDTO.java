package com.tnc.library.dto;


import lombok.Data;

@Data
public class FineDTO {
    private String reason;
    private String issuedAt;
    private String isPaid;
    private Integer readerId;
    private Integer borrowSlipId;
    private String amount;
    private String title;
    private String method;
}

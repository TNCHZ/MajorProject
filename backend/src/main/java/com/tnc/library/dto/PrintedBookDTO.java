package com.tnc.library.dto;


import lombok.Data;

import java.math.BigDecimal;

@Data
public class PrintedBookDTO {
    private Integer id;
    private String title;
    private String author;
    private int publishedDate;
    private BigDecimal price;

    public PrintedBookDTO(Integer id, String title, String author, int publishedDate, BigDecimal price) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.publishedDate = publishedDate;
        this.price = price;
    }
}

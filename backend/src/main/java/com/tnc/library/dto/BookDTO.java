package com.tnc.library.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Transient;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Data
public class BookDTO {
    private String title;
    private String author;
    private String publisher;
    private String description;
    private String language;
    private String publishedDate;
    private String isbn10;
    private String isbn13;
    private String price;
    private String isPrinted;
    private String isElectronic;
    private String format;
    private String licence;
    private String shelfLocation;
    private String totalCopy;

}

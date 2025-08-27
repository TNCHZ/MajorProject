package com.tnc.library.dto;


import lombok.Data;

@Data
public class CategoryBookDTO {
    private String categoryName;
    private Long bookCount;

    public CategoryBookDTO(String categoryName, Long bookCount) {
        this.categoryName = categoryName;
        this.bookCount = bookCount;
    }
}

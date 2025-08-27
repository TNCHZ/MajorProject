package com.tnc.library.dto;


import lombok.Data;

@Data
public class BookBorrowCountDTO {
    private String bookTitle;
    private String author;
    private Long borrowCount;

    public BookBorrowCountDTO(String bookTitle, String author, Long borrowCount) {
        this.bookTitle = bookTitle;
        this.author = author;
        this.borrowCount = borrowCount;
    }
}

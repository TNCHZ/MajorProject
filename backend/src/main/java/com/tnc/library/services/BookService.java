package com.tnc.library.services;

import com.tnc.library.pojo.Book;
import org.springframework.data.domain.Page;

import java.util.List;

public interface BookService {
    Book addOrUpdateBook(Book b);

    List<Book> findByIsbn(String isbn);

    Book getBookByNameAuthorPublishedDate(String title, String author, int publishedDate);

    Book getBookByBookId(int id);

    List<Book> getBookByTitle(String title);

    Integer countAllBook();
    void deleteBook(Book b);

    public Page<Book> getBooks(int page, int size, String sortBy);
}

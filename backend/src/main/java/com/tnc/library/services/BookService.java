package com.tnc.library.services;

import com.tnc.library.pojo.Book;
import org.springframework.data.domain.Page;

public interface BookService {
    Book addOrUpdateBook(Book b);

    Book getBookByTitle(String title);

    Book getBookByBookId(int id);

    void deleteBook(Book b);

    public Page<Book> getBooks(int page, int size, String sortBy);
}

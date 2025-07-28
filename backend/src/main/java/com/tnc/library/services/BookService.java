package com.tnc.library.services;

import com.tnc.library.pojo.Book;

public interface BookService {
    Book addOrUpdateBook(Book b);
    Book getBookByTitle(String title);
    Book getBookByBookId(int id);
    void deleteBook(Book b);
}

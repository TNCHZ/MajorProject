package com.tnc.library.services.impl;

import com.tnc.library.pojo.Book;
import com.tnc.library.respositories.BookRepository;
import com.tnc.library.services.BookService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class BookServiceImpl implements BookService {

    @Autowired
    private BookRepository bookRepo;

    @Override
    @Transactional
    public Book addOrUpdateBook(Book b) {
        return this.bookRepo.save(b);
    }

    @Override
    public Book getBookByTitle(String title) {
        Optional<Book> book = this.bookRepo.findBookByTitle(title);
        return book.orElse(null);
    }

    @Override
    public Book getBookByBookId(int id) {
        Optional<Book> book = this.bookRepo.findById(id);
        return book.orElse(null);
    }

    @Override
    @Transactional
    public void deleteBook(Book b) {
        this.bookRepo.delete(b);
    }
}

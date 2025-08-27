package com.tnc.library.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tnc.library.configs.CloudinaryConfig;
import com.tnc.library.pojo.Book;
import com.tnc.library.respositories.BookRepository;
import com.tnc.library.services.BookService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class BookServiceImpl implements BookService {
    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private BookRepository bookRepository;

    @Override
    @Transactional
    public Book addOrUpdateBook(Book b) {

        if(b.getFile() != null || !b.getFile().isEmpty())
        {
            try{
                Map res = cloudinary.uploader().upload(b.getFile().getBytes(), ObjectUtils.asMap("resource_type", "image"));
                b.setImage(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(UserServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

        return this.bookRepository.save(b);
    }


    @Override
    public Book findByIsbn(String isbn) {
        if (isbn == null) {
            return null;
        }

        if (isbn.length() == 10) {
            Optional<Book> book = this.bookRepository.findByIsbn10(isbn);
            return book.orElse(null);
        } else if (isbn.length() == 13) {
            Optional<Book> book = this.bookRepository.findByIsbn13(isbn);
            return book.orElse(null);
        }

        return null;
    }

    @Override
    public Book getBookByNameAuthorPublishedDate(String title, String author, int publishedDate) {
        Optional<Book> book = this.bookRepository.findBookByTitleAndAuthorAndPublishedDate(title, author, publishedDate);
        return book.orElse(null);
    }

    @Override
    public Book getBookByBookId(int id) {
        Optional<Book> book = this.bookRepository.findById(id);
        return book.orElse(null);
    }

    @Override
    public List<Book> getBookByTitle(String title) {
        return this.bookRepository.findByTitle(title);
    }

    @Override
    public Integer countAllBook() {
        return (int) this.bookRepository.count();
    }

    @Override
    @Transactional
    public void deleteBook(Book b) {
        this.bookRepository.delete(b);
    }

    @Override
    public Page<Book> getBooks(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return this.bookRepository.findAll(pageable);
    }
}

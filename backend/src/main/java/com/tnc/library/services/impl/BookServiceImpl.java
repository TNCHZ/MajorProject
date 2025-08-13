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
    public Book getBookByTitle(String title) {
        Optional<Book> book = this.bookRepository.findBookByTitle(title);
        return book.orElse(null);
    }

    @Override
    public Book getBookByBookId(int id) {
        Optional<Book> book = this.bookRepository.findById(id);
        return book.orElse(null);
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

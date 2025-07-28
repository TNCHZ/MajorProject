package com.tnc.library.services.impl;

import com.tnc.library.pojo.Author;
import com.tnc.library.respositories.AuthorRepository;
import com.tnc.library.services.AuthorService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthorServiceImpl implements AuthorService {
    @Autowired
    private AuthorRepository authorRepo;


    @Override
    @Transactional
    public Author addOrUpdateAuthor(Author a) {
        return this.authorRepo.save(a);
    }
}

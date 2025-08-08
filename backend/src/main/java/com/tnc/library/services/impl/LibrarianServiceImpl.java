package com.tnc.library.services.impl;

import com.tnc.library.pojo.Librarian;
import com.tnc.library.respositories.LibrarianRepository;
import com.tnc.library.services.LibrarianService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LibrarianServiceImpl implements LibrarianService {

    @Autowired
    private LibrarianRepository librarianRepository;

    @Override
    @Transactional
    public Librarian addOrUpdateLibrarian(Librarian l) {
        return this.librarianRepository.save(l);
    }
}

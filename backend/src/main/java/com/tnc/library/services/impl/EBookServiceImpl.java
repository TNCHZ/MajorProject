package com.tnc.library.services.impl;

import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.EBook;
import com.tnc.library.respositories.EBookRepository;
import com.tnc.library.services.EBookService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EBookServiceImpl implements EBookService {
    @Autowired
    private EBookRepository eBookRepository;

    @Transactional
    @Override
    public EBook addOrUpdateEBook(EBook b) {
        return this.eBookRepository.save(b);
    }

    @Override
    public EBook getBookByEBookId(int id) {
        Optional<EBook> ebook = this.eBookRepository.findById(id);
        return ebook.orElse(null);
    }

    @Transactional
    @Override
    public void deleteEBook(EBook eb) {
        this.eBookRepository.delete(eb);
    }

    @Override
    public Page<EBook> getEBooks(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return this.eBookRepository.findAllEBook(pageable);
    }
}

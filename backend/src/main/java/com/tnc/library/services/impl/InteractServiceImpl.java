package com.tnc.library.services.impl;

import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.Interact;
import com.tnc.library.respositories.InteractRepository;
import com.tnc.library.services.InteractService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InteractServiceImpl implements InteractService {
    @Autowired
    private InteractRepository interactRepository;

    @Transactional
    @Override
    public Interact addOrUpdateInteract(Interact i) {
        return this.interactRepository.save(i);
    }

    @Override
    public Page<Interact> getInteractsByBookId(Book book, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return interactRepository.findByBookId(book, pageable);
    }
}

package com.tnc.library.services.impl;


import com.tnc.library.pojo.Reader;
import com.tnc.library.respositories.ReaderRepository;
import com.tnc.library.services.ReaderService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ReaderServiceImpl implements ReaderService {
    @Autowired
    private ReaderRepository readerRepository;

    @Override
    public Reader findReaderByPhone(String phone) {
        Optional<Reader> reader = this.readerRepository.findByUserPhone(phone);
        return reader.orElse(null);
    }

    @Override
    @Transactional
    public Reader addOrUpdateReader(Reader r) {
        return this.readerRepository.save(r);
    }

    @Override
    public Reader findReaderById(Integer id) {
        Optional<Reader> reader = this.readerRepository.findByUserId(id);
        return reader.orElse(null);
    }

    @Override
    public Integer countAllReader() {
        return (int) this.readerRepository.count();
    }

    @Override
    public Page<Reader> getReaders(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return this.readerRepository.findAll(pageable);
    }
}

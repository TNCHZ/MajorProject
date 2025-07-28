package com.tnc.library.services.impl;


import com.tnc.library.pojo.Reader;
import com.tnc.library.respositories.ReaderRepository;
import com.tnc.library.services.ReaderService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReaderServiceImpl implements ReaderService {
    @Autowired
    private ReaderRepository readerRepo;

    @Override
    @Transactional
    public Reader addOrUpdateReader(Reader r) {
        return this.readerRepo.save(r);
    }
}

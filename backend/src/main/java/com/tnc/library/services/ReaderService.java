package com.tnc.library.services;

import com.tnc.library.pojo.Reader;
import org.springframework.data.domain.Page;


public interface ReaderService {
    Reader findReaderByPhone(String phone);
    Reader addOrUpdateReader(Reader r);
    Reader findReaderById(Integer id);
    public Page<Reader> getReaders(int page, int size, String sortBy);
}

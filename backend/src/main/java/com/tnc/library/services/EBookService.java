package com.tnc.library.services;

import com.tnc.library.pojo.EBook;
import org.springframework.data.domain.Page;

public interface EBookService {
    EBook addOrUpdateEBook(EBook b);

    EBook getBookByEBookId(int id);

    void deleteEBook(EBook eb);

    public Page<EBook> getEBooks(int page, int size, String sortBy);

}

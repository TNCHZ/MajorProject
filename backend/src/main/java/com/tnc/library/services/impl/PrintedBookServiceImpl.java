package com.tnc.library.services.impl;

import com.tnc.library.pojo.PrintedBook;
import com.tnc.library.respositories.PrintedBookRepository;
import com.tnc.library.services.PrintedBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PrintedBookServiceImpl implements PrintedBookService {

    @Autowired
    private PrintedBookRepository printedBookRepository;

    @Override
    public PrintedBook addOrUpdatePrintedBook(PrintedBook b) {
        return this.printedBookRepository.save(b);
    }

    @Override
    public PrintedBook getBookByPrintedBookId(int id) {
        Optional<PrintedBook> printedBook = this.printedBookRepository.findById(id);
        return printedBook.orElse(null);
    }

    @Override
    public void deletePrintedBook(PrintedBook eb) {
        this.printedBookRepository.delete(eb);
    }

    @Override
    public Page<PrintedBook> getPrintedBook(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return this.printedBookRepository.findAll(pageable);
    }
}

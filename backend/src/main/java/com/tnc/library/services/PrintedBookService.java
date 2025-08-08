package com.tnc.library.services;

import com.tnc.library.pojo.PrintedBook;
import org.springframework.data.domain.Page;

public interface PrintedBookService {

    PrintedBook addOrUpdatePrintedBook(PrintedBook b);

    PrintedBook getBookByPrintedBookId(int id);

    void deletePrintedBook(PrintedBook eb);

    public Page<PrintedBook> getPrintedBook(int page, int size, String sortBy);
}

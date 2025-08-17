package com.tnc.library.services.impl;

import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.BorrowSlip;
import com.tnc.library.pojo.PrintedBook;
import com.tnc.library.pojo.PrintedBookBorrowSlip;
import com.tnc.library.respositories.BookRepository;
import com.tnc.library.respositories.PrintedBookBorrowSlipRepository;
import com.tnc.library.services.BookService;
import com.tnc.library.services.PrintedBookBorrowSlipService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PrintedBookBorrowSlipServiceImpl implements PrintedBookBorrowSlipService {

    @Autowired
    private PrintedBookBorrowSlipRepository printedBookBorrowSlipRepository;

    @Autowired
    private BookRepository bookRepository;

    @Transactional
    @Override
    public boolean addOrUpdatePBBS(BorrowSlip borrowSlip, List<Integer> bookIds) {
        try {
            List<PrintedBookBorrowSlip> pbbsList = new ArrayList<>();

            for (Integer bookId : bookIds) {
                PrintedBookBorrowSlip pbbs = new PrintedBookBorrowSlip();
                pbbs.setBorrowSlipId(borrowSlip);

                Book book = this.bookRepository.findById(bookId)
                        .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));
                pbbs.setPrintedBookId(book.getPrintedBook());                pbbs.setPrintedBookId(book.getPrintedBook());

                pbbsList.add(pbbs);
            }

            printedBookBorrowSlipRepository.saveAll(pbbsList);

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false; // có lỗi
        }
    }

}

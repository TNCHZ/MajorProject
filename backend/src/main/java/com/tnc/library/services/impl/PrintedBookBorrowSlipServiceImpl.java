package com.tnc.library.services.impl;

import com.tnc.library.dto.BookBorrowCountDTO;
import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.BorrowSlip;
import com.tnc.library.pojo.PrintedBook;
import com.tnc.library.pojo.PrintedBookBorrowSlip;
import com.tnc.library.respositories.BookRepository;
import com.tnc.library.respositories.PrintedBookBorrowSlipRepository;
import com.tnc.library.respositories.PrintedBookRepository;
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

    @Autowired
    private PrintedBookRepository printedBookRepository;


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

                PrintedBook printedBook = book.getPrintedBook();
                pbbs.setPrintedBookId(printedBook);

                int currentBorrowCount = printedBook.getBorrowCount();
                printedBook.setBorrowCount(currentBorrowCount + 1);
                this.printedBookRepository.save(printedBook);

                pbbsList.add(pbbs);
            }

            printedBookBorrowSlipRepository.saveAll(pbbsList);

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false; // có lỗi
        }
    }

    @Override
    public List<PrintedBookBorrowSlip> getByBorrowSlip(BorrowSlip borrowSlip) {
        return this.printedBookBorrowSlipRepository.findByBorrowSlipId(borrowSlip);
    }

    @Override
    public List<BookBorrowCountDTO> countBorrowedTimesForBooks() {
        List<Object[]> results = this.printedBookBorrowSlipRepository.countBorrowedTimesForBooks();
        List<BookBorrowCountDTO> bookBorrowCountDTOS = new ArrayList<>();
        for (Object[] row : results)
        {
            bookBorrowCountDTOS.add(new BookBorrowCountDTO((String) row[0], (String) row[1], (Long) row[2]));
        }
        return bookBorrowCountDTOS;
    }

}

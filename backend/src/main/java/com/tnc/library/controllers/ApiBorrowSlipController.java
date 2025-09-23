package com.tnc.library.controllers;

import com.tnc.library.dto.BorrowSlipDTO;
import com.tnc.library.dto.MonthlyBorrowingDTO;
import com.tnc.library.dto.PrintedBookDTO;
import com.tnc.library.enums.BorrowStatus;
import com.tnc.library.enums.PrintedBookStatus;
import com.tnc.library.enums.TypeFineEnum;
import com.tnc.library.pojo.*;
import com.tnc.library.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiBorrowSlipController {
    @Autowired
    private BorrowSlipService borrowSlipService;

    @Autowired
    private UserService userSer;

    @Autowired
    private ReaderService readerService;

    @Autowired
    private PrintedBookBorrowSlipService printedBookBorrowSlipService;

    @Autowired
    private FineService fineService;

    @Autowired
    private TypeFineService typeFineService;

    @Autowired
    private PrintedBookService printedBookService;


    @PostMapping("/add/borrow-slip")
    public ResponseEntity<?> addBorrowSlip(
            @RequestPart("borrow-slip") BorrowSlipDTO dto,
            @RequestPart(value = "bookIds", required = false) List<Integer> bookIds,
            Principal principal) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            String username = principal.getName();
            User currentUser = userSer.getUserByUsername(username);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng không hợp lệ");
            }

            Reader reader = readerService.findReaderById(dto.getReaderId());

            if (dto.getReaderId() != null) {
                if (reader == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Không tìm thấy độc giả");
                }
                if (!reader.isMember()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Độc giả chưa là thành viên, không thể mượn sách!");
                }
                if(!borrowSlipService.findByStatusAndReader_Id(BorrowStatus.BORROWING, reader.getId()).isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Độc giả đang có phiếu mượn chưa trả!");
                }
            }

            User userReader = this.userSer.getUserByUserId(dto.getReaderId());



            for (Integer bookId : bookIds) {
                PrintedBook printedBook = this.printedBookService.getBookByPrintedBookId(bookId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Sách \"" + printedBook.getBook().getTitle() + "\" đã hết, không thể mượn thêm!");
            }

            BorrowSlip borrowSlip = new BorrowSlip();
            borrowSlip.setBorrowDate(sdf.parse(dto.getBorrowDate()));
            borrowSlip.setDueDate(sdf.parse(dto.getDueDate()));

            borrowSlip.setNote(dto.getNote());
            borrowSlip.setReader(userReader);
            borrowSlip.setLibrarian(currentUser);
            borrowSlip.setStatus(BorrowStatus.BORROWING);



            BorrowSlip savedBorrowSlip = borrowSlipService.addOrUpdateBorrowSlip(borrowSlip);
            boolean success = printedBookBorrowSlipService.addOrUpdatePBBS(savedBorrowSlip, bookIds);

            if (success) {
                return ResponseEntity.ok("Thêm phiếu mượn thành công");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Có lỗi khi thêm sách vào phiếu mượn");
            }

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm phiếu mượn: " + ex.getMessage());
        }
    }

    @PatchMapping("/update/borrow-slip/{id}")
    public ResponseEntity<?> addBorrowSlip(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> updates,
            Principal principal) {
        try {
            String username = principal.getName();
            User currentUser = userSer.getUserByUsername(username);
            Date today = new Date();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng không hợp lệ");
            }

            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");

            BorrowSlip borrowSlip = this.borrowSlipService.getBorrowSlipById(id);
            BorrowStatus status = BorrowStatus.valueOf(updates.get("status").toString().toUpperCase());


            if (borrowSlip.getStatus().equals(BorrowStatus.RETURNED))
                return ResponseEntity.ok("Sách đã được trả");

            if (status.equals(BorrowStatus.BORROWING)) {
                Date today1 = new Date();
                Calendar cal = Calendar.getInstance();
                cal.setTime(today1);
                cal.add(Calendar.MONTH, 1);
                Date dueDate = cal.getTime();
                borrowSlip.setBorrowDate(today);
                borrowSlip.setDueDate(dueDate);
                borrowSlip.setStatus(status);
                borrowSlip.setLibrarian(currentUser);
                this.borrowSlipService.addOrUpdateBorrowSlip(borrowSlip);
                return ResponseEntity.ok("Sách đã cho mượn thành công");
            }

            borrowSlip.setReturnDate(new Date());
            borrowSlip.setStatus(status);
            BorrowSlip borrowSlip1 = this.borrowSlipService.addOrUpdateBorrowSlip(borrowSlip);



            List<Integer> bookIds = (List<Integer>) updates.get("bookIds");
            Duration duration = Duration.between(borrowSlip1.getDueDate().toInstant(), borrowSlip1.getReturnDate().toInstant());
            if (duration.isNegative() || duration.isZero()) {
                if (status.equals(BorrowStatus.RETURNED)) {
                    for (Integer bookId : bookIds) {
                        PrintedBook printedBook = this.printedBookService.getBookByPrintedBookId(bookId);
                        System.out.println(printedBook.getBorrowCount());
                        printedBook.setBorrowCount(printedBook.getBorrowCount() - 1);
                        this.printedBookService.addOrUpdatePrintedBook(printedBook);
                    }
                    return ResponseEntity.ok("Trả sách thành công");
                } else {
                    String code = updates.get("status").toString().toUpperCase();
                    TypeFine typeFine = new TypeFine();
                    typeFine = this.typeFineService.findByCode(code);

                    Fine fine = new Fine();
                    fine.setReason(typeFine.getName());
                    fine.setPaid(false);
                    fine.setIssuedAt(today);
                    fine.setTypeFine(typeFine);
                    System.out.println(code);
                    TypeFineEnum typeFineEnum = TypeFineEnum.valueOf(code);
                    fine.setAmount(typeFineEnum.calculateFineAmount(BigDecimal.valueOf(Double.parseDouble(updates.get("book_price").toString())), (int) duration.toDays()));
                    fine.setReader(borrowSlip1.getReader());
                    fine.setLibrarian(currentUser);
                    fine.setBorrowSlip(borrowSlip1);
                    this.fineService.addOrUpdateFine(fine);

                    if (status.equals(BorrowStatus.LOST)) {
                        for (Integer bookId : bookIds) {
                            PrintedBook printedBook = this.printedBookService.getBookByPrintedBookId(bookId);
                            printedBook.setBorrowCount(printedBook.getBorrowCount() - 1);
                            printedBook.setTotalCopy(printedBook.getTotalCopy() - 1);
                            this.printedBookService.addOrUpdatePrintedBook(printedBook);
                        }
                    } else if (status.equals(BorrowStatus.DAMAGED)) {
                        for (Integer bookId : bookIds) {
                            PrintedBook printedBook = this.printedBookService.getBookByPrintedBookId(bookId);
                            printedBook.setBorrowCount(printedBook.getBorrowCount() - 1);
                            this.printedBookService.addOrUpdatePrintedBook(printedBook);
                        }
                        return ResponseEntity.ok("Trả sách thành công");
                    }
                }

            } else if (borrowSlip1.getFine() == null) {
                TypeFine typeFine = new TypeFine();
                String code = "OVERDUE_AND_" + updates.get("status").toString().toUpperCase();
                typeFine = this.typeFineService.findByCode(code);

                Fine fine = new Fine();
                fine.setReason(typeFine.getName());
                fine.setPaid(false);
                fine.setIssuedAt(today);
                fine.setTypeFine(typeFine);
                System.out.println(code);
                TypeFineEnum typeFineEnum = TypeFineEnum.valueOf(code);
                fine.setAmount(typeFineEnum.calculateFineAmount(BigDecimal.valueOf(Double.parseDouble(updates.get("book_price").toString())), (int) duration.toDays()));
                fine.setReader(borrowSlip1.getReader());
                fine.setLibrarian(currentUser);
                fine.setBorrowSlip(borrowSlip1);
                this.fineService.addOrUpdateFine(fine);


                if (status.equals(BorrowStatus.LOST)) {
                    for (Integer bookId : bookIds) {
                        PrintedBook printedBook = this.printedBookService.getBookByPrintedBookId(bookId);
                        printedBook.setBorrowCount(printedBook.getBorrowCount() - 1);
                        printedBook.setTotalCopy(printedBook.getTotalCopy() - 1);
                        this.printedBookService.addOrUpdatePrintedBook(printedBook);
                    }
                } else if (status.equals(BorrowStatus.RETURNED)) {
                    for (Integer bookId : bookIds) {
                        PrintedBook printedBook = this.printedBookService.getBookByPrintedBookId(bookId);
                        printedBook.setBorrowCount(printedBook.getBorrowCount() - 1);
                        this.printedBookService.addOrUpdatePrintedBook(printedBook);
                    }
                }

            }
            return ResponseEntity.ok("Đã thêm phiếu phạt");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    @GetMapping("/borrow-slips")
    public Page<Map<String, Object>> getBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy
    ) {
        return this.borrowSlipService.getBorrowSlips(page, size, sortBy)
                .map(b -> {
                    Map<String, Object> brMap = new HashMap<>();
                    brMap.put("id", b.getId());
                    brMap.put("borrowDate", b.getBorrowDate());
                    brMap.put("note", b.getNote());
                    brMap.put("status", b.getStatus());
                    brMap.put("dueDate", b.getDueDate());
                    brMap.put("readerId", b.getReader().getId());
                    brMap.put("readerName", b.getReader().getFullName());
                    brMap.put("readerPhone", b.getReader().getPhone());
                    brMap.put("returnDate", b.getReturnDate());
                    if (b.getFine() != null) {
                        brMap.put("fine", b.getFine().isPaid());
                    }
                    return brMap;
                });
    }


    @GetMapping("/borrow-slip/{id}")
    public ResponseEntity<?> getBooksByBorrowSlip(@PathVariable Integer id) {
        BorrowSlip borrowSlip = this.borrowSlipService.getBorrowSlipById(id);

        List<PrintedBookBorrowSlip> books = this.printedBookBorrowSlipService.getByBorrowSlip(borrowSlip);

        if (books.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy sách nào cho borrowSlip " + id);
        }
        // Lấy list PrintedBook từ PrintedBookBorrowSlip
        List<PrintedBookDTO> printedBooks = books.stream()
                .map(b -> new PrintedBookDTO(
                        b.getPrintedBookId().getId(),
                        b.getPrintedBookId().getBook().getTitle(),
                        b.getPrintedBookId().getBook().getAuthor(),
                        b.getPrintedBookId().getBook().getPublishedDate(),
                        b.getPrintedBookId().getBook().getPrice()
                ))
                .toList();

        return ResponseEntity.ok(printedBooks);
    }

    @GetMapping("/borrow-slip/by-reader")
    public ResponseEntity<?> getBorrowSlipByReader(Principal principal,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "10") int size) {
        try {
            String username = principal.getName();
            User currentUser = userSer.getUserByUsername(username);
            Page<BorrowSlip> borrowSlips = borrowSlipService.getBorrowSlipsByReader(currentUser, page, size);
            return ResponseEntity.ok(borrowSlips);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/borrow-slips/reader")
    public ResponseEntity<?> getBorrowSlipReader(Principal principal,
                                                 @RequestParam String phone,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "10") int size) {
        try {
            String username = principal.getName();
            User currentUser = userSer.getUserByUsername(username);

            // Nếu là READER thì chỉ được xem phiếu mượn của chính mình
            if (Objects.equals(currentUser.getRole(), "READER")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Bạn không có quyền xem phiếu mượn của người khác");
            }

            Reader reader = this.readerService.findReaderByPhone(phone);
            if (reader == null) {
                return ResponseEntity.notFound().build();
            }

            Page<BorrowSlip> borrowSlips = borrowSlipService.getBorrowSlipsByReader(reader.getUser(), page, size);

            Page<Map<String, Object>> result = borrowSlips.map(b -> {
                Map<String, Object> brMap = new HashMap<>();
                brMap.put("id", b.getId());
                brMap.put("borrowDate", b.getBorrowDate());
                brMap.put("note", b.getNote());
                brMap.put("status", b.getStatus());
                brMap.put("dueDate", b.getDueDate());
                brMap.put("readerId", b.getReader().getId());
                brMap.put("readerName", b.getReader().getFullName());
                brMap.put("readerPhone", b.getReader().getPhone());
                brMap.put("returnDate", b.getReturnDate());
                if (b.getFine() != null) {
                    brMap.put("fine", b.getFine().isPaid());
                }
                return brMap;
            });

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra: " + e.getMessage());
        }
    }


    @GetMapping("/borrow-slip/count")
    public ResponseEntity<?> countBorrowingSlips(@RequestParam String status) {
        BorrowStatus borrowStatus = BorrowStatus.valueOf(status);
        Integer count = borrowSlipService.countByStatus(borrowStatus);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/borrow-slip/count/monthly")
    public ResponseEntity<List<MonthlyBorrowingDTO>> getMonthlyBorrowings(@RequestParam int year) {
        return ResponseEntity.ok(borrowSlipService.getMonthlyBorrowings(year));
    }


    @DeleteMapping("/borrow-slip/delete/{id}")
    public ResponseEntity<?> deleteBorrowSlip(@PathVariable Integer id, Principal principal) {
        try {
            String username = principal.getName();
            User currentUser = userSer.getUserByUsername(username);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng không hợp lệ");
            }
            BorrowSlip borrowSlip = this.borrowSlipService.getBorrowSlipById(id);

            this.borrowSlipService.deleteBorrowSlip(borrowSlip);
            return ResponseEntity.ok("Xóa thành công");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    @PostMapping("/borrow-slip/add/by-reader")
    public ResponseEntity<?> addBorrowSlipByReader(@RequestBody Map<String, List<Map<String, Integer>>> body, Principal principal) {
        try {
            String username = principal.getName();
            User currentUser = this.userSer.getUserByUsername(username);


            if (currentUser != null) {
                if (!currentUser.getReader().isMember()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Độc giả chưa là thành viên, không thể mượn sách!");
                }
                if(!borrowSlipService.findByStatusAndReader_Id(BorrowStatus.BORROWING, currentUser.getId()).isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Độc giả đang có phiếu mượn chưa trả!");
                }
            }

            List<Map<String, Integer>> books = body.get("books");

            // Chuyển từ List<Map<String, Integer>> sang List<Integer>
            List<Integer> bookIds = books.stream()
                    .map(b -> b.get("bookId"))
                    .toList();

            for (Integer bookId : bookIds) {
                PrintedBook printedBook = this.printedBookService.getBookByPrintedBookId(bookId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Sách \"" + printedBook.getBook().getTitle() + "\" đã hết, không thể mượn thêm!");
            }

            BorrowSlip borrowSlip = new BorrowSlip();
            borrowSlip.setReader(currentUser);
            borrowSlip.setStatus(BorrowStatus.RESERVED);

            BorrowSlip savedBorrowSlip = borrowSlipService.addOrUpdateBorrowSlip(borrowSlip);
            boolean success = printedBookBorrowSlipService.addOrUpdatePBBS(savedBorrowSlip, bookIds);

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}

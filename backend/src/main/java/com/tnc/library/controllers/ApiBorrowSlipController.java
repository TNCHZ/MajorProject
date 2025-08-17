package com.tnc.library.controllers;

import com.tnc.library.dto.BorrowSlipDTO;
import com.tnc.library.enums.BorrowStatus;
import com.tnc.library.pojo.BorrowSlip;
import com.tnc.library.pojo.Reader;
import com.tnc.library.pojo.User;
import com.tnc.library.services.BorrowSlipService;
import com.tnc.library.services.PrintedBookBorrowSlipService;
import com.tnc.library.services.ReaderService;
import com.tnc.library.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @PostMapping("/add/borrow-slip")
    public ResponseEntity<?> addBorrowSlip(
            @RequestPart("borrow-slip") BorrowSlipDTO dto,
            @RequestPart(value = "bookIds", required = false) List<Integer> bookIds,
            Principal principal) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
            String username = principal.getName();
            User currentUser = userSer.getUserByUsername(username);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng không hợp lệ");
            }

            BorrowSlip borrowSlip = new BorrowSlip();
            borrowSlip.setBorrowDate(sdf.parse(dto.getBorrowDate()));
            borrowSlip.setDueDate(sdf.parse(dto.getDueDate()));
            borrowSlip.setStatus(BorrowStatus.BORROWING);
            borrowSlip.setNote(dto.getNote());

            if (currentUser.getLibrarian() != null) {
                borrowSlip.setLibrarianId(currentUser.getLibrarian());
            }

            if (dto.getReaderId() != null) {
                Reader reader = readerService.findReaderById(dto.getReaderId());
                borrowSlip.setReaderId(reader);
            }

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
                    brMap.put("dueDate",b.getDueDate());
                    brMap.put("readerName",b.getReaderId().getUser().getFullName());
                    brMap.put("returnDate",b.getReturnDate());

                    return brMap;
                });
    }
    
}

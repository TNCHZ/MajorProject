package com.tnc.library.controllers;

import com.tnc.library.dto.MonthlyBorrowingDTO;
import com.tnc.library.dto.MonthlyFineDTO;
import com.tnc.library.enums.PaymentMethod;
import com.tnc.library.pojo.*;
import com.tnc.library.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api")
public class ApiFineController {
    @Autowired
    private PaymentService paymentService;

    @Autowired
    private FineService fineService;

    @Autowired
    private ReaderService readerService;

    @Autowired
    private LibrarianService librarianService;

    @Autowired
    private UserService userService;

    @Autowired
    private BorrowSlipService borrowSlipService;

    @PatchMapping("/update/fine/{id}")
    public ResponseEntity<?> addFine(
            @PathVariable Integer id,
            @RequestPart("fine") String method,
            Principal principal)
    {
        try{
            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");

            String username = principal.getName();
            User currentUser = userService.getUserByUsername(username);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Không tìm thấy thông tin người dùng");
            }

            Fine fine = this.fineService.getFineById(id);


            Payment payment = new Payment();
            payment.setLibrarianId(fine.getLibrarianId());
            payment.setPaid(true);
            payment.setAmount(fine.getAmount());
            payment.setReaderId(fine.getReaderId());
            payment.setPaymentDate(new Date());
            payment.setTitle(fine.getReason());
            payment.setMethod("IN_PERSON".equals(method) ? PaymentMethod.IN_PERSON : PaymentMethod.ONLINE);
            Payment payment1 = paymentService.addOrUpdatePayment(payment);

            fine.setPaid(true);
            fine.setPayment(payment1);
            this.fineService.addOrUpdateFine(fine);



            return ResponseEntity.ok("Thêm fine thành công!");

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi");
        }
    }


    @GetMapping("/fines")
    public Page<Map<String, Object>> getBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy
    ) {
        return this.fineService.getFines(page, size, sortBy)
                .map(f -> {
                    Map<String, Object> fineMap = new HashMap<>();
                    fineMap.put("id", f.getId());
                    fineMap.put("reason", f.getReason());
                    fineMap.put("issuedAt", f.getIssuedAt());
                    fineMap.put("amount", f.getAmount());
                    fineMap.put("isPaid", f.isPaid());
                    fineMap.put("readerId", f.getReaderId().getId());
                    fineMap.put("readerName", f.getReaderId().getUser().getFullName());
                    fineMap.put("borrowSlipId", f.getBorrowSlip().getId());
                    return fineMap;
                });
    }

    @GetMapping("/fine/amount/monthly")
    public ResponseEntity<List<MonthlyFineDTO>> getMonthlyBorrowings(@RequestParam int year) {
        return ResponseEntity.ok(fineService.getMonthlyFines(year));
    }
}

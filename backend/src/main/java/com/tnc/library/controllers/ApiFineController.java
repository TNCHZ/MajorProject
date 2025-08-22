package com.tnc.library.controllers;

import com.tnc.library.dto.FineDTO;
import com.tnc.library.enums.PaymentMethod;
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
import java.util.Date;
import java.util.HashMap;
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

    @PostMapping("/add/fine")
    public ResponseEntity<?> addFine(@RequestPart("fine")FineDTO dto, Principal principal)
    {
        try{
            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");

            String username = principal.getName();
            User currentUser = userService.getUserByUsername(username);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Không tìm thấy thông tin người dùng");
            }
            Reader reader = readerService.findReaderById(dto.getReaderId());

            Payment payment = new Payment();
            payment.setTitle(dto.getTitle());
            payment.setPaid(true);
            payment.setAmount(new BigDecimal(dto.getAmount()));
            payment.setPaymentDate(new Date());
            payment.setMethod("IN_PERSON".equals(dto.getMethod()) ? PaymentMethod.IN_PERSON : PaymentMethod.ONLINE);
            payment.setReaderId(reader);
            payment.setLibrarianId(currentUser.getLibrarian());
            Payment payment1 = this.paymentService.addOrUpdatePayment(payment);

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
}

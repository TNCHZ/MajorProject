package com.tnc.library.controllers;

import com.tnc.library.dto.MembershipDTO;
import com.tnc.library.enums.PaymentMethod;
import com.tnc.library.pojo.*;
import com.tnc.library.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.Calendar;
import java.util.Date;

@RestController
@RequestMapping("/api")
public class ApiMembershipRenewal {
    @Autowired
    private MembershipRenewalService membershipRenewalService;

    @Autowired
    private UserService userService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ReaderService readerService;

    @Autowired
    private TypeMembershipService typeMembershipService;

    @PostMapping("/membership/add")
    public ResponseEntity<?> addMembership(@RequestPart("membership") MembershipDTO membershipDTO, Principal principal) {
        try {
            String username = principal.getName();
            User currentUser = userService.getUserByUsername(username);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng không hợp lệ");
            }

            if (membershipDTO.getReaderId() == null) {
                return ResponseEntity.badRequest().body("ReaderId không được để trống");
            }

            Reader reader = readerService.findReaderById(membershipDTO.getReaderId());
            if (reader == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy độc giả");
            }
            reader.setMember(true);
            Reader reader1 = this.readerService.addOrUpdateReader(reader);
            TypeMembership typeMembership = typeMembershipService.findById(membershipDTO.getTypeId());
            if (typeMembership == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy loại thành viên");
            }

            Date startDate = new Date();
            Calendar cal = Calendar.getInstance();
            cal.setTime(startDate);
            cal.add(Calendar.MONTH, typeMembership.getDuration());
            Date expireDate = cal.getTime();

            Payment payment = new Payment();
            payment.setTitle(membershipDTO.getTitle());
            payment.setPaymentDate(startDate);
            payment.setAmount(new BigDecimal(membershipDTO.getAmount()));
            payment.setLibrarian(currentUser);
            payment.setMethod("IN_PERSON".equals(membershipDTO.getMethod()) ? PaymentMethod.IN_PERSON : PaymentMethod.ONLINE);
            payment.setReader(reader1.getUser());
            payment.setPaid(true);
            Payment payment1 = this.paymentService.addOrUpdatePayment(payment);

            MembershipRenewal membershipRenewal = new MembershipRenewal();
            membershipRenewal.setStartDate(startDate);
            membershipRenewal.setExpireDate(expireDate);
            membershipRenewal.setType(typeMembership);
            membershipRenewal.setReader(reader1.getUser());
            membershipRenewal.setPayment(payment1);
            membershipRenewalService.addOrUpdateMembership(membershipRenewal);

            return ResponseEntity.ok("Thêm thành viên thành công");
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm thành viên: " + ex.getMessage());
        }
    }

}

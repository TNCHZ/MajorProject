package com.tnc.library.controllers;

import com.tnc.library.pojo.Reader;
import com.tnc.library.pojo.User;
import com.tnc.library.services.MailService;
import com.tnc.library.services.MembershipRenewalService;
import com.tnc.library.services.ReaderService;
import com.tnc.library.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ApiReaderController {
    @Autowired
    private UserService userSer;

    @Autowired
    private ReaderService readerSer;

    @Autowired
    private MailService mailService;

    @PostMapping("/add/reader")
    public ResponseEntity<?> addUser(@ModelAttribute User u) {
        try {
            if (u.getRole() == null || u.getRole().isBlank()) {
                return ResponseEntity.badRequest().body("Vai trò không được để trống!");
            }

            if (userSer.getUserByEmail(u.getEmail()) != null)
                return ResponseEntity.badRequest().body("Email đã tồn tại");

            if(userSer.getUserByPhone(u.getPhone())!= null)
                return ResponseEntity.badRequest().body("Số điện thoại đã tồn tại");



            User userSaved = this.userSer.addOrUpdateUser(u);
            Reader r = new Reader();
            r.setMember(Boolean.FALSE);
            r.setUser(userSaved);
            mailService.sendMail(u.getEmail(),"Tài khoản của bạn là", "Tài khoản là: " + u.getPhone() + "\nMật khẩu là: " + u.getPhone());
            this.readerSer.addOrUpdateReader(r);

            return ResponseEntity.ok(userSaved);
        } catch (Exception e) {
            e.printStackTrace(); // Log ra console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm người dùng: " + e.getMessage());
        }
    }

    @GetMapping("/reader/find-by-phone")
    public ResponseEntity<?> getReaderByPhone(@RequestParam String phone) {
        try {
            Reader reader = this.readerSer.findReaderByPhone(phone);
            if (reader == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Không tìm thấy Reader với số điện thoại: " + phone);
            }

            Map<String, Object> readerMap = new HashMap<>();
            readerMap.put("id", reader.getId());
            readerMap.put("name", reader.getUser().getFullName());
            readerMap.put("avatar", reader.getUser().getAvatar());
            readerMap.put("phone", reader.getUser().getPhone());
            readerMap.put("email", reader.getUser().getEmail());
            readerMap.put("gender", reader.getUser().isGender());
            readerMap.put("isMember", reader.isMember());

            return ResponseEntity.ok(readerMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tìm Reader: " + e.getMessage());
        }
    }

    @GetMapping("/reader/{id}")
    public ResponseEntity<?> getReaderById(@PathVariable Integer id) {
        try {
            Reader reader = this.readerSer.findReaderById(id);
            if (reader == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Không tìm thấy Reader");
            }

            Map<String, Object> readerMap = new HashMap<>();
            readerMap.put("id", reader.getId());
            readerMap.put("firstName", reader.getUser().getFirstName());
            readerMap.put("lastName", reader.getUser().getLastName());
            readerMap.put("avatar", reader.getUser().getAvatar());
            readerMap.put("phone", reader.getUser().getPhone());
            readerMap.put("email", reader.getUser().getEmail());
            readerMap.put("gender", reader.getUser().isGender());
            readerMap.put("isMember", reader.isMember());

            return ResponseEntity.ok(readerMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tìm Reader: " + e.getMessage());
        }
    }

    @GetMapping("/readers")
    public Page<Map<String, Object>> getReaders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy
    ) {
        return this.readerSer.getReaders(page, size, sortBy)
                .map(r -> {
                    Map<String, Object> readerMap = new HashMap<>();
                    readerMap.put("id", r.getId());
                    readerMap.put("name", r.getUser().getFullName());
                    readerMap.put("avatar", r.getUser().getAvatar());
                    readerMap.put("email", r.getUser().getEmail());
                    readerMap.put("phone", r.getUser().getPhone());
                    readerMap.put("gender", r.getUser().isGender());
                    readerMap.put("isMember", r.isMember());
                    return readerMap;
                });
    }

    @GetMapping("/reader/count")
    public ResponseEntity<?> getReaderCount(){
        Integer countAllReader = this.readerSer.countAllReader();
        return ResponseEntity.ok(countAllReader);
    }
}

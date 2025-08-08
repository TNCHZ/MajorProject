package com.tnc.library.controllers;

import com.tnc.library.pojo.Reader;
import com.tnc.library.pojo.User;
import com.tnc.library.services.ReaderService;
import com.tnc.library.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiReaderController {
    @Autowired
    private UserService userSer;

    @Autowired
    private ReaderService readerSer;


    @PostMapping("/readers/add")
    public ResponseEntity<?> addUser(@ModelAttribute User u) {
        try {
            if (u.getRole() == null || u.getRole().isBlank()) {
                return ResponseEntity.badRequest().body("Vai trò không được để trống!");
            }

            // Lưu User
            User userSaved = this.userSer.addOrUpdateUser(u);
            Reader r = new Reader();
            r.setMember(Boolean.FALSE);
            r.setUser(userSaved);
            this.readerSer.addOrUpdateReader(r);

            return ResponseEntity.ok(userSaved);
        } catch (Exception e) {
            e.printStackTrace(); // Log ra console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm người dùng: " + e.getMessage());
        }
    }

}

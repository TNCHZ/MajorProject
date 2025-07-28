package com.tnc.library.controllers;

import com.tnc.library.pojo.Admin;
import com.tnc.library.pojo.Librarian;
import com.tnc.library.pojo.Reader;
import com.tnc.library.pojo.User;
import com.tnc.library.services.AdminService;
import com.tnc.library.services.LibrarianService;
import com.tnc.library.services.ReaderService;
import com.tnc.library.services.UserService;
import com.tnc.library.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;

@RestController
@RequestMapping("/api")
public class ApiUserController {
    @Autowired
    private UserService userSer;

    @Autowired
    private LibrarianService librarianSer;

    @Autowired
    private ReaderService readerSer;

    @Autowired
    private AdminService adminSer;

    @PostMapping("/users/add")
    public ResponseEntity<?> addUser(@ModelAttribute User u) {
        try {
            if (u.getRole() == null || u.getRole().isBlank()) {
                return ResponseEntity.badRequest().body("Vai trò không được để trống!");
            }

            // Lưu User
            User userSaved = this.userSer.addOrUpdateUser(u);

            switch (u.getRole().toUpperCase()) {
                case "LIBRARIAN": {
                    Librarian l = new Librarian();
                    l.setUser(userSaved);
                    this.librarianSer.addOrUpdateLibrarian(l);
                    break;
                }
                case "READER": {
                    Reader r = new Reader();
                    r.setUser(userSaved);
                    this.readerSer.addOrUpdateReader(r);
                    break;
                }
                case "ADMIN": {
                    Admin a = new Admin();
                    a.setUser(userSaved);
                    this.adminSer.addOrUpdateAdmin(a);
                    break;
                }
                default:
                    return ResponseEntity.badRequest().body("Role không hợp lệ: " + u.getRole());
            }

            return ResponseEntity.ok(userSaved);
        } catch (Exception e) {
            e.printStackTrace(); // Log ra console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm người dùng: " + e.getMessage());
        }
    }


    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody User u) {
        if (u.getUsername() == null || u.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username hoặc password không được để trống");
        }

        if (this.userSer.authenticate(u.getUsername(), u.getPassword())) {
            try {
                String token = JwtUtils.generateToken(u.getUsername());
                return ResponseEntity.ok().body(Collections.singletonMap("token", token));
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Lỗi khi tạo JWT");
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai thông tin đăng nhập");
    }

    @RequestMapping("/secure/profile")
    @ResponseBody
    @CrossOrigin
    public ResponseEntity<User> getProfile(Principal principal) {
        return new ResponseEntity<>(this.userSer.getUserByUsername(principal.getName()), HttpStatus.OK);
    }

}

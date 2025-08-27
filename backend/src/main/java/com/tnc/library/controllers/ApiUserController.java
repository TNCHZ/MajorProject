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
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiUserController {
    @Autowired
    private UserService userSer;

    @Autowired
    private ReaderService readerService;

    @Autowired
    private LibrarianService librarianService;

    @Autowired
    private AdminService adminService;

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


    @GetMapping("/users")
    public Page<Map<String, Object>> getReaders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy
    ) {
        return this.userSer.getUsers(page, size, sortBy)
                .map(r -> {
                    Map<String, Object> readerMap = new HashMap<>();
                    readerMap.put("id", r.getId());
                    readerMap.put("name", r.getFullName());
                    readerMap.put("avatar", r.getAvatar());
                    readerMap.put("email", r.getEmail());
                    readerMap.put("phone", r.getPhone());
                    readerMap.put("gender", r.isGender());
                    readerMap.put("active", r.isActive());
                    readerMap.put("role", r.getRole());
                    return readerMap;
                });
    }

    @PostMapping("/add/user")
    public ResponseEntity<?> addUser(@ModelAttribute User u) {
        try {
            if (u.getRole() == null || u.getRole().isBlank()) {
                return ResponseEntity.badRequest().body("Vai trò không được để trống!");
            }

            // Lưu User
            User userSaved = this.userSer.addOrUpdateUser(u);
            switch (u.getRole()){
                case "READER":
                    Reader r = new Reader();
                    r.setMember(Boolean.FALSE);
                    r.setUser(userSaved);
                    this.readerService.addOrUpdateReader(r);
                    break;
                case "LIBRARIAN":
                    Librarian librarian = new Librarian();
                    librarian.setUser(userSaved);
                    librarian.setStartDate(new Date());
                    this.librarianService.addOrUpdateLibrarian(librarian);
                    break;
                case "ADMIN":
                    Admin admin = new Admin();
                    admin.setUser(userSaved);
                    this.adminService.addOrUpdateAdmin(admin);
                    break;
                default:
                    return ResponseEntity.badRequest().body("Vai trò không hợp lệ: " + u.getRole());
            }

            return ResponseEntity.ok(userSaved);
        } catch (Exception e) {
            e.printStackTrace(); // Log ra console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm người dùng: " + e.getMessage());
        }
    }
}

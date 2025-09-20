package com.tnc.library.controllers;

import com.tnc.library.pojo.Admin;
import com.tnc.library.pojo.Librarian;
import com.tnc.library.pojo.Reader;
import com.tnc.library.pojo.User;
import com.tnc.library.services.*;
import com.tnc.library.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

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

    @Autowired
    private OtpService otpService;

    @Autowired
    private MailService mailService;


    @Autowired
    private PasswordEncoder passwordEncoder;

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


    @GetMapping("/user/email")
    public ResponseEntity<?> findUserByEmail(@RequestParam String email)
    {
        try{
            User user = this.userSer.getUserByEmail(email);

            if(user == null)
                return ResponseEntity.status(404).body("Không tìm thấy user");

            return ResponseEntity.ok("Email tồn tại");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/user/forgot")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {

        User user = this.userSer.getUserByEmail(email);

        if(user == null)
            return ResponseEntity.status(404).body("Không tìm thấy user");


        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        otpService.saveOtp(email, otp);
        mailService.sendMail(email,"Mã OTP xác thực", "Mã OTP của bạn là: " + otp + "\nMã này sẽ hết hạn sau 5 phút.");

        return ResponseEntity.ok("OTP đã gửi qua email");
    }
    @PostMapping("/user/verify-forgot")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        String cachedOtp = otpService.getOtp(email);

        if (cachedOtp == null) {
            return ResponseEntity.status(404).body("OTP đã hết hạn");
        }

        if (!cachedOtp.equals(otp)) {
            return ResponseEntity.status(400).body("OTP không chính xác");
        }

        // OTP đúng → sinh reset token
        String resetToken = UUID.randomUUID().toString();
        otpService.saveResetToken(email, resetToken); // TTL 10 phút

        return ResponseEntity.ok(Map.of(
                "message", "Xác minh OTP thành công",
                "resetToken", resetToken
        ));
    }

    @PatchMapping("/user/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String resetToken, @RequestParam String password) {
        String email = otpService.getEmailByResetToken(resetToken);

        if (email == null) {
            return ResponseEntity.status(400).body("Reset token không hợp lệ hoặc đã hết hạn");
        }

        User user = this.userSer.getUserByEmail(email);
        user.setPassword(password);
        this.userSer.addOrUpdateUser(user);

        otpService.deleteOtp(resetToken);

        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

    @PostMapping("/user/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> payload,
            Principal principal) {
        try {
            String oldPassword = payload.get("oldPassword");
            String newPassword = payload.get("newPassword");
            if (oldPassword == null || oldPassword.trim().isEmpty() ||
                    newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Mật khẩu không được để trống");
            }

            String username = principal.getName();
            User user = this.userSer.getUserByUsername(username);
            if (user == null) {
                return ResponseEntity.status(404).body("Không tìm thấy user");
            }

            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                return ResponseEntity.status(400).body("Mật khẩu cũ không đúng");
            }

            user.setPassword(newPassword);
            this.userSer.addOrUpdateUser(user);

            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PatchMapping("/user/update/{id}")
    public ResponseEntity<?> updateUserByAdminOrLibrarian(@PathVariable Integer id, @ModelAttribute User u, Principal principal) {
        try {
            String username = principal.getName();
            User currentUser = this.userSer.getUserByUsername(username);

            if (!currentUser.getRole().equals("ADMIN") && !currentUser.getRole().equals("LIBRARIAN")) {
                return ResponseEntity.badRequest().body("Người dùng không hợp lệ");
            }

            User user = this.userSer.getUserByUserId(id);
            if (user == null) {
                return ResponseEntity.status(404).body("Không tìm thấy user");
            }

            if (u.getFirstName() != null && !u.getFirstName().isBlank()) {
                user.setFirstName(u.getFirstName());
            }
            if (u.getLastName() != null && !u.getLastName().isBlank()) {
                user.setLastName(u.getLastName());
            }
            if (u.getEmail() != null && !u.getEmail().isBlank()) {
                user.setEmail(u.getEmail());
            }
            if (u.getPhone() != null && !u.getPhone().isBlank()) {
                user.setPhone(u.getPhone());
            }
            if (u.getFile() != null && !u.getFile().isEmpty()) {
                user.setFile(u.getFile());
            }
            user.setGender(u.isGender());


            this.userSer.addOrUpdateUser(user);

            return ResponseEntity.ok("Cập nhật thông tin thành công");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    @PatchMapping("/user/update")
    public ResponseEntity<?> updateUser(@ModelAttribute User u, Principal principal) {
        try {
            String username = principal.getName();
            User user = this.userSer.getUserByUsername(username);

            if (user == null) {
                return ResponseEntity.status(404).body("Không tìm thấy user");
            }

            if (u.getFirstName() != null && !u.getFirstName().isBlank()) {
                user.setFirstName(u.getFirstName());
            }
            if (u.getLastName() != null && !u.getLastName().isBlank()) {
                user.setLastName(u.getLastName());
            }
            if (u.getEmail() != null && !u.getEmail().isBlank()) {
                user.setEmail(u.getEmail());
            }
            if (u.getPhone() != null && !u.getPhone().isBlank()) {
                user.setPhone(u.getPhone());
            }
            if (u.getFile() != null && !u.getFile().isEmpty()) {
                user.setFile(u.getFile());
            }
            user.setGender(u.isGender());


            this.userSer.addOrUpdateUser(user);

            return ResponseEntity.ok("Cập nhật thông tin thành công");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @DeleteMapping("/user/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id, Principal principal){
        try {
            String username = principal.getName();
            User currentUser = this.userSer.getUserByUsername(username);

            if (!currentUser.getRole().equals("ADMIN")) {
                return ResponseEntity.badRequest().body("Người dùng không hợp lệ");
            }

            User user = this.userSer.getUserByUserId(id);
            this.userSer.deleteUser(user);
            return ResponseEntity.ok("Xóa thành công");


        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

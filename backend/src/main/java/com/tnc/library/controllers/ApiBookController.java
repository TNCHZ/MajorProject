package com.tnc.library.controllers;

import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.User;
import com.tnc.library.services.BookService;
import com.tnc.library.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiBookController {
    @Autowired
    private BookService bookSer;

    @Autowired
    private UserService userSer;

    @PostMapping("/add/book")
    public ResponseEntity<?> addBook(@ModelAttribute(value = "book") Book b, Principal principal){
        String username = principal.getName();
        User currentUser = userSer.getUserByUsername(username);
        if(currentUser != null)
        {
            b.setLibrarianId(currentUser.getLibrarian());
            this.bookSer.addOrUpdateBook(b);
        }
        return ResponseEntity.ok("Thêm thành công");
    }

    @GetMapping("/books")
    public Page<Book> getBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy
    ) {
        return this.bookSer.getBooks(page, size, sortBy);
    }
}

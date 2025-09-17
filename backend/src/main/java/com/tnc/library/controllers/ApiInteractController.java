package com.tnc.library.controllers;


import com.tnc.library.dto.InteractDTO;
import com.tnc.library.dto.InteractResponseDTO;
import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.Interact;
import com.tnc.library.pojo.User;
import com.tnc.library.services.BookService;
import com.tnc.library.services.InteractService;
import com.tnc.library.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiInteractController {
    @Autowired
    private InteractService interactService;

    @Autowired
    private UserService userService;

    @Autowired
    private BookService bookService;

    @PostMapping("/add/interact")
    public ResponseEntity<?> addInteract(@RequestBody InteractDTO interactDTO, Principal principal)
    {
        try{
            String username = principal.getName();
            User currentUser = userService.getUserByUsername(username);

            Interact interact = new Interact();
            interact.setBookId(this.bookService.getBookByBookId(interactDTO.getBookId()));
            interact.setComment(interactDTO.getComment());
            interact.setReact(interactDTO.getReact());
            interact.setReaderId(currentUser.getReader());
            this.interactService.addOrUpdateInteract(interact);


            return ResponseEntity.ok("Tương tác thành công");

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm tương tác: " + ex.getMessage());
        }
    }

    @GetMapping("/interacts/book/{id}")
    public ResponseEntity<?> getInteractByBookId(@PathVariable Integer id,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "5") int size) {
        try {
            Book book = bookService.getBookByBookId(id);
            Page<Interact> interacts = interactService.getInteractsByBookId(book, page, size);

            Page<InteractResponseDTO> dtoPage = interacts.map(interact -> {
                InteractResponseDTO dto = new InteractResponseDTO();
                dto.setId(interact.getId());
                dto.setReact(interact.getReact());
                dto.setComment(interact.getComment());
                dto.setName(interact.getReaderId().getUser().getFullName());
                dto.setAvatar(interact.getReaderId().getUser().getAvatar());
                return dto;
            });

            return ResponseEntity.ok(dtoPage);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi: " + ex.getMessage());
        }
    }
}

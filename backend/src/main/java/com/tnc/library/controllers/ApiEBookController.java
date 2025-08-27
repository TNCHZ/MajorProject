package com.tnc.library.controllers;


import com.tnc.library.pojo.EBook;
import com.tnc.library.pojo.User;
import com.tnc.library.services.EBookService;
import com.tnc.library.services.UserService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;

@RestController
@RequestMapping("/api")
public class ApiEBookController {
    @Autowired
    private EBookService eBookService;

    @Autowired
    private UserService userSer;


    @GetMapping("/ebooks/{id}/file")
    public ResponseEntity<?> downloadEBook(@PathVariable Integer id, Principal principal) {
        String username = principal.getName();
        User currentUser = userSer.getUserByUsername(username);

        if (!currentUser.getReader().isMember()) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Không phải là thành viên");
        }

        EBook ebook = eBookService.getBookByEBookId(id);

        try {
            Path path = Paths.get(System.getProperty("user.dir"), ebook.getFileUrl());
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + path.getFileName().toString() + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tải ebook: " + e.getMessage());
        }
    }




}

package com.tnc.library.controllers;

import com.tnc.library.dto.BookDTO;
import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.EBook;
import com.tnc.library.pojo.PrintedBook;
import com.tnc.library.pojo.User;
import com.tnc.library.services.BookService;
import com.tnc.library.services.EBookService;
import com.tnc.library.services.PrintedBookService;
import com.tnc.library.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiBookController {
    @Autowired
    private BookService bookSer;

    @Autowired
    private UserService userSer;

    @Autowired
    private EBookService eBookService;

    @Autowired
    private PrintedBookService printedBookService;

    @PostMapping("/add/book")
    public ResponseEntity<?> addBook(
            @RequestPart("book") BookDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "ebookFile", required = false) MultipartFile ebookFile,
            Principal principal) {
        try {
            String username = principal.getName();
            User currentUser = userSer.getUserByUsername(username);
            System.out.println(dto);
            if (currentUser != null) {
                Book b = new Book();
                b.setTitle(dto.getTitle());
                b.setAuthor(dto.getAuthor());
                b.setPublisher(dto.getPublisher());
                b.setDescription(dto.getDescription());
                b.setLanguage(dto.getLanguage());
                b.setPublishedDate(Integer.parseInt(dto.getPublishedDate()));
                b.setIsbn10(dto.getIsbn10());
                b.setIsbn13(dto.getIsbn13());
                b.setPrice(new BigDecimal(dto.getPrice()));
                b.setPrinted(Boolean.parseBoolean(dto.getIsPrinted()));
                b.setElectronic(Boolean.parseBoolean(dto.getIsElectronic()));
                b.setLibrarianId(currentUser.getLibrarian());

                if (file != null && !file.isEmpty()) {
                    b.setFile(file);
                }

                Book bookSaved = this.bookSer.addOrUpdateBook(b);

                if (bookSaved.isElectronic()){
                    EBook eBook = new EBook();
                    eBook.setBook(bookSaved);
                    eBook.setFormat(dto.getFormat());
                    eBook.setLicence(dto.getLicence());
                    eBook.setFile(ebookFile);
                    eBook.setTotalView(0);
                    this.eBookService.addOrUpdateEBook(eBook);
                }
                if(bookSaved.isPrinted())
                {
                    PrintedBook printedBook = new PrintedBook();
                    printedBook.setBook(bookSaved);
                    printedBook.setShelfLocation(dto.getShelfLocation());
                    printedBook.setTotalCopy(Integer.parseInt(dto.getTotalCopy()));
                    printedBook.setBorrowCount(0);
                    printedBook.setStatus("AVAILABLE");
                    this.printedBookService.addOrUpdatePrintedBook(printedBook);

                }
            }



            return ResponseEntity.ok("Thêm thành công");
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm sách: " + ex.getMessage());
        }
    }


    @GetMapping("/books")
    public Page<Map<String, Object>> getBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy
    ) {
        return this.bookSer.getBooks(page, size, sortBy)
                .map(b -> {
                    Map<String, Object> bookMap = new HashMap<>();
                    bookMap.put("id", b.getId());
                    bookMap.put("title", b.getTitle());
                    bookMap.put("description", b.getDescription());
                    bookMap.put("publisher", b.getPublisher());
                    bookMap.put("publishedDate", b.getPublishedDate());
                    bookMap.put("price", b.getPrice());
                    bookMap.put("author", b.getAuthor());
                    bookMap.put("image", b.getImage());
                    bookMap.put("isbn10", b.getIsbn10());
                    bookMap.put("isbn13", b.getIsbn13());
                    bookMap.put("isPrinted", b.isPrinted());
                    bookMap.put("isElectronic", b.isElectronic());
                    bookMap.put("createdDate", b.getCreatedDate());
                    bookMap.put("updatedDate", b.getUpdatedDate());
                    bookMap.put("language", b.getLanguage());
                    return bookMap;
                });
    }
}

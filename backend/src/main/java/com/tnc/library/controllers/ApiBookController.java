package com.tnc.library.controllers;

import com.tnc.library.dto.BookBorrowCountDTO;
import com.tnc.library.dto.BookDTO;
import com.tnc.library.dto.CategoryBookDTO;
import com.tnc.library.enums.PrintedBookStatus;
import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.EBook;
import com.tnc.library.pojo.PrintedBook;
import com.tnc.library.pojo.User;
import com.tnc.library.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiBookController {
    @Autowired
    private BookService bookService;

    @Autowired
    private UserService userSer;

    @Autowired
    private EBookService eBookService;

    @Autowired
    private PrintedBookService printedBookService;

    @Autowired
    private CategoryBookService categoryBookService;

    @Autowired
    private PrintedBookBorrowSlipService printedBookBorrowSlipService;

    @PostMapping("/book/add")
    public ResponseEntity<?> addBook(
            @RequestPart("book") BookDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "categories", required = false) List<Integer> categories,
            @RequestPart(value = "ebookFile", required = false) MultipartFile ebookFile,
            Principal principal) {
        try {
            String username = principal.getName();
            User currentUser = userSer.getUserByUsername(username);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Không tìm thấy thông tin người dùng");
            }

            // Kiểm tra trùng lặp
            if (this.bookService.getBookByNameAuthorPublishedDate(
                    dto.getTitle(),
                    dto.getAuthor(),
                    Integer.parseInt(dto.getPublishedDate())) != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Sách đã tồn tại");
            }

            // Tạo Book
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

            // Lưu Book
            Book bookSaved = this.bookService.addOrUpdateBook(b);

            // Lưu categories (nếu có)
            boolean categoriesSaved = this.categoryBookService.addOrUpdateCategoryBook(bookSaved, categories);
            if (!categoriesSaved) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Lỗi khi lưu danh mục cho sách");
            }

            // Nếu là sách điện tử
            if (bookSaved.isElectronic()) {
                EBook eBook = new EBook();
                eBook.setBook(bookSaved);
                eBook.setFormat(dto.getFormat());
                eBook.setLicence(dto.getLicence());
                eBook.setFile(ebookFile);
                eBook.setTotalView(0);
                this.eBookService.addOrUpdateEBook(eBook);
            }

            // Nếu là sách in
            if (bookSaved.isPrinted()) {
                PrintedBook printedBook = new PrintedBook();
                printedBook.setBook(bookSaved);
                printedBook.setShelfLocation(dto.getShelfLocation());
                printedBook.setTotalCopy(Integer.parseInt(dto.getTotalCopy()));
                printedBook.setBorrowCount(0);
                printedBook.setStatus(PrintedBookStatus.AVAILABLE);
                this.printedBookService.addOrUpdatePrintedBook(printedBook);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thêm thành công");

            return ResponseEntity.ok(response);

        } catch (Exception ex) {
            ex.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi thêm sách: " + ex.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @GetMapping("/books")
    public Page<Map<String, Object>> getBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy
    ) {
        return this.bookService.getBooks(page, size, sortBy)
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

    @GetMapping("/book/find-by-isbn")
    public ResponseEntity<?> searchBookByISBN(@RequestParam String isbn) {
        Book book = bookService.findByIsbn(isbn);

        if (book == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> bookMap = new HashMap<>();
        bookMap.put("id", book.getId());
        bookMap.put("title", book.getTitle());
        bookMap.put("author", book.getAuthor());
        bookMap.put("publishedDate", book.getPublishedDate());
        bookMap.put("image", book.getImage());

        return ResponseEntity.ok(bookMap);
    }

    @GetMapping("/book/find-by-title")
    public ResponseEntity<?> searchBookByTitle(@RequestParam String title) {
        List<Book> books = this.bookService.getBookByTitle(title);

        if (books.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Chỉ lấy các trường cần thiết
        List<Map<String, Object>> result = new ArrayList<>();
        for (Book b : books) {
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
            result.add(bookMap);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/book/count")
    public ResponseEntity<?> getBookCount() {
        Integer countAllBook = bookService.countAllBook();
        return ResponseEntity.ok(countAllBook);
    }

    @GetMapping("/book/category/{categoryId}")
    public ResponseEntity<List<Book>> getBooksByCategory(@PathVariable Integer categoryId) {
        List<Book> books = categoryBookService.getBooksByCategory(categoryId);
        if (books.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(books);
    }

    @GetMapping("/book/category/count")
    public ResponseEntity<List<CategoryBookDTO>> countBooksForAllCategories() {
        return ResponseEntity.ok(categoryBookService.countBooksForAllCategories());
    }

    @GetMapping("/book/borrow-slip/count")
    public ResponseEntity<List<BookBorrowCountDTO>> countBooksForBorrowSlip() {
        return ResponseEntity.ok(this.printedBookBorrowSlipService.countBorrowedTimesForBooks());
    }
}

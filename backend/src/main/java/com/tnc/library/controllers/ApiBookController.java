package com.tnc.library.controllers;

import com.tnc.library.dto.BookBorrowCountDTO;
import com.tnc.library.dto.BookDTO;
import com.tnc.library.dto.CategoryBookDTO;
import com.tnc.library.dto.PrintedBookDTO;
import com.tnc.library.enums.BorrowStatus;
import com.tnc.library.enums.PrintedBookStatus;
import com.tnc.library.pojo.*;
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
import java.util.stream.Collectors;

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

    @Autowired
    private BorrowSlipService borrowSlipService;

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

            if (this.bookService.getBookByNameAuthorPublishedDate(
                    dto.getTitle(),
                    dto.getAuthor(),
                    Integer.parseInt(dto.getPublishedDate())) != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Sách đã tồn tại");
            }

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
            b.setLibrarian(currentUser);

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

    @PatchMapping("/book/update/{id}")
    public ResponseEntity<?> updateBook(
            @PathVariable Integer id,
            @RequestPart("book") BookDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "categories", required = false) List<Integer> categories,
            @RequestPart(value = "ebookFile", required = false) MultipartFile ebookFile,
            Principal principal) {
        try {
            String username = principal.getName();
            User currentUser = userSer.getUserByUsername(username);

            Book b = bookService.getBookByBookId(id);

            if (dto.getTitle() != null) b.setTitle(dto.getTitle());
            if (dto.getAuthor() != null) b.setAuthor(dto.getAuthor());
            if (dto.getPublisher() != null) b.setPublisher(dto.getPublisher());
            if (dto.getDescription() != null) b.setDescription(dto.getDescription());
            if (dto.getLanguage() != null) b.setLanguage(dto.getLanguage());

            if (dto.getPublishedDate() != null && !dto.getPublishedDate().isEmpty()) {
                b.setPublishedDate(Integer.parseInt(dto.getPublishedDate()));
            }
            if (dto.getIsbn10() != null) b.setIsbn10(dto.getIsbn10());
            if (dto.getIsbn13() != null) b.setIsbn13(dto.getIsbn13());
            if (dto.getPrice() != null && !dto.getPrice().isEmpty()) {
                b.setPrice(new BigDecimal(dto.getPrice()));
            }

            if (dto.getIsPrinted() != null) {
                b.setPrinted(Boolean.parseBoolean(dto.getIsPrinted()));
            }
            if (dto.getIsElectronic() != null) {
                b.setElectronic(Boolean.parseBoolean(dto.getIsElectronic()));
            }

            Book bookSaved = this.bookService.addOrUpdateBook(b);

            if (categories != null) {
                boolean categoriesSaved = this.categoryBookService.addOrUpdateCategoryBook(bookSaved, categories);
                if (!categoriesSaved) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Lỗi khi lưu danh mục cho sách");
                }
            }

            if (bookSaved.isElectronic()) {
                EBook eBook = b.getEBook() != null ? b.getEBook() : new EBook();
                eBook.setBook(bookSaved);
                if (dto.getFormat() != null) eBook.setFormat(dto.getFormat());
                if (dto.getLicence() != null) eBook.setLicence(dto.getLicence());
                if (ebookFile != null) eBook.setFile(ebookFile);
                this.eBookService.addOrUpdateEBook(eBook);
            }

            if (bookSaved.isPrinted()) {
                PrintedBook printedBook = b.getPrintedBook() != null ? b.getPrintedBook() : new PrintedBook();
                printedBook.setBook(bookSaved);
                if (dto.getShelfLocation() != null) printedBook.setShelfLocation(dto.getShelfLocation());
                if (dto.getTotalCopy() != null && !dto.getTotalCopy().isEmpty()) {
                    printedBook.setTotalCopy(Integer.parseInt(dto.getTotalCopy()));
                }
                this.printedBookService.addOrUpdatePrintedBook(printedBook);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật thành công");

            return ResponseEntity.ok(response);

        } catch (Exception ex) {
            ex.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật sách: " + ex.getMessage());

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
                    bookMap.put("publishedDate", b.getPublishedDate());
                    bookMap.put("author", b.getAuthor());
                    bookMap.put("image", b.getImage());
                    bookMap.put("isbn10", b.getIsbn10());
                    bookMap.put("isbn13", b.getIsbn13());
                    bookMap.put("isPrinted", b.isPrinted());
                    bookMap.put("isElectronic", b.isElectronic());
                    bookMap.put("language", b.getLanguage());
                    return bookMap;
                });
    }

    @GetMapping("/book/{id}")
    public ResponseEntity<?> getBookDetail(@PathVariable Integer id) {
        try {
            Book book = this.bookService.getBookByBookId(id);

            if (book == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> response = new HashMap<>();
                response.put("id", book.getId());
                response.put("title", book.getTitle());
                response.put("author", book.getAuthor());
                response.put("description", book.getDescription());
                response.put("publishedDate", book.getPublishedDate());
                response.put("publisher", book.getPublisher());
                response.put("isbn10", book.getIsbn10());
                response.put("isbn13", book.getIsbn13());
                response.put("price", book.getPrice());
                response.put("image", book.getImage());
                response.put("updatedDate", book.getUpdatedDate());
                response.put("createdDate", book.getCreatedDate());
                response.put("language",book.getLanguage());
                response.put("isPrinted", book.isPrinted());
                response.put("isElectronic", book.isElectronic());
                if(book.getPrintedBook()!=null){
                    response.put("shelfLocation", book.getPrintedBook().getShelfLocation());
                    response.put("totalCopy", book.getPrintedBook().getTotalCopy());
                    response.put("borrowCount", book.getPrintedBook().getBorrowCount());
                }
                if(book.getEBook()!=null){
                    response.put("format", book.getEBook().getFormat());
                    response.put("licence", book.getEBook().getLicence());
                    response.put("totalView", book.getEBook().getTotalView());
                    response.put("filePDF", book.getEBook().getFileUrl());
                }

            List<Category> categories = categoryBookService.getCategoriesByBook(book);

            response.put("categories", categories);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    @GetMapping("/book/find-by-isbn")
    public ResponseEntity<?> searchBookByISBN(@RequestParam String isbn) {
        List<Book> books = bookService.findByIsbn(isbn);

        if (books.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Map<String, Object>> bookList = new ArrayList<>();
        for (Book book : books) {
            Map<String, Object> bookMap = new HashMap<>();
            bookMap.put("id", book.getId());
            bookMap.put("title", book.getTitle());
            bookMap.put("author", book.getAuthor());
            bookMap.put("publishedDate", book.getPublishedDate());
            bookMap.put("image", book.getImage());
            bookList.add(bookMap);
        }

        return ResponseEntity.ok(bookList);
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
            bookMap.put("publishedDate", b.getPublishedDate());
            bookMap.put("author", b.getAuthor());
            bookMap.put("image", b.getImage());
            bookMap.put("isbn10", b.getIsbn10());
            bookMap.put("isbn13", b.getIsbn13());
            bookMap.put("isPrinted", b.isPrinted());
            bookMap.put("isElectronic", b.isElectronic());
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

    @DeleteMapping("/book/delete/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Integer id, Principal principal) {
        try {
            String username = principal.getName();
            User currentUser = userSer.getUserByUsername(username);

            if (currentUser == null || !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Người dùng không hợp lệ hoặc không có quyền ADMIN");
            }

            Book book = this.bookService.getBookByBookId(id);
            if (book == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy sách");
            }

            List<BorrowSlip> borrowSlips = this.borrowSlipService
                    .getBorrowingSlipsByBookId(id, BorrowStatus.BORROWING);

            if (!borrowSlips.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Sách đang được mượn, không thể xóa");
            }

            this.bookService.deleteBook(book);
            return ResponseEntity.ok("Xóa thành công");

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}

package com.tnc.library.services.impl;

import com.tnc.library.dto.CategoryBookDTO;
import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.Category;
import com.tnc.library.pojo.CategoryBook;
import com.tnc.library.respositories.BookRepository;
import com.tnc.library.respositories.CategoryBookRepository;
import com.tnc.library.respositories.CategoryRepository;
import com.tnc.library.services.CategoryBookService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CategoryBookServiceImpl implements CategoryBookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryBookRepository categoryBookRepository;


    @Override
    @Transactional
    public boolean addOrUpdateCategoryBook(Book book, List<Integer> categories) {
        try {
            if (book == null) {
                return false;
            }

            if (categories == null || categories.isEmpty()) {
                // Xóa hết liên kết nếu danh sách rỗng
                categoryBookRepository.deleteByBookId(book);
                return true;
            }

            List<CategoryBook> existingCategoryBooks = categoryBookRepository.findByBookId(book);

            Set<Integer> existingCategoryIds = existingCategoryBooks.stream()
                    .map(cb -> cb.getCategoryId().getId())
                    .collect(Collectors.toSet());

            Set<Integer> newCategoryIds = new HashSet<>(categories);

            // Xóa các category cũ không còn trong danh sách mới
            for (CategoryBook cb : existingCategoryBooks) {
                if (!newCategoryIds.contains(cb.getCategoryId().getId())) {
                    categoryBookRepository.delete(cb);
                }
            }

            // Thêm các category mới chưa có
            for (Integer categoryId : newCategoryIds) {
                if (!existingCategoryIds.contains(categoryId)) {
                    categoryRepository.findById(categoryId).ifPresent(category -> {
                        CategoryBook categoryBook = new CategoryBook();
                        categoryBook.setBookId(book);
                        categoryBook.setCategoryId(category);
                        categoryBookRepository.save(categoryBook);
                    });
                }
            }

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public List<Book> getBooksByCategory(Integer categoryId) {
        return categoryBookRepository.findBooksByCategoryId(categoryId);
    }

    @Override
    public List<CategoryBookDTO> countBooksForAllCategories() {
        List<Object[]> results = categoryBookRepository.countBooksGroupByCategory();
        List<CategoryBookDTO> categoryBookDTOS = new ArrayList<>();
        for (Object[] row : results) {
            categoryBookDTOS.add(new CategoryBookDTO((String) row[0], (Long) row[1]));
        }
        return categoryBookDTOS;
    }


}

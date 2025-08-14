package com.tnc.library.services.impl;

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

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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
    public CategoryBook addOrUpdateCategoryBook(Book book, List<Integer> categories) {
        if (book == null || categories == null || categories.isEmpty()) {
            // Delete existing associations if categories is empty
            categoryBookRepository.deleteByBookId(book);
            return null;
        }

        List<CategoryBook> existingCategoryBooks = categoryBookRepository.findByBookId(book);

        Set<Integer> existingCategoryIds = existingCategoryBooks.stream()
                .map(cb -> cb.getCategoryId().getId())
                .collect(Collectors.toSet());

        // Create a set of new category IDs
        Set<Integer> newCategoryIds = new HashSet<>(categories);

        // Delete CategoryBook entries that are no longer in the new categories list
        for (CategoryBook cb : existingCategoryBooks) {
            if (!newCategoryIds.contains(cb.getCategoryId().getId())) {
                categoryBookRepository.delete(cb);
            }
        }

        // Add new CategoryBook entries for categories not already associated
        CategoryBook lastAdded = null;
        for (Integer categoryId : newCategoryIds) {
            if (!existingCategoryIds.contains(categoryId)) {
                // Fetch the Category entity
                Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
                if (categoryOpt.isEmpty()) {
                    continue;
                }
                Category category = categoryOpt.get();

                // Create and save new CategoryBook entity
                CategoryBook categoryBook = new CategoryBook();
                categoryBook.setBookId(book);
                categoryBook.setCategoryId(category);
                lastAdded = categoryBookRepository.save(categoryBook);
            }
        }

        return lastAdded != null ? lastAdded : existingCategoryBooks.stream().findFirst().orElse(null);
    }
}

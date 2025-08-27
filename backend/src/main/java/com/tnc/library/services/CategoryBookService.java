package com.tnc.library.services;

import com.tnc.library.dto.CategoryBookDTO;
import com.tnc.library.pojo.Book;

import java.util.List;
import java.util.Map;

public interface CategoryBookService {
    boolean addOrUpdateCategoryBook(Book book, List<Integer> categories);
    List<Book> getBooksByCategory(Integer categoryId);
    List<CategoryBookDTO> countBooksForAllCategories();
}
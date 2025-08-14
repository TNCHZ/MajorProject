package com.tnc.library.services;

import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.Category;
import com.tnc.library.pojo.CategoryBook;

import java.util.List;

public interface CategoryBookService {
    CategoryBook addOrUpdateCategoryBook(Book book, List<Integer> categories);
}
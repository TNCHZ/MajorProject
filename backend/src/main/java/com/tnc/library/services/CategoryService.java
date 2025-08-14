package com.tnc.library.services;

import com.tnc.library.pojo.Category;

import java.util.List;

public interface CategoryService {
    Category addOrUpdateCategory(Category c);
    List<Category> getCategory();
}

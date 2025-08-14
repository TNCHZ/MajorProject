package com.tnc.library.services.impl;

import com.tnc.library.pojo.Category;
import com.tnc.library.respositories.CategoryRepository;
import com.tnc.library.services.CategoryService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    @Transactional
    public Category addOrUpdateCategory(Category c) {
        return this.categoryRepository.save(c);
    }

    @Override
    public List<Category> getCategory() {
        return categoryRepository.findAll();
    }
}

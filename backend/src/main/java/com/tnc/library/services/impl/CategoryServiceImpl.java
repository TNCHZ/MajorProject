package com.tnc.library.services.impl;

import com.tnc.library.pojo.Category;
import com.tnc.library.respositories.CategoryRepository;
import com.tnc.library.services.CategoryService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    @Override
    public void deleteCategory(Category category) {
        this.categoryRepository.delete(category);
    }

    @Override
    public Category getCategoryById(Integer id) {
        Optional<Category> category = this.categoryRepository.findById(id);
        return category.orElse(null);
    }
}

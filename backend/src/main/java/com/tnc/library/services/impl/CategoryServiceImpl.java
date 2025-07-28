package com.tnc.library.services.impl;

import com.tnc.library.pojo.Category;
import com.tnc.library.respositories.CategoryRepository;
import com.tnc.library.services.CategoryService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryRepository categoryRepo;

    @Override
    @Transactional
    public Category addOrUpdateCategory(Category c) {
        return this.categoryRepo.save(c);
    }
}

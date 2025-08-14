package com.tnc.library.controllers;

import com.tnc.library.pojo.Category;
import com.tnc.library.services.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiCategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories()
    {
        List<Category> categories = categoryService.getCategory();
        return ResponseEntity.ok(categories);
    }

}

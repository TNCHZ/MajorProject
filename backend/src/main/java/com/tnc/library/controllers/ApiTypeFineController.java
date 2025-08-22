package com.tnc.library.controllers;


import com.tnc.library.pojo.TypeFine;
import com.tnc.library.services.TypeFineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiTypeFineController {
    @Autowired
    private TypeFineService typeFineService;

    @GetMapping("/type-fines")
    public ResponseEntity<List<TypeFine>> getTypeFines()
    {
        List<TypeFine> typeFine = typeFineService.getTypeFine();
        return ResponseEntity.ok(typeFine);
    }
}

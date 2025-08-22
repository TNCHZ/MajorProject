package com.tnc.library.services;

import com.tnc.library.pojo.TypeFine;

import java.util.List;

public interface TypeFineService {
    List<TypeFine> getTypeFine();
    TypeFine findById(Integer id);
    TypeFine findByCode(String code);
}

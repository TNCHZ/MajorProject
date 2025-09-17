package com.tnc.library.services.impl;

import com.tnc.library.pojo.TypeFine;
import com.tnc.library.respositories.TypeFineRepository;
import com.tnc.library.services.TypeFineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class TypeFineServiceImpl implements TypeFineService {

    @Autowired
    private TypeFineRepository typeFineRepository;

    @Override
    public List<TypeFine> getTypeFine() {
        return this.typeFineRepository.findAll();
    }

    @Override
    public TypeFine findById(Integer id) {
        Optional<TypeFine> typeFine = this.typeFineRepository.findById(id);
        return typeFine.orElse(null);
    }

    @Override
    public TypeFine findByCode(String code) {
        Optional<TypeFine> typeFine = this.typeFineRepository.findByCode(code);
        return typeFine.orElse(null);
    }

    @Override
    public TypeFine getTypeFineById(Integer id) {
        Optional<TypeFine> typeFine = this.typeFineRepository.findById(id);
        return typeFine.orElse(null);
    }

    @Override
    public void deleteTypeFine(TypeFine typeFine) {
        this.typeFineRepository.delete(typeFine);
    }

}

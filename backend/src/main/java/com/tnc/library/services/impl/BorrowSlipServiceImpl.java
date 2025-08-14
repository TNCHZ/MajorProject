package com.tnc.library.services.impl;

import com.tnc.library.pojo.BorrowSlip;
import com.tnc.library.pojo.Reader;
import com.tnc.library.pojo.User;
import com.tnc.library.respositories.BorrowSlipRepository;
import com.tnc.library.services.BorrowSlipService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class BorrowSlipServiceImpl implements BorrowSlipService {
    @Autowired
    private BorrowSlipRepository borrowSlipRepository;


    @Override
    @Transactional
    public BorrowSlip addOrUpdateBorrowSlip(BorrowSlip b) {
        return borrowSlipRepository.save(b);
    }

    @Override
    public List<BorrowSlip> getBorrowSlipByUserId(Reader readerId) {
        return this.borrowSlipRepository.findByReaderId(readerId);
    }

    @Override
    public BorrowSlip getBorrowSlipById(int id) {
        Optional<BorrowSlip> borrowSlip = this.borrowSlipRepository.findById(id);
        return borrowSlip.orElse(null);
    }

    @Override
    @Transactional
    public void deleteBorrowSlip(BorrowSlip b) {
        this.borrowSlipRepository.delete(b);
    }

    @Override
    public Page<BorrowSlip> getBorrowSlips(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return this.borrowSlipRepository.findAll(pageable);
    }
}

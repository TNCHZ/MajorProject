package com.tnc.library.services.impl;

import com.tnc.library.pojo.DirectPayment;
import com.tnc.library.respositories.DirectPaymentRepository;
import com.tnc.library.services.DirectPaymentService;
import org.springframework.beans.factory.annotation.Autowired;

public class DirectPaymentServiceImpl implements DirectPaymentService {

    @Autowired
    private DirectPaymentRepository directPaymentRepository;

    @Override
    public DirectPayment addOrUpdateDirectPayment(DirectPayment directPayment) {
        return this.directPaymentRepository.save(directPayment);
    }
}

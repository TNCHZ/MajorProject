package com.tnc.library.services.impl;

import com.tnc.library.pojo.Payment;
import com.tnc.library.respositories.PaymentRepository;
import com.tnc.library.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;

public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    public Payment addOrUpdatePayment(Payment payment) {
        return this.paymentRepository.save(payment);
    }
}

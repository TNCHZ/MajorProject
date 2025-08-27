package com.tnc.library.services;

import com.tnc.library.pojo.Payment;
import com.tnc.library.pojo.Reader;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.Map;

public interface PaymentService {
    Payment addOrUpdatePayment(Payment payment);

    Map<String, BigDecimal> getRevenueByType(int year, Integer month);

    public Page<Payment> getPayments(int page, int size, String sortBy);

}

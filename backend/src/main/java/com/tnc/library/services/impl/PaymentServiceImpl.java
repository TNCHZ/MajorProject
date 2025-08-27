package com.tnc.library.services.impl;

import com.tnc.library.pojo.Payment;
import com.tnc.library.respositories.PaymentRepository;
import com.tnc.library.services.PaymentService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Transactional
    @Override
    public Payment addOrUpdatePayment(Payment payment) {
        return this.paymentRepository.save(payment);
    }

    @Override
    public Map<String, BigDecimal> getRevenueByType(int year, Integer month) {
        List<Object[]> results = paymentRepository.getRevenueByType(year, month);
        Map<String, BigDecimal> revenueMap = new HashMap<>();

        for (Object[] row : results) {
            String type = (String) row[0];
            BigDecimal total = (BigDecimal) row[1];
            revenueMap.put(type, total);
        }

        revenueMap.putIfAbsent("MEMBERSHIP", BigDecimal.ZERO);
        revenueMap.putIfAbsent("FINE", BigDecimal.ZERO);

        return revenueMap;
    }

    @Override
    public Page<Payment> getPayments(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return this.paymentRepository.findAll(pageable);
    }
}

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
import java.util.LinkedHashMap;
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
    public Map<String, Map<String, BigDecimal>> getRevenueByType(int year, Integer month) {
        Map<String, Map<String, BigDecimal>> result = new LinkedHashMap<>();

        List<Object[]> rows = (month == null)
                ? paymentRepository.getRevenueByMonth(year)
                : paymentRepository.getRevenueByDay(year, month);

        for (Object[] row : rows) {
            Integer timeUnit = (Integer) row[0]; // month hoặc day
            String type = (String) row[1];
            BigDecimal total = (BigDecimal) row[2];

            String key = String.format("%02d", timeUnit); // ví dụ: "03" hoặc "15"

            // Nếu chưa có tháng/ngày này thì tạo mới map con
            result.putIfAbsent(key, new LinkedHashMap<>());

            // Gán giá trị vào map con
            result.get(key).put(type, total);
        }

        // Đảm bảo có đủ 2 loại doanh thu cho mỗi tháng/ngày (nếu bạn muốn fix 0)
        result.forEach((k, v) -> {
            v.putIfAbsent("MEMBERSHIP", BigDecimal.ZERO);
            v.putIfAbsent("FINE", BigDecimal.ZERO);
        });

        return result;
    }




    @Override
    public Page<Payment> getPayments(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return this.paymentRepository.findAll(pageable);
    }
}

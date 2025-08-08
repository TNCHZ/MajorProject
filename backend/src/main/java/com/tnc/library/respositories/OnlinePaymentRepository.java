package com.tnc.library.respositories;

import com.tnc.library.pojo.OnlinePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OnlinePaymentRepository extends JpaRepository<OnlinePayment, Integer> {
}

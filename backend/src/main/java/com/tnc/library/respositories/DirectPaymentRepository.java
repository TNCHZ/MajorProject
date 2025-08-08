package com.tnc.library.respositories;

import com.tnc.library.pojo.DirectPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface DirectPaymentRepository extends JpaRepository<DirectPayment, Integer> {
}

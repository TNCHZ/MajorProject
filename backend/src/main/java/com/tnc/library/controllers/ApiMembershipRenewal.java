package com.tnc.library.controllers;

import com.tnc.library.services.DirectPaymentService;
import com.tnc.library.services.MembershipRenewalService;
import com.tnc.library.services.PaymentService;
import com.tnc.library.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiMembershipRenewal {
    @Autowired
    private MembershipRenewalService membershipRenewalService;

    @Autowired
    private UserService userService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private DirectPaymentService directPaymentService;


}

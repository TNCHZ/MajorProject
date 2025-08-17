package com.tnc.library.services.impl;

import com.tnc.library.pojo.MembershipRenewal;
import com.tnc.library.respositories.MembershipRenewalRepository;
import com.tnc.library.services.MembershipRenewalService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

public class MembershipRenewalServiceImpl implements MembershipRenewalService {
    @Autowired
    private MembershipRenewalRepository membershipRenewalRepository;


    @Override
    public MembershipRenewal addOrUpdateMembership(MembershipRenewal m) {
        return this.membershipRenewalRepository.save(m);
    }

}

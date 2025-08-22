package com.tnc.library.services.impl;

import com.tnc.library.pojo.MembershipRenewal;
import com.tnc.library.respositories.MembershipRenewalRepository;
import com.tnc.library.services.MembershipRenewalService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class MembershipRenewalServiceImpl implements MembershipRenewalService {
    @Autowired
    private MembershipRenewalRepository membershipRenewalRepository;

    @Transactional
    @Override
    public MembershipRenewal addOrUpdateMembership(MembershipRenewal m) {
        return this.membershipRenewalRepository.save(m);
    }

}

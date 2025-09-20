package com.tnc.library.services;

import com.tnc.library.pojo.MembershipRenewal;

import java.util.List;

public interface MembershipRenewalService{
    MembershipRenewal addOrUpdateMembership(MembershipRenewal m);
    boolean canReaderReadEbook(Integer id);
    List<MembershipRenewal> getMembershipsExpired();
}

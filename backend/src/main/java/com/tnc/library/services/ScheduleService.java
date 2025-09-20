package com.tnc.library.services;


import com.tnc.library.pojo.MembershipRenewal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleService {
    @Autowired
    private ReaderService readerService;

    @Autowired
    private MembershipRenewalService membershipRenewalService;

    @Autowired
    private MailService mailService;

    @Scheduled(cron = "0 0 0 * * ?")
    public void checkMembershipRenewals() {
        List<MembershipRenewal> membershipRenewals = this.membershipRenewalService.getMembershipsExpired();
        for (MembershipRenewal membershipRenewal : membershipRenewals){
            this.mailService.sendMail(membershipRenewal.getReader().getEmail(), "Hết hạn thành viên", "Gói gia hạn của bạn đã hết hạn vào ngày " + membershipRenewal.getExpireDate());
            membershipRenewal.setIsNotify(Boolean.TRUE);
            this.membershipRenewalService.addOrUpdateMembership(membershipRenewal);
        }
    }
}

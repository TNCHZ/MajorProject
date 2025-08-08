package com.tnc.library.respositories;

import com.tnc.library.pojo.MembershipRenewal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MembershipRenewalRepository extends JpaRepository<MembershipRenewal, Integer> {
}

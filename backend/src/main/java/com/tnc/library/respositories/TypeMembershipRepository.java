package com.tnc.library.respositories;

import com.tnc.library.pojo.TypeMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TypeMembershipRepository extends JpaRepository<TypeMembership, Integer> {
}

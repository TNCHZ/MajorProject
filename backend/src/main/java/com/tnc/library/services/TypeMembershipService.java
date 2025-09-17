package com.tnc.library.services;

import com.tnc.library.pojo.TypeMembership;

import java.util.List;

public interface TypeMembershipService {
    List<TypeMembership> getTypeMembership();
    TypeMembership findById(Integer id);
    TypeMembership addOrUpdateTypeMembership(TypeMembership typeMembership);
    void deleteMembership(TypeMembership typeMembership);
}

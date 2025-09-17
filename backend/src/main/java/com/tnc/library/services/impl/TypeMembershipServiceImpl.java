package com.tnc.library.services.impl;

import com.tnc.library.pojo.TypeMembership;
import com.tnc.library.respositories.TypeMembershipRepository;
import com.tnc.library.services.TypeMembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TypeMembershipServiceImpl implements TypeMembershipService {

    @Autowired
    private TypeMembershipRepository typeMembershipRepository;

    @Override
    public List<TypeMembership> getTypeMembership() {
        return this.typeMembershipRepository.findAll();
    }

    @Override
    public TypeMembership findById(Integer id) {
        Optional<TypeMembership> typeMembership = this.typeMembershipRepository.findById(id);
        return typeMembership.orElse(null);
    }

    @Override
    public TypeMembership addOrUpdateTypeMembership(TypeMembership typeMembership) {
        return this.typeMembershipRepository.save(typeMembership);
    }

    @Override
    public void deleteMembership(TypeMembership typeMembership) {
        this.typeMembershipRepository.delete(typeMembership);
    }
}

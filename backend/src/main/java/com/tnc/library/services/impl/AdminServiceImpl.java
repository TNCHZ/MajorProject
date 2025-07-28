package com.tnc.library.services.impl;


import com.tnc.library.pojo.Admin;
import com.tnc.library.respositories.AdminRepository;
import com.tnc.library.services.AdminService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImpl implements AdminService {
    @Autowired
    private AdminRepository adminRepo;

    @Override
    @Transactional
    public Admin addOrUpdateAdmin(Admin a) {
        return this.adminRepo.save(a);
    }
}

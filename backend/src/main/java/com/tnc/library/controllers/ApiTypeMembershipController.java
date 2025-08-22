package com.tnc.library.controllers;

import com.tnc.library.pojo.TypeMembership;
import com.tnc.library.services.TypeMembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiTypeMembershipController {
    @Autowired
    private TypeMembershipService typeMembershipService;

    @GetMapping("/type-memberships")
    public ResponseEntity<List<TypeMembership>> getMembershipTypes()
    {
        List<TypeMembership> typeMemberships = typeMembershipService.getTypeMembership();
        return ResponseEntity.ok(typeMemberships);
    }
}

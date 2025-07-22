package com.tnc.library.services;

import com.tnc.library.pojo.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserService extends UserDetailsService{
    User addOrUpdateUser(User u);
    User getUserByUsername(String username);
    User getUserByUserId(int id);
    List<User> getAllUsers();
    boolean authenticate(String username, String password);
    void deleteUser(User u);
}

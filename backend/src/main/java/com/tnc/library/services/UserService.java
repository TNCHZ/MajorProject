package com.tnc.library.services;

import com.tnc.library.pojo.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService extends UserDetailsService{
    User addOrUpdateUser(User u);
    User getUserByUsername(String username);
    User getUserByUserId(int id);
    List<User> getAllUsers();
    boolean authenticate(String username, String password);
    void deleteUser(User u);
}

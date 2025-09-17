package com.tnc.library.services;

import com.tnc.library.pojo.Reader;
import com.tnc.library.pojo.User;
import org.springframework.data.domain.Page;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService extends UserDetailsService{
    User addOrUpdateUser(User u);
    User getUserByUsername(String username);
    User getUserByEmail(String email);
    User getUserByUserId(int id);
    boolean authenticate(String username, String password);
    void deleteUser(User u);

    public Page<User> getUsers(int page, int size, String sortBy);
}

package com.tnc.library.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tnc.library.pojo.User;
import com.tnc.library.respositories.UserRepository;
import com.tnc.library.services.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service("userDetailsService")
public class UserServiceImpl implements UserService {
    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    @Override
    public User addOrUpdateUser(User u) {

        if(u.getFile() != null && !u.getFile().isEmpty())
        {
            try{
                Map res = cloudinary.uploader().upload(u.getFile().getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                u.setAvatar(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(UserServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

        if(u.getPassword() != null && !u.getPassword().isEmpty())
        {
            u.setPassword(this.passwordEncoder.encode(u.getPassword()));
        }else if(u.getUsername() != null)
        {
            Optional<User> userSaved = this.userRepository.findByUsername(u.getUsername());
            userSaved.ifPresent(user -> u.setPassword(user.getPassword()));
        }
        return this.userRepository.save(u);
    }

    @Override
    public User getUserByUsername(String username) {
        Optional<User> user = this.userRepository.findByUsername(username);
        return user.orElse(null);
    }

    @Override
    public User getUserByEmail(String email) {
        Optional<User> user = this.userRepository.findByEmail(email);
        return user.orElse(null);
    }

    @Override
    public User getUserByUserId(int id) {
        Optional<User> user = this.userRepository.findById(id);
        return user.orElse(null);
    }

    @Override
    public User getUserByPhone(String phone) {
        Optional<User> user = this.userRepository.findByPhone(phone);
        return user.orElse(null);
    }

    @Override
    public boolean authenticate(String username, String password) {
        Optional<User> u = this.userRepository.findByUsername(username);
        if (u.isPresent()) {
            User user = u.get();
            return passwordEncoder.matches(password, user.getPassword());
        }
        return false;
    }

    @Override
    @Transactional
    public void deleteUser(User u) {
        this.userRepository.delete(u);
    }

    @Override
    public Page<User> getUsers(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return this.userRepository.findAll(pageable);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = this.getUserByUsername(username);
        if (u == null) {
            throw new UsernameNotFoundException("Invalid username!");

        }
        Set<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + u.getRole()));

        return new org.springframework.security.core.userdetails.User(
                u.getUsername(), u.getPassword(), authorities);
    }



}

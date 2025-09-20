package com.tnc.library.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.io.Serializable;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "user")
public class User implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "first_name")
    private String firstName;

    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "last_name")
    private String lastName;

    @NotNull
    @Size(min = 1, max = 20)
    @Column(name = "phone")
    private String phone;

    @NotNull
    @Size(min = 1, max = 100)
    @Column(name = "email")
    private String email;

    @NotNull
    @Column(name = "gender")
    private boolean gender;

    @Size(max = 255)
    @Column(name = "avatar")
    private String avatar;

    @NotNull
    @Size(min = 1, max = 20)
    @Column(name = "role")
    private String role; // "ADMIN", "LIBRARIAN", "READER"

    @NotNull
    @Column(name = "active")
    private boolean active;

    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "username")
    private String username;

    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "password")
    private String password;

    @Transient
    @JsonIgnore
    private MultipartFile file;

    // ================= QUAN HỆ NGƯỢC =================

    @JsonIgnore
    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChatMessages> sentMessages;

    @JsonIgnore
    @OneToMany(mappedBy = "librarian", cascade = CascadeType.ALL)
    private Set<Book> books;

    @OneToOne(cascade = CascadeType.ALL, mappedBy = "user")
    private Reader reader;

    @OneToOne(cascade = CascadeType.ALL, mappedBy = "user")
    private Librarian librarian;

    @OneToOne(cascade = CascadeType.ALL, mappedBy = "user")
    private Admin admin;


    @JsonIgnore
    @OneToMany(mappedBy = "reader", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<BorrowSlip> borrowSlipsAsReader;

    @JsonIgnore
    @OneToMany(mappedBy = "librarian", cascade = CascadeType.ALL)
    private Set<BorrowSlip> borrowSlipsAsLibrarian;

    @JsonIgnore
    @OneToMany(mappedBy = "reader", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Payment> paymentsAsReader;

    @JsonIgnore
    @OneToMany(mappedBy = "librarian", cascade = CascadeType.ALL)
    private Set<Payment> paymentsAsLibrarian;

    @JsonIgnore
    @OneToMany(mappedBy = "reader", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Fine> finesAsReader;

    @JsonIgnore
    @OneToMany(mappedBy = "librarian", cascade = CascadeType.ALL)
    private Set<Fine> finesAsLibrarian;

    @JsonIgnore
    @OneToMany(mappedBy = "reader", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MembershipRenewal> membershipRenewalsAsReader;

    @JsonIgnore
    @OneToMany(mappedBy = "reader", fetch = FetchType.LAZY)
    private Set<Interact> interacts;

    public String getFullName() {
        return this.firstName + " " + this.lastName;
    }

    // ================= equals & hashCode =================
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        User that = (User) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return 31;
    }
}

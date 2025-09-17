/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.tnc.library.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.util.Set;

/**
 *
 * @author ADMIN
 */
@Data
@Entity
@Table(name = "reader")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Reader implements Serializable {

    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    @EqualsAndHashCode.Include
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Column(name = "is_member")
    private boolean isMember;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "readerId")
    private Set<ReaderEBook> readerEBookSet;
    @JoinColumn(name = "id", referencedColumnName = "id", insertable = false, updatable = false)
    @OneToOne(optional = false)
    @JsonIgnore
    @MapsId
    private User user;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "readerId")
    private Set<MembershipRenewal> membershipRenewalSet;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "readerId")
    private Set<Interact> interactSet;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "readerId")
    private Set<BorrowSlip> borrowSlipSet;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "readerId")
    private Set<Fine> fineSet;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "readerId")
    private Set<Payment> paymentSet;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "readerId")
    private Set<ReaderEvent> readerEventSet;

}

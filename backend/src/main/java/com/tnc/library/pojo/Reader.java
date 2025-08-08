/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.tnc.library.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.util.Set;

/**
 *
 * @author ADMIN
 */
@Data
@Entity
@Table(name = "reader")
public class Reader implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
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

    public Reader() {
    }

    public Reader(Integer id) {
        this.id = id;
    }

    public Reader(Integer id, boolean isMember) {
        this.id = id;
        this.isMember = isMember;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Reader)) {
            return false;
        }
        Reader other = (Reader) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.tnc.library.pojo.Reader[ id=" + id + " ]";
    }
    
}

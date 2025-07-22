/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.tnc.library.pojo;

import jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;
import java.util.Set;

/**
 *
 * @author ADMIN
 */
@Data
@Entity
@Table(name = "reader")
@NamedQueries({
    @NamedQuery(name = "Reader.findAll", query = "SELECT r FROM Reader r"),
    @NamedQuery(name = "Reader.findById", query = "SELECT r FROM Reader r WHERE r.id = :id"),
    @NamedQuery(name = "Reader.findByMemberDate", query = "SELECT r FROM Reader r WHERE r.memberDate = :memberDate"),
    @NamedQuery(name = "Reader.findByMemberExpire", query = "SELECT r FROM Reader r WHERE r.memberExpire = :memberExpire"),
    @NamedQuery(name = "Reader.findByIsMember", query = "SELECT r FROM Reader r WHERE r.isMember = :isMember")})
public class Reader implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Column(name = "memberDate")
    @Temporal(TemporalType.TIMESTAMP)
    private Date memberDate;
    @Basic(optional = false)
    @NotNull
    @Column(name = "memberExpire")
    @Temporal(TemporalType.TIMESTAMP)
    private Date memberExpire;
    @Basic(optional = false)
    @NotNull
    @Column(name = "isMember")
    private boolean isMember;
    @JoinColumn(name = "id", referencedColumnName = "id", insertable = false, updatable = false)
    @OneToOne(optional = false)
    private User user;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "readerId")
    private Set<Interact> interactSet;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "readerId")
    private Set<ReaderEbook> readerEbookSet;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "readerId")
    private Set<Borrowslip> borrowslipSet;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "readerId")
    private Set<Payment> paymentSet;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "readerId")
    private Set<ReaderEvent> readerEventSet;

    public Reader() {
    }

    public Reader(Integer id) {
        this.id = id;
    }

    public Reader(Integer id, Date memberDate, Date memberExpire, boolean isMember) {
        this.id = id;
        this.memberDate = memberDate;
        this.memberExpire = memberExpire;
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

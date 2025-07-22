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
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Date;
import java.util.Set;

/**
 *
 * @author ADMIN
 */
@Data
@Entity
@Table(name = "borrowslip")
@NamedQueries({
    @NamedQuery(name = "Borrowslip.findAll", query = "SELECT b FROM Borrowslip b"),
    @NamedQuery(name = "Borrowslip.findById", query = "SELECT b FROM Borrowslip b WHERE b.id = :id"),
    @NamedQuery(name = "Borrowslip.findByBorrowDate", query = "SELECT b FROM Borrowslip b WHERE b.borrowDate = :borrowDate"),
    @NamedQuery(name = "Borrowslip.findByDueDate", query = "SELECT b FROM Borrowslip b WHERE b.dueDate = :dueDate"),
    @NamedQuery(name = "Borrowslip.findByReturnDate", query = "SELECT b FROM Borrowslip b WHERE b.returnDate = :returnDate"),
    @NamedQuery(name = "Borrowslip.findByStatus", query = "SELECT b FROM Borrowslip b WHERE b.status = :status")})
public class Borrowslip implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Column(name = "borrowDate")
    @Temporal(TemporalType.TIMESTAMP)
    private Date borrowDate;
    @Basic(optional = false)
    @NotNull
    @Column(name = "dueDate")
    @Temporal(TemporalType.TIMESTAMP)
    private Date dueDate;
    @Basic(optional = false)
    @NotNull
    @Column(name = "returnDate")
    @Temporal(TemporalType.TIMESTAMP)
    private Date returnDate;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 14)
    @Column(name = "status")
    private String status;
    @Lob
    @Size(max = 65535)
    @Column(name = "note")
    private String note;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "borrowSlipId")
    private Set<BorrowslipPrintedbook> borrowslipPrintedbookSet;
    @JoinColumn(name = "readerId", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Reader readerId;

    public Borrowslip() {
    }

    public Borrowslip(Integer id) {
        this.id = id;
    }

    public Borrowslip(Integer id, Date borrowDate, Date dueDate, Date returnDate, String status) {
        this.id = id;
        this.borrowDate = borrowDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
        this.status = status;
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
        if (!(object instanceof Borrowslip)) {
            return false;
        }
        Borrowslip other = (Borrowslip) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.tnc.library.pojo.Borrowslip[ id=" + id + " ]";
    }
    
}

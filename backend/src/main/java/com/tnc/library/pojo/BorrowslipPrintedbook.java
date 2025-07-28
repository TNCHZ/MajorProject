/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.tnc.library.pojo;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 *
 * @author ADMIN
 */
@Data
@Entity
@Table(name = "borrowslip_printedbook")
@NamedQueries({
    @NamedQuery(name = "BorrowslipPrintedbook.findAll", query = "SELECT b FROM BorrowslipPrintedbook b"),
    @NamedQuery(name = "BorrowslipPrintedbook.findById", query = "SELECT b FROM BorrowslipPrintedbook b WHERE b.id = :id")})
public class BorrowslipPrintedbook implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;
    @JoinColumn(name = "borrow_slip_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Borrowslip borrowSlipId;
    @JoinColumn(name = "printed_book_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Printedbook printedBookId;

    public BorrowslipPrintedbook() {
    }

    public BorrowslipPrintedbook(Integer id) {
        this.id = id;
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
        if (!(object instanceof BorrowslipPrintedbook)) {
            return false;
        }
        BorrowslipPrintedbook other = (BorrowslipPrintedbook) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.tnc.library.pojo.BorrowslipPrintedbook[ id=" + id + " ]";
    }
    
}

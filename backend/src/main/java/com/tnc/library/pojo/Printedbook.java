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
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;
import java.util.Set;

/**
 *
 * @author ADMIN
 */
@Data
@Entity
@Table(name = "printedbook")
@NamedQueries({
    @NamedQuery(name = "Printedbook.findAll", query = "SELECT p FROM Printedbook p"),
    @NamedQuery(name = "Printedbook.findById", query = "SELECT p FROM Printedbook p WHERE p.id = :id"),
    @NamedQuery(name = "Printedbook.findByShelfLocation", query = "SELECT p FROM Printedbook p WHERE p.shelfLocation = :shelfLocation"),
    @NamedQuery(name = "Printedbook.findByStatus", query = "SELECT p FROM Printedbook p WHERE p.status = :status"),
    @NamedQuery(name = "Printedbook.findByTotalCopy", query = "SELECT p FROM Printedbook p WHERE p.totalCopy = :totalCopy"),
    @NamedQuery(name = "Printedbook.findByBorrowCount", query = "SELECT p FROM Printedbook p WHERE p.borrowCount = :borrowCount")})
public class Printedbook implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "shelf_location")
    private String shelfLocation;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 14)
    @Column(name = "status")
    private String status;
    @Basic(optional = false)
    @NotNull
    @Column(name = "total_copy")
    private int totalCopy;
    @Basic(optional = false)
    @NotNull
    @Column(name = "borrow_count")
    private int borrowCount;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "printedBookId")
    private Set<BorrowslipPrintedbook> borrowslipPrintedbookSet;
    @JoinColumn(name = "id", referencedColumnName = "id", insertable = false, updatable = false)
    @OneToOne(optional = false)
    private Book book;

    public Printedbook() {
    }

    public Printedbook(Integer id) {
        this.id = id;
    }

    public Printedbook(Integer id, String shelfLocation, String status, int totalCopy, int borrowCount) {
        this.id = id;
        this.shelfLocation = shelfLocation;
        this.status = status;
        this.totalCopy = totalCopy;
        this.borrowCount = borrowCount;
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
        if (!(object instanceof Printedbook)) {
            return false;
        }
        Printedbook other = (Printedbook) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.tnc.library.pojo.Printedbook[ id=" + id + " ]";
    }
    
}

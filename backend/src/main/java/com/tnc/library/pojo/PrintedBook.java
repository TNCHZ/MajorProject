/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.tnc.library.pojo;

import com.tnc.library.enums.PrintedBookStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Set;

/**
 *
 * @author ADMIN
 */
@Getter
@Setter
@Entity
@Table(name = "printed_book")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PrintedBook implements Serializable {
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    @EqualsAndHashCode.Include
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "shelf_location")
    private String shelfLocation;
    @Basic(optional = false)
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PrintedBookStatus status;
    @Basic(optional = false)
    @NotNull
    @Column(name = "total_copy")
    private int totalCopy;
    @Basic(optional = false)
    @NotNull
    @Column(name = "borrow_count")
    private int borrowCount;
    @JoinColumn(name = "id", referencedColumnName = "id", insertable = false, updatable = false)
    @OneToOne(optional = false)
    @MapsId
    private Book book;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "printedBookId")
    private Set<PrintedBookBorrowSlip> printedBookBorrowSlipSet;
}

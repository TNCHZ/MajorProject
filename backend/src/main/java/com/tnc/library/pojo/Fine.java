/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.tnc.library.pojo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 *
 * @author ADMIN
 */
@Data
@Entity
@Table(name = "fine")
public class Fine implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Lob
    @Size(min = 1, max = 65535)
    @Column(name = "reason")
    private String reason;
    @Basic(optional = false)
    @NotNull
    @Column(name = "issued_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date issuedAt;
    @Basic(optional = false)
    @NotNull
    @Column(name = "is_paid")
    private boolean isPaid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "amount")
    private BigDecimal amount;
    @JoinColumn(name = "reader_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Reader readerId;
    @OneToOne
    @JoinColumn(name = "borrow_slip_id", nullable = false, unique = true)
    private BorrowSlip borrowSlip;
    @OneToOne
    @JoinColumn(name = "payment_id", nullable = false, unique = true)
    private Payment payment;
    @JoinColumn(name = "librarian_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Librarian librarianId;
    @JoinColumn(name = "type_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private TypeFine typeId;
}

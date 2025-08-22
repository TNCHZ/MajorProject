/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.tnc.library.pojo;

import com.tnc.library.enums.PaymentMethod;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.Set;

/**
 *
 * @author ADMIN
 */
@Data
@Entity
@Table(name = "payment")
public class Payment implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "title")
    private String title;
    @Basic(optional = false)
    @NotNull
    @Column(name = "payment_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date paymentDate;
    @Basic(optional = false)
    @NotNull
    @Column(name = "amount")
    private BigDecimal amount;
    @Basic(optional = false)
    @NotNull
    @Column(name = "is_paid")
    private boolean isPaid;
    @Basic(optional = false)
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "method")
    private PaymentMethod method;
    @OneToOne(cascade = CascadeType.ALL, mappedBy = "payment")
    private MembershipRenewal membershipRenewal;
    @OneToOne(cascade = CascadeType.ALL, mappedBy = "payment")
    private Fine fine;
    @JoinColumn(name = "reader_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Reader readerId;
    @JoinColumn(name = "librarian_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Librarian librarianId;
}

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.tnc.library.pojo;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 *
 * @author ADMIN
 */
@Data
@Entity
@Table(name = "online_payment")
public class OnlinePayment implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 100)
    @Column(name = "transaction_ref")
    private String transactionRef;
    @Size(max = 100)
    @Column(name = "transaction_id")
    private String transactionId;
    @Size(max = 255)
    @Column(name = "order_info")
    private String orderInfo;
    @Size(max = 10)
    @Column(name = "response_code")
    private String responseCode;
    @Size(max = 20)
    @Column(name = "bank_code")
    private String bankCode;
    @Column(name = "pay_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date payDate;
    @Size(max = 10)
    @Column(name = "status")
    private String status;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "provider")
    private String provider;
    @JoinColumn(name = "id", referencedColumnName = "id", insertable = false, updatable = false)
    @OneToOne(optional = false)
    private Payment payment;

    public OnlinePayment() {
    }

    public OnlinePayment(Integer id) {
        this.id = id;
    }

    public OnlinePayment(Integer id, String transactionRef, String provider) {
        this.id = id;
        this.transactionRef = transactionRef;
        this.provider = provider;
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
        if (!(object instanceof OnlinePayment)) {
            return false;
        }
        OnlinePayment other = (OnlinePayment) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.tnc.library.pojo.OnlinePayment[ id=" + id + " ]";
    }
    
}

package com.tnc.library.pojo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.util.Date;

@Data
@Entity
@Table(name = "membership_renewal")
public class MembershipRenewal implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @Column(name = "start_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date startDate;

    @NotNull
    @Column(name = "expire_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date expireDate;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private Date createdAt;

    @Column(name = "is_notify", nullable = false)
    private Boolean isNotify = false;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reader_id", referencedColumnName = "id")
    private User reader;

    @ManyToOne(optional = false)
    @JoinColumn(name = "type_id", referencedColumnName = "id")
    private TypeMembership type;

    @OneToOne
    @JoinColumn(name = "payment_id", unique = true)
    private Payment payment;
}

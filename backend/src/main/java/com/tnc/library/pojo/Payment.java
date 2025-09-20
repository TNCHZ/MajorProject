package com.tnc.library.pojo;

import com.tnc.library.enums.PaymentMethod;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "payment")
public class Payment implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "title", nullable = false)
    private String title;

    @NotNull
    @Column(name = "payment_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date paymentDate;

    @NotNull
    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @NotNull
    @Column(name = "is_paid", nullable = false)
    private boolean isPaid;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false)
    private PaymentMethod method;

    // Reader thực hiện payment
    @ManyToOne(optional = false)
    @JoinColumn(name = "reader_id", referencedColumnName = "id")
    private User reader;

    // Librarian xử lý payment
    @ManyToOne(optional = true)
    @JoinColumn(name = "librarian_id", referencedColumnName = "id")
    private User librarian;

    // Một payment có thể gắn với membership renewal
    @OneToOne(mappedBy = "payment", cascade = CascadeType.ALL)
    private MembershipRenewal membershipRenewal;

    // Một payment có thể gắn với fine
    @OneToOne(mappedBy = "payment", cascade = CascadeType.ALL)
    private Fine fine;
}

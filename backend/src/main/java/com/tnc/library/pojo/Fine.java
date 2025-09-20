package com.tnc.library.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "fine")
public class Fine implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Lob
    @NotNull
    @Size(min = 1, max = 65535)
    @Column(name = "reason", nullable = false)
    private String reason;

    @NotNull
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "issued_at", nullable = false)
    private Date issuedAt;

    @NotNull
    @Column(name = "is_paid", nullable = false)
    private boolean isPaid = false;

    @NotNull
    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "reader_id", nullable = false)
    @JsonIgnore
    private User reader;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "librarian_id")
    @JsonIgnore
    private User librarian;

    @OneToOne(optional = false, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "borrow_slip_id", nullable = false, unique = true)
    @JsonIgnore
    private BorrowSlip borrowSlip;

    @OneToOne(cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JoinColumn(name = "payment_id", unique = true)
    @JsonIgnore
    private Payment payment;

    @ManyToOne(optional = false)
    @JoinColumn(name = "type_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    private TypeFine typeFine;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Fine)) return false;
        Fine that = (Fine) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return 31;
    }
}

package com.tnc.library.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tnc.library.enums.BorrowStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "borrow_slip")
public class BorrowSlip implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "borrow_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date borrowDate;

    @Column(name = "due_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date dueDate;

    @Column(name = "return_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date returnDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BorrowStatus status;

    @Lob
    @Size(max = 65535)
    @Column(name = "note")
    private String note;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reader_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    private User reader;

    @ManyToOne
    @JoinColumn(name = "librarian_id", referencedColumnName = "id")
    @JsonIgnore
    private User librarian;


    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "borrowSlip", orphanRemoval = true)
    private java.util.Set<PrintedBookBorrowSlip> printedBookBorrowSlips;

    @JsonIgnore
    @OneToOne(mappedBy = "borrowSlip", cascade = CascadeType.ALL)
    private Fine fine;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BorrowSlip)) return false;
        BorrowSlip that = (BorrowSlip) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return 31;
    }
}

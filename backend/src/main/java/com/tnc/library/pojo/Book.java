package com.tnc.library.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.web.multipart.MultipartFile;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "book")
public class Book implements Serializable {

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
    @Size(min = 1)
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "publisher", nullable = false)
    private String publisher;

    @NotNull
    @Column(name = "published_date", nullable = false)
    private int publishedDate;

    @NotNull
    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "author", nullable = false)
    private String author;

    @Size(max = 10)
    @Column(name = "isbn_10")
    private String isbn10;

    @Size(max = 13)
    @Column(name = "isbn_13")
    private String isbn13;

    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "image", nullable = false)
    private String image;

    @NotNull
    @Column(name = "is_printed", nullable = false)
    private boolean isPrinted;

    @NotNull
    @Column(name = "is_electronic", nullable = false)
    private boolean isElectronic;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_date", updatable = false)
    private Date createdDate;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_date")
    private Date updatedDate;

    @Size(max = 50)
    @Column(name = "language")
    private String language;

    // ================= QUAN HỆ =================

    // User thủ thư quản lý sách
    @ManyToOne
    @JoinColumn(name = "librarian_id", referencedColumnName = "id")
    @JsonIgnore
    private User librarian;

    @OneToOne(cascade = CascadeType.ALL, mappedBy = "book", orphanRemoval = true)
    private EBook eBook;

    @OneToOne(cascade = CascadeType.ALL, mappedBy = "book", orphanRemoval = true)
    private PrintedBook printedBook;

    @Transient
    @JsonIgnore
    private MultipartFile file;

    // ================= equals & hashCode =================
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Book)) return false;
        Book book = (Book) o;
        return id != null && id.equals(book.id);
    }

    @Override
    public int hashCode() {
        return 31;
    }
}

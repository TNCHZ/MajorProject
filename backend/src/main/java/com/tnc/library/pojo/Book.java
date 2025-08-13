/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.tnc.library.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.web.multipart.MultipartFile;

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
@Table(name = "book")
public class Book implements Serializable {

    private static final long serialVersionUID = 1L;
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
    @Lob
    @Size(min = 1, max = 65535)
    @Column(name = "description")
    private String description;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "publisher")
    private String publisher;
    @Basic(optional = false)
    @NotNull
    @Column(name = "published_date")
    private int publishedDate;
    // @Max(value=?)  @Min(value=?)//if you know range of your decimal fields consider using these annotations to enforce field validation
    @Basic(optional = false)
    @NotNull
    @Column(name = "price")
    private BigDecimal price;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "author")
    private String author;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "image")
    private String image;
    @Size(max = 10)
    @Column(name = "isbn_10")
    private String isbn10;
    @Size(max = 13)
    @Column(name = "isbn_13")
    private String isbn13;
    @Basic(optional = false)
    @NotNull
    @Column(name = "is_printed")
    private boolean isPrinted;
    @Basic(optional = false)
    @NotNull
    @Column(name = "is_electronic")
    private boolean isElectronic;
    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private Date createdDate;
    @Column(name = "updated_date")
    @Temporal(TemporalType.TIMESTAMP)
    @UpdateTimestamp
    private Date updatedDate;
    @Size(max = 50)
    @Column(name = "language")
    private String language;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "bookId")
    private Set<CategoryBook> categoryBookSet;
    @OneToOne(cascade = CascadeType.ALL, mappedBy = "book")
    private EBook eBook;
    @JoinColumn(name = "librarian_id", referencedColumnName = "id")
    @ManyToOne
    private Librarian librarianId;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "bookId")
    private Set<Interact> interactSet;
    @OneToOne(cascade = CascadeType.ALL, mappedBy = "book")
    private PrintedBook printedBook;
    @Transient
    @JsonIgnore
    private MultipartFile file;
}

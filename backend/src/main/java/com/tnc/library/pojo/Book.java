/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.tnc.library.pojo;

import jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
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
@Table(name = "book")
@NamedQueries({
    @NamedQuery(name = "Book.findAll", query = "SELECT b FROM Book b"),
    @NamedQuery(name = "Book.findById", query = "SELECT b FROM Book b WHERE b.id = :id"),
    @NamedQuery(name = "Book.findByTitle", query = "SELECT b FROM Book b WHERE b.title = :title"),
    @NamedQuery(name = "Book.findByPublisher", query = "SELECT b FROM Book b WHERE b.publisher = :publisher"),
    @NamedQuery(name = "Book.findByPublishedDate", query = "SELECT b FROM Book b WHERE b.publishedDate = :publishedDate"),
    @NamedQuery(name = "Book.findByPrice", query = "SELECT b FROM Book b WHERE b.price = :price"),
    @NamedQuery(name = "Book.findByIsbn10", query = "SELECT b FROM Book b WHERE b.isbn10 = :isbn10"),
    @NamedQuery(name = "Book.findByIsbn13", query = "SELECT b FROM Book b WHERE b.isbn13 = :isbn13"),
    @NamedQuery(name = "Book.findByIsPrinted", query = "SELECT b FROM Book b WHERE b.isPrinted = :isPrinted"),
    @NamedQuery(name = "Book.findByIsElectronic", query = "SELECT b FROM Book b WHERE b.isElectronic = :isElectronic"),
    @NamedQuery(name = "Book.findByCreatedDate", query = "SELECT b FROM Book b WHERE b.createdDate = :createdDate"),
    @NamedQuery(name = "Book.findByUpdatedDate", query = "SELECT b FROM Book b WHERE b.updatedDate = :updatedDate"),
    @NamedQuery(name = "Book.findByLanguage", query = "SELECT b FROM Book b WHERE b.language = :language")})
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
    private Date createdDate;
    @Column(name = "updated_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;
    @Size(max = 50)
    @Column(name = "language")
    private String language;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "bookId")
    private Set<CategoryBook> categoryBookSet;
    @OneToOne(cascade = CascadeType.ALL, mappedBy = "book")
    private Printedbook printedbook;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "bookId")
    private Set<AuthorBook> authorBookSet;
    @JoinColumn(name = "librarian_id", referencedColumnName = "id")
    @ManyToOne
    private Librarian librarianId;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "bookId")
    private Set<Interact> interactSet;
    @OneToOne(cascade = CascadeType.ALL, mappedBy = "book")
    private Ebook ebook;

    public Book() {
    }

    public Book(Integer id) {
        this.id = id;
    }

    public Book(Integer id, String title, String description, String publisher, int publishedDate, BigDecimal price, boolean isPrinted, boolean isElectronic) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.publisher = publisher;
        this.publishedDate = publishedDate;
        this.price = price;
        this.isPrinted = isPrinted;
        this.isElectronic = isElectronic;
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
        if (!(object instanceof Book)) {
            return false;
        }
        Book other = (Book) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.tnc.library.pojo.Book[ id=" + id + " ]";
    }
    
}

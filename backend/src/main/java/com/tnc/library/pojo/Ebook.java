/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.tnc.library.pojo;

import jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Set;

/**
 *
 * @author ADMIN
 */
@Data
@Entity
@Table(name = "ebook")
@NamedQueries({
    @NamedQuery(name = "Ebook.findAll", query = "SELECT e FROM Ebook e"),
    @NamedQuery(name = "Ebook.findById", query = "SELECT e FROM Ebook e WHERE e.id = :id"),
    @NamedQuery(name = "Ebook.findByFileUrl", query = "SELECT e FROM Ebook e WHERE e.fileUrl = :fileUrl"),
    @NamedQuery(name = "Ebook.findByFormat", query = "SELECT e FROM Ebook e WHERE e.format = :format"),
    @NamedQuery(name = "Ebook.findByLisence", query = "SELECT e FROM Ebook e WHERE e.lisence = :lisence"),
    @NamedQuery(name = "Ebook.findByTotalView", query = "SELECT e FROM Ebook e WHERE e.totalView = :totalView")})
public class Ebook implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "fileUrl")
    private String fileUrl;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "format")
    private String format;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "lisence")
    private String lisence;
    @Basic(optional = false)
    @NotNull
    @Column(name = "totalView")
    private int totalView;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "eBookId")
    private Set<ReaderEbook> readerEbookSet;
    @JoinColumn(name = "id", referencedColumnName = "id", insertable = false, updatable = false)
    @OneToOne(optional = false)
    private Book book;

    public Ebook() {
    }

    public Ebook(Integer id) {
        this.id = id;
    }

    public Ebook(Integer id, String fileUrl, String format, String lisence, int totalView) {
        this.id = id;
        this.fileUrl = fileUrl;
        this.format = format;
        this.lisence = lisence;
        this.totalView = totalView;
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
        if (!(object instanceof Ebook)) {
            return false;
        }
        Ebook other = (Ebook) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.tnc.library.pojo.Ebook[ id=" + id + " ]";
    }
    
}

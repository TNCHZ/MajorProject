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
import org.springframework.web.multipart.MultipartFile;

import java.io.Serializable;
import java.util.Set;

/**
 *
 * @author ADMIN
 */
@Data
@Entity
@Table(name = "e_book")
public class EBook implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "file_url")
    private String fileUrl;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "format")
    private String format;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "licence")
    private String licence;
    @Basic(optional = false)
    @NotNull
    @Column(name = "total_view")
    private int totalView;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "eBookId")
    private Set<ReaderEBook> readerEBookSet;
    @JoinColumn(name = "id", referencedColumnName = "id", insertable = false, updatable = false)
    @OneToOne(optional = false)
    @MapsId
    private Book book;
    @Transient
    @JsonIgnore
    private MultipartFile file;

    public EBook() {
    }

    public EBook(Integer id) {
        this.id = id;
    }

    public EBook(Integer id, String fileUrl, String format, String licence, int totalView) {
        this.id = id;
        this.fileUrl = fileUrl;
        this.format = format;
        this.licence = licence;
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
        if (!(object instanceof EBook)) {
            return false;
        }
        EBook other = (EBook) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.tnc.library.pojo.EBook[ id=" + id + " ]";
    }
    
}

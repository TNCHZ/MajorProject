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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 *
 * @author ADMIN
 */
@Data
@Entity
@Table(name = "reader_ebook")
@NamedQueries({
    @NamedQuery(name = "ReaderEbook.findAll", query = "SELECT r FROM ReaderEbook r"),
    @NamedQuery(name = "ReaderEbook.findById", query = "SELECT r FROM ReaderEbook r WHERE r.id = :id"),
    @NamedQuery(name = "ReaderEbook.findByDuration", query = "SELECT r FROM ReaderEbook r WHERE r.duration = :duration")})
public class ReaderEbook implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Column(name = "duration")
    private int duration;
    @JoinColumn(name = "eBookId", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Ebook eBookId;
    @JoinColumn(name = "readerId", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Reader readerId;

    public ReaderEbook() {
    }

    public ReaderEbook(Integer id) {
        this.id = id;
    }

    public ReaderEbook(Integer id, int duration) {
        this.id = id;
        this.duration = duration;
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
        if (!(object instanceof ReaderEbook)) {
            return false;
        }
        ReaderEbook other = (ReaderEbook) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.tnc.library.pojo.ReaderEbook[ id=" + id + " ]";
    }
    
}

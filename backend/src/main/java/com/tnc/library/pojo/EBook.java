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
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.io.Serializable;
import java.util.Set;

/**
 *
 * @author ADMIN
 */
@Getter
@Setter
@Entity
@Table(name = "e_book")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EBook implements Serializable {

    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    @EqualsAndHashCode.Include
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
    @JoinColumn(name = "id", referencedColumnName = "id", insertable = false, updatable = false)
    @OneToOne(optional = false)
    @MapsId
    private Book book;
    @Transient
    @JsonIgnore
    private MultipartFile file;

}

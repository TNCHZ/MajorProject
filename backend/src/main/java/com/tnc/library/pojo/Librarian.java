/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.tnc.library.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Date;
import java.util.Set;

/**
 *
 * @author ADMIN
 */
@Getter
@Setter
@Entity
@Table(name = "librarian")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Librarian implements Serializable {
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    @EqualsAndHashCode.Include
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Column(name = "start_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date startDate;
    @JoinColumn(name = "id", referencedColumnName = "id", insertable = false, updatable = false)
    @OneToOne(optional = false)
    @JsonIgnore
    @MapsId
    private User user;
}

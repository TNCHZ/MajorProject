package com.tnc.library.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Entity
@Table(name = "interact")
public class Interact implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Size(max = 50)
    @Column(name = "react")
    private String react;

    @Lob
    @Size(max = 65535)
    @Column(name = "comment")
    private String comment;

    @ManyToOne(optional = false)
    @JoinColumn(name = "book_id", referencedColumnName = "id")
    @JsonIgnore
    private Book book;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reader_id", referencedColumnName = "id")
    @JsonIgnore
    private User reader;
}

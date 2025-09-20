package com.tnc.library.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Entity
@Table(name = "admin")
public class Admin implements Serializable {

    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    private Integer id;

    @OneToOne(optional = false)
    @JoinColumn(name = "id", referencedColumnName = "id", insertable = false, updatable = false)
    @MapsId
    @JsonIgnore
    private User user;

    // ================= CONSTRUCTORS =================
    public Admin() {}

    public Admin(Integer id) {
        this.id = id;
    }

    // ================= equals & hashCode =================
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Admin)) return false;
        Admin admin = (Admin) o;
        return id != null && id.equals(admin.id);
    }

    @Override
    public int hashCode() {
        return 31;
    }
}

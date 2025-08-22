package com.tnc.library.respositories;


import com.tnc.library.pojo.TypeFine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeFineRepository extends JpaRepository<TypeFine, Integer> {
    Optional<TypeFine> findByCode(String code);
}

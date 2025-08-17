package com.tnc.library.respositories;


import com.tnc.library.pojo.Reader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReaderRepository extends JpaRepository<Reader, Integer> {
    Optional<Reader> findByUserPhone(String phone);
    Optional<Reader> findByUserId(Integer id);
    Page<Reader> findAll(Pageable pageable);
}

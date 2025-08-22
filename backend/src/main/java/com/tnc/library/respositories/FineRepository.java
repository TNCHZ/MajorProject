package com.tnc.library.respositories;

import com.tnc.library.pojo.Fine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface FineRepository extends JpaRepository<Fine, Integer> {
    Page<Fine> findAll(Pageable pageable);
}

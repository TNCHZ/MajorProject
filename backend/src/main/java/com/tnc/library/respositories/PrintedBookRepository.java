package com.tnc.library.respositories;

import com.tnc.library.pojo.Printedbook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrintedBookRepository extends JpaRepository<Printedbook, Integer> {
}

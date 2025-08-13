package com.tnc.library.respositories;

import com.tnc.library.pojo.PrintedBook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrintedBookRepository extends JpaRepository<PrintedBook, Integer> {
    Page<PrintedBook> findAll(Pageable pageable);

}

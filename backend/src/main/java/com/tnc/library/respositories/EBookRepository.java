package com.tnc.library.respositories;

import com.tnc.library.pojo.EBook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EBookRepository extends JpaRepository<EBook, Integer> {
    Page<EBook> findAllEBook(Pageable pageable);
}

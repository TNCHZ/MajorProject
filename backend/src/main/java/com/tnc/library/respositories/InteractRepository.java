package com.tnc.library.respositories;

import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.Interact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InteractRepository extends JpaRepository<Interact, Integer> {
    Page<Interact> findByBookId(Book book, Pageable pageable);
}

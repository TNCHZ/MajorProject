package com.tnc.library.respositories;


import com.tnc.library.pojo.ReaderEBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReaderEBookRepository extends JpaRepository<ReaderEBook, Integer> {
}

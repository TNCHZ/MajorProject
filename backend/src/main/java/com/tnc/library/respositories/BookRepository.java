package com.tnc.library.respositories;

import com.tnc.library.pojo.Book;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;


@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {
    Optional<Book> findBookByTitle(String title);
    Optional<Book> findByIsbn10(String isbn10);
    Optional<Book> findByIsbn13(String isbn13);
    Page<Book> findAll(Pageable pageable);
    Optional<Book> findBookByTitleAndAuthorAndPublishedDate(String title, String author, int publishedDate);
}

package com.tnc.library.respositories;

import com.tnc.library.pojo.Author;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthorRepository extends JpaRepository<Author, Integer> {
    Optional<Author> findAuthorByName(String name);
}

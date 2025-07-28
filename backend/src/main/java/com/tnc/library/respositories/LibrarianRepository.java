package com.tnc.library.respositories;

import com.tnc.library.pojo.Librarian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface LibrarianRepository extends JpaRepository<Librarian, Integer> {
}

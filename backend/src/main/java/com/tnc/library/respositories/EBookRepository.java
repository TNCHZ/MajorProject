package com.tnc.library.respositories;

import com.tnc.library.pojo.Ebook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EBookRepository extends JpaRepository<Ebook, Integer> {
}

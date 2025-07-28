package com.tnc.library.respositories;

import com.tnc.library.pojo.CategoryBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryBookRepository extends JpaRepository<CategoryBook, Integer> {
}

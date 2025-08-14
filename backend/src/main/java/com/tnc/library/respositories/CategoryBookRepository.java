package com.tnc.library.respositories;

import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.CategoryBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryBookRepository extends JpaRepository<CategoryBook, Integer> {
    List<CategoryBook> findByBookId(Book bookId);
    void deleteByBookId(Book bookId);
}

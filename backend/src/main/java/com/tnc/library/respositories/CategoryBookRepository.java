package com.tnc.library.respositories;

import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.CategoryBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryBookRepository extends JpaRepository<CategoryBook, Integer> {
    List<CategoryBook> findByBookId(Book bookId);
    void deleteByBookId(Book bookId);

    @Query("SELECT cb.bookId FROM CategoryBook cb WHERE cb.categoryId.id = :categoryId")
    List<Book> findBooksByCategoryId(@Param("categoryId") Integer categoryId);


    @Query("SELECT cb.categoryId.name, COUNT(cb.bookId) " +
            "FROM CategoryBook cb " +
            "GROUP BY cb.categoryId.name")
    List<Object[]> countBooksGroupByCategory();

}

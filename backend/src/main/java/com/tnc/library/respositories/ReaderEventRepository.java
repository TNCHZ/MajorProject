package com.tnc.library.respositories;

import com.tnc.library.pojo.ReaderEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReaderEventRepository extends JpaRepository<ReaderEvent, Integer> {
}

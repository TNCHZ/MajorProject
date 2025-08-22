package com.tnc.library.respositories;

import com.tnc.library.pojo.Interact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InteractRepository extends JpaRepository<Interact, Integer> {

}

package com.tnc.library.services;

import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.Interact;
import org.springframework.data.domain.Page;

import java.util.List;

public interface InteractService {
    Interact addOrUpdateInteract(Interact i);
    Page<Interact> getInteractsByBookId(Book book, int page, int size);
}

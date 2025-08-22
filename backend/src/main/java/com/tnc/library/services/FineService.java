package com.tnc.library.services;

import com.tnc.library.pojo.Fine;
import org.springframework.data.domain.Page;

public interface FineService {
    Fine addOrUpdateFine(Fine f);

    public Page<Fine> getFines(int page, int size, String sortBy);

}

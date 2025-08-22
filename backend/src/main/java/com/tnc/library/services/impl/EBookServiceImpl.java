package com.tnc.library.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.EBook;
import com.tnc.library.respositories.EBookRepository;
import com.tnc.library.services.EBookService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class EBookServiceImpl implements EBookService {
    @Autowired
    private EBookRepository eBookRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Transactional
    @Override
    public EBook addOrUpdateEBook(EBook b) {
        if (b.getFile() != null && !b.getFile().isEmpty()) {
            try {
                String uploadDir = System.getProperty("user.dir") + "/uploads/ebooks/";
                File dir = new File(uploadDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                String originalFilename = b.getFile().getOriginalFilename();
                String fileName = System.currentTimeMillis() + "_" + originalFilename;
                String filePath = uploadDir + fileName;

                File file = new File(filePath);
                b.getFile().transferTo(file);

                b.setFileUrl("/uploads/ebooks/" + fileName);
            } catch (IOException ex) {
                Logger.getLogger(UserServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        return this.eBookRepository.save(b);
    }

    @Override
    public EBook getBookByEBookId(int id) {
        Optional<EBook> ebook = this.eBookRepository.findById(id);
        return ebook.orElse(null);
    }

    @Transactional
    @Override
    public void deleteEBook(EBook eb) {
        this.eBookRepository.delete(eb);
    }

    @Override
    public Page<EBook> getEBooks(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return this.eBookRepository.findAll(pageable);
    }
}

package com.tnc.library.dto;


import com.tnc.library.pojo.Reader;
import lombok.Data;

@Data
public class InteractResponseDTO {
    private Integer id;
    private String react;
    private String comment;
    private String name;
    private String avatar;
}

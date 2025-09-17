package com.tnc.library.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDTO {
    private Integer receiverId;
    private String chatId;
    private String content;

    private String senderType;  // có thể null
}

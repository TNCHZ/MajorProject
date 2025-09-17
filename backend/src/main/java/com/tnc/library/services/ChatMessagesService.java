package com.tnc.library.services;

import com.tnc.library.pojo.ChatMessages;
import org.springframework.data.domain.Page;

import java.awt.print.Pageable;
import java.util.List;

public interface ChatMessagesService {
    ChatMessages getChatById(Integer id);
    Page<ChatMessages> getMessages(Integer conversationId, int page, int size);
    ChatMessages addOrUpdateChatMessages(ChatMessages chatMessages);
}

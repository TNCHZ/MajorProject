package com.tnc.library.services.impl;

import com.tnc.library.pojo.ChatMessages;
import com.tnc.library.respositories.ChatMessagesRepository;
import com.tnc.library.services.ChatMessagesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChatMessagesServiceImpl implements ChatMessagesService {

    @Autowired
    private ChatMessagesRepository chatMessagesRepository;

    @Override
    public ChatMessages getChatById(Integer id) {
        Optional<ChatMessages> chatMessages = this.chatMessagesRepository.findById(id);
        return chatMessages.orElse(null);
    }

    @Override
    public ChatMessages addOrUpdateChatMessages(ChatMessages chatMessages) {
        return this.chatMessagesRepository.save(chatMessages);
    }
}

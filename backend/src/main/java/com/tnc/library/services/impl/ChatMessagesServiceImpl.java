package com.tnc.library.services.impl;

import com.tnc.library.pojo.ChatMessages;
import com.tnc.library.respositories.ChatMessagesRepository;
import com.tnc.library.services.ChatMessagesService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    public Page<ChatMessages> getMessages(Integer conversationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        return chatMessagesRepository.findByConversation_IdOrderByCreatedAtDesc(conversationId, pageable);
    }




    @Override
    @Transactional
    public ChatMessages addOrUpdateChatMessages(ChatMessages chatMessages) {
        return this.chatMessagesRepository.save(chatMessages);
    }
}

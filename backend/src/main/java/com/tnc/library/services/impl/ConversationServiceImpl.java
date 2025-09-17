package com.tnc.library.services.impl;

import com.tnc.library.pojo.Conversation;
import com.tnc.library.respositories.ConversationRepository;
import com.tnc.library.services.ConversationService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ConversationServiceImpl implements ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Override
    @Transactional
    public Conversation addOrUpdateConversation(Conversation conversation) {
        return this.conversationRepository.save(conversation);
    }

    @Override
    public Conversation getConversationById(Integer id) {
        Optional<Conversation> conversation = this.conversationRepository.findById(id);
        return conversation.orElse(null);
    }

    @Override
    @Transactional
    public void deleteConversation(Conversation conversation) {
        this.conversationRepository.delete(conversation);
    }

    @Override
    public Conversation getConversationByUserId(Integer id) {
        Optional<Conversation> conversation = this.conversationRepository.findByUserId(id);
        return conversation.orElse(null);
    }
}

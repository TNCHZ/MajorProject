package com.tnc.library.services;

import com.tnc.library.pojo.Conversation;

public interface ConversationService {
    Conversation addOrUpdateConversation(Conversation conversation);
    Conversation getConversationById(Integer id);
    void deleteConversation(Conversation conversation);
    Conversation getConversationByUserId(Integer id);
}

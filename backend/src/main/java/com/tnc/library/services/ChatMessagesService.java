package com.tnc.library.services;

import com.tnc.library.pojo.ChatMessages;

public interface ChatMessagesService {
    ChatMessages getChatById(Integer id);

    ChatMessages addOrUpdateChatMessages(ChatMessages chatMessages);
}

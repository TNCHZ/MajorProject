package com.tnc.library.controllers;

import com.tnc.library.dto.ChatMessageDTO;
import com.tnc.library.enums.SenderType;
import com.tnc.library.pojo.ChatMessages;
import com.tnc.library.pojo.Conversation;
import com.tnc.library.pojo.User;
import com.tnc.library.services.ChatMessagesService;
import com.tnc.library.services.ConversationService;
import com.tnc.library.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Objects;

@Controller
public class ChatController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessagesService chatMessagesService;

    @Autowired
    private UserService userService;

    @Autowired
    private ConversationService conversationService;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageDTO message, Principal principal) {
        if (principal == null) {
            System.out.println("🔑 Principal: NULL - Unauthorized access");
            return; // Do not process message if no authenticated user
        }

        String senderName = principal.getName();
        User sender = userService.getUserByUsername(senderName);

        if (sender == null) {
            System.out.println("🔑 User not found for username: " + senderName);
            return; // Do not process message if user not found
        }

        Conversation conversation = null;
        if (Objects.equals(sender.getRole(), "LIBRARIAN")) {
            conversation = conversationService.getConversationByUserId(message.getReceiverId());
            if (conversation == null) {
                conversation = new Conversation();
                conversation.setUser(this.userService.getUserByUserId(message.getReceiverId()));
                conversation = conversationService.addOrUpdateConversation(conversation);
            }
        } else {
            conversation = conversationService.getConversationByUserId(sender.getId());
            if (conversation == null) {
                conversation = new Conversation();
                conversation.setUser(this.userService.getUserByUserId(sender.getId()));
                conversation = conversationService.addOrUpdateConversation(conversation);
            }
        }

        SenderType senderType = SenderType.valueOf(sender.getRole());
        message.setSenderType(sender.getRole());
        ChatMessages chatMessage = new ChatMessages();
        chatMessage.setConversation(conversation);
        chatMessage.setSender(sender);
        chatMessage.setSenderType(senderType);
        chatMessage.setContent(message.getContent());

        // Lưu DB
        chatMessagesService.addOrUpdateChatMessages(chatMessage);

        // Nếu chưa có chatId thì tạo
        if (message.getChatId() == null && message.getReceiverId() != null) {
            message.setChatId(String.format("%s_%s",
                    Math.min(sender.getId(), message.getReceiverId()),
                    Math.max(sender.getId(), message.getReceiverId())));
        }

        // Gửi WebSocket
        if (message.getReceiverId() != null) {
            messagingTemplate.convertAndSendToUser(
                    message.getReceiverId().toString(),
                    "/queue/messages",
                    message
            );
        }

        messagingTemplate.convertAndSend("/topic/chat/" + message.getChatId(), message);

        System.out.println("[" + senderName + " - " + sender.getRole() + "] sent: " + message);
    }
}
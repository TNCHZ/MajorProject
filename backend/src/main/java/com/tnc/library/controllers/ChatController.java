package com.tnc.library.controllers;


import com.tnc.library.dto.ChatMessageDTO;
import com.tnc.library.pojo.ChatMessages;
import com.tnc.library.services.ChatMessagesService;
import com.tnc.library.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessagesService chatMessagesService;

    @Autowired
    private UserService userService;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageDTO message) {
        if (message.getSenderId() == null || message.getReceiverId() == null) {
            throw new IllegalArgumentException("Sender ID or Receiver ID cannot be null");
        }
        if (message.getChatId() == null) {
            message.setChatId(String.format("%s_%s",
                    Math.min(message.getSenderId(), message.getReceiverId()),
                    Math.max(message.getSenderId(), message.getReceiverId())));
        }

        System.out.println("Received message: " + message.getContent());
        System.out.println("Sending to sender: /user/" + message.getSenderId() + "/queue/messages");
        System.out.println("Sending to receiver: /user/" + message.getReceiverId() + "/queue/messages");
        System.out.println("Sending to topic: /topic/chat/" + message.getChatId());

        // Send to sender's queue
        messagingTemplate.convertAndSendToUser(
                message.getSenderId().toString(),
                "/queue/messages",
                message
        );
        // Send to receiver's queue
        messagingTemplate.convertAndSendToUser(
                message.getReceiverId().toString(),
                "/queue/messages",
                message
        );
        // Send to chat-specific topic
        messagingTemplate.convertAndSend(
                "/topic/chat/" + message.getChatId(),
                message
        );
    }
}

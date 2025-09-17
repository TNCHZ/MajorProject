package com.tnc.library.controllers;


import com.tnc.library.pojo.ChatMessages;
import com.tnc.library.pojo.Conversation;
import com.tnc.library.pojo.User;
import com.tnc.library.services.ChatMessagesService;
import com.tnc.library.services.ConversationService;
import com.tnc.library.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.Objects;

@RestController
@RequestMapping("/api")
public class ApiConversationController {
    @Autowired
    private ConversationService conversationService;

    @Autowired
    private UserService userService;

    @Autowired
    private ChatMessagesService chatMessagesService;

    @GetMapping("/conversation/by-user")
    public ResponseEntity<?> getConversationByUserId(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String username = principal.getName();
            User user = userService.getUserByUsername(username);

            Conversation conversation = conversationService.getConversationByUserId(user.getId());
            if (conversation == null) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            // Chỉ trả về messages
            Page<ChatMessages> messages = chatMessagesService.getMessages(conversation.getId(), page, size);

            return ResponseEntity.ok(messages.getContent());

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/conversation/user/{userId}")
    public ResponseEntity<?> getConversationByUserId(
            @PathVariable Integer userId,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String username = principal.getName();
            User user = userService.getUserByUsername(username);

            if(!Objects.equals(user.getRole(), "LIBRARIAN"))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng không hợp lệ");

            Conversation conversation = conversationService.getConversationByUserId(userId);
            if (conversation == null) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            Page<ChatMessages> messages = chatMessagesService.getMessages(conversation.getId(), page, size);

            return ResponseEntity.ok(messages.getContent());

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    @PostMapping("/add/conversation")
    public ResponseEntity<?> addConversation(Principal principal) {
        try {
            String username = principal.getName();
            User user = this.userService.getUserByUsername(username);

            Conversation existing = this.conversationService.getConversationByUserId(user.getId());
            if (existing == null) {
                Conversation conversation = new Conversation();
                conversation.setUser(user);
                Conversation saved = this.conversationService.addOrUpdateConversation(conversation);
                return ResponseEntity.ok(saved);
            } else {
                return ResponseEntity
                        .badRequest()
                        .body("Conversation đã tồn tại cho user này");
            }
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tạo conversation: " + e.getMessage());
        }
    }

}

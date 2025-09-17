package com.tnc.library.respositories;

import com.tnc.library.pojo.ChatMessages;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ChatMessagesRepository extends JpaRepository<ChatMessages, Integer> {
    Page<ChatMessages> findByConversation_IdOrderByCreatedAtDesc(Integer conversationId, Pageable pageable);
}

package org.example.quid.conversation.repository;

import org.example.quid.conversation.entity.Conversation;
import org.example.quid.conversation.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByConversationOrderByCreatedAtAsc(Conversation conversation);
}

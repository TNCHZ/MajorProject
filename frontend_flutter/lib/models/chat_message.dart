class ChatMessage {
  final String? chatId;
  final int? senderId;
  final String content;
  final String? senderType;
  final DateTime? createdAt;

  ChatMessage({
    this.chatId,
    this.senderId,
    required this.content,
    this.senderType,
    this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      chatId: json['chatId'],
      senderId: json['senderId'],
      content: json['content'],
      senderType: json['senderType'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "chatId": chatId,
      "senderId": senderId,
      "content": content,
      "senderType": senderType,
      "createdAt": createdAt?.toIso8601String(),
    };
  }
}

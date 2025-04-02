package com.openaiChatbot.Secure_Chatbot.dto;

import java.util.List;

public record ChatGPTRequest(String model, List<Message> messages) {

    public static record Message (String role, String content){

    }
    
}

package com.openaiChatbot.Secure_Chatbot.dto;

import com.openaiChatbot.Secure_Chatbot.dto.ChatGPTRequest.Message;
import java.util.List;

public record ChatGPTResponse(List<Choice> choices) {
    public static record Choice(Message message){
        public static record Message(String role, String content){

        }

    }
}

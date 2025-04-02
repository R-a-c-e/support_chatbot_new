package com.openaiChatbot.Secure_Chatbot.service;

import org.springframework.web.client.RestClient;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.openaiChatbot.Secure_Chatbot.dto.ChatGPTRequest;
import com.openaiChatbot.Secure_Chatbot.dto.ChatGPTResponse;
import com.openaiChatbot.Secure_Chatbot.dto.PromptRequest;

import java.util.List;


@Service
public class ChatGPTService {

    private final RestClient restClient;

    public ChatGPTService(RestClient restClient) {
        this.restClient = restClient;
    }

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.model}")
    private String model;

    public String getChatResponse(PromptRequest promptRequest) {
        ChatGPTRequest request = new ChatGPTRequest(model, List.of(new ChatGPTRequest.Message("user", promptRequest.prompt())));

        ChatGPTResponse response = restClient.post()
        .header("Authorization", "Bearer " + apiKey)
        .header("Content-Type", "application/json")
        .body(request)
        .retrieve()
        .body(ChatGPTResponse.class);

        return response.choices().get(0).message().content();
}
}

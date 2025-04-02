package com.openaiChatbot.Secure_Chatbot.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.openaiChatbot.Secure_Chatbot.service.ChatGPTService;
import com.openaiChatbot.Secure_Chatbot.dto.PromptRequest;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Value;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/chat")
public class ChatGPTController {
    private final ChatGPTService chatGPTService;
    
    @Value("${flask.api.url}")
    private String flaskApiUrl;

    public ChatGPTController(ChatGPTService chatGPTService) {
        this.chatGPTService = chatGPTService;
    }

    // Function to call the Python anonymization API
    private String anonymizeText(String text) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String requestBody = "{\"text\": \"" + text + "\"}";
        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(flaskApiUrl, request, String.class);
            return response.getBody();  // Return anonymized text
        } catch (Exception e) {
            System.err.println("Error calling Flask API: " + e.getMessage());
            return "Error anonymizing text";
        }
    }

    @PostMapping
    public String chat(@RequestBody PromptRequest promptRequest) {
        // Step 1: Anonymize user input before processing
        String anonymizedContent = anonymizeText(promptRequest.prompt());  // Use .prompt() instead of .getContent()

        // Step 2: Create a new request with anonymized content
        PromptRequest anonymizedRequest = new PromptRequest(anonymizedContent);

        // Step 3: Send the anonymized request to OpenAI
        return chatGPTService.getChatResponse(anonymizedRequest);
    }
}

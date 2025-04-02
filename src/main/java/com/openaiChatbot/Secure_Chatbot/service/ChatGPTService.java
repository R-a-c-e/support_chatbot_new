package com.openaiChatbot.Secure_Chatbot.service;

import org.springframework.web.client.RestClient;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.openaiChatbot.Secure_Chatbot.dto.PromptRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ChatGPTService {
    private static final Logger logger = LoggerFactory.getLogger(ChatGPTService.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public ChatGPTService(RestClient restClient, ObjectMapper objectMapper) {
        this.restClient = restClient;
        this.objectMapper = objectMapper;
    }

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.assistant.id}")
    private String assistantId;

    @Value("${openai.api.url}")
    private String baseUrl;

    public String getChatResponse(PromptRequest promptRequest) {
        try {
            logger.info("Starting chat with assistant ID: {}", assistantId);
            
            // Create a thread
            Map<String, Object> threadRequest = new HashMap<>();
            Map<String, Object> threadResponse = restClient.post()
                .uri(baseUrl + "/threads")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("OpenAI-Beta", "assistants=v2")
                .body(threadRequest)
                .retrieve()
                .body(Map.class);
            
            logger.info("Thread creation response: {}", threadResponse);
            String threadId = (String) threadResponse.get("id");
            logger.info("Created thread with ID: {}", threadId);

            // Add message to thread
            Map<String, Object> messageRequest = new HashMap<>();
            messageRequest.put("role", "user");
            messageRequest.put("content", promptRequest.prompt());
            
            Map<String, Object> messageBody = new HashMap<>();
            messageBody.put("role", "user");
            messageBody.put("content", promptRequest.prompt());
            
            Map<String, Object> messageResponse = restClient.post()
                .uri(baseUrl + "/threads/" + threadId + "/messages")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("OpenAI-Beta", "assistants=v2")
                .body(messageBody)
                .retrieve()
                .body(Map.class);
            logger.info("Message creation response: {}", messageResponse);

            // Run the assistant
            Map<String, Object> runRequest = new HashMap<>();
            runRequest.put("assistant_id", assistantId);
            
            Map<String, Object> runResponse = restClient.post()
                .uri(baseUrl + "/threads/" + threadId + "/runs")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("OpenAI-Beta", "assistants=v2")
                .body(runRequest)
                .retrieve()
                .body(Map.class);
            
            logger.info("Run creation response: {}", runResponse);
            String runId = (String) runResponse.get("id");
            logger.info("Started run with ID: {}", runId);

            // Poll for run completion
            boolean isCompleted = false;
            while (!isCompleted) {
                Map<String, Object> runStatus = restClient.get()
                    .uri(baseUrl + "/threads/" + threadId + "/runs/" + runId)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("OpenAI-Beta", "assistants=v2")
                    .retrieve()
                    .body(Map.class);
                
                logger.info("Run status response: {}", runStatus);
                String status = (String) runStatus.get("status");
                logger.info("Run status: {}", status);
                
                if ("completed".equals(status)) {
                    isCompleted = true;
                } else if ("failed".equals(status) || "cancelled".equals(status)) {
                    String errorMessage = (String) runStatus.get("last_error");
                    logger.error("Assistant run failed with status: {} and error: {}", status, errorMessage);
                    throw new RuntimeException("Assistant run failed with status: " + status + " and error: " + errorMessage);
                }
                Thread.sleep(1000); // Wait 1 second before polling again
            }

            // Get the assistant's response
            Map<String, Object> messagesResponse = restClient.get()
                .uri(baseUrl + "/threads/" + threadId + "/messages")
                .header("Authorization", "Bearer " + apiKey)
                .header("OpenAI-Beta", "assistants=v2")
                .retrieve()
                .body(Map.class);
            
            logger.info("Messages response: {}", messagesResponse);
            List<Map<String, Object>> messages = (List<Map<String, Object>>) messagesResponse.get("data");
            logger.info("Messages list: {}", messages);

            // Find the assistant's message (it should be the first message with role "assistant")
            String response = null;
            for (Map<String, Object> message : messages) {
                logger.info("Processing message: {}", message);
                String role = (String) message.get("role");
                logger.info("Message role: {}", role);
                if ("assistant".equals(role)) {
                    List<Map<String, Object>> content = (List<Map<String, Object>>) message.get("content");
                    logger.info("Message content: {}", content);
                    if (content != null && !content.isEmpty()) {
                        Map<String, Object> textContent = content.get(0);
                        logger.info("Text content: {}", textContent);
                        Map<String, Object> text = (Map<String, Object>) textContent.get("text");
                        response = (String) text.get("value");
                        logger.info("Extracted response: {}", response);
                        break;
                    }
                }
            }
            
            if (response == null) {
                throw new RuntimeException("No assistant response found in messages");
            }
            
            logger.info("Final response: {}", response);
            return response;

        } catch (Exception e) {
            logger.error("Error in getChatResponse: ", e);
            throw new RuntimeException("Error getting chat response: " + e.getMessage(), e);
        }
    }
}

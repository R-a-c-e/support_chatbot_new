package com.openaiChatbot.Secure_Chatbot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class OpanAPIConfiguration {
    @Value("${openai.api.url}")
    private String apiUrl;

    @Value("${openai.api.model}")
    private String apiModel;

    @Bean
    public RestClient restClient() {
        return RestClient.builder()
        .baseUrl(apiUrl)
        .build();
    }
     
}

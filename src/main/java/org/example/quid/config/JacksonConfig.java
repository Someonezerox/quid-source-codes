package org.example.quid.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Boot 4's spring-boot-starter-webmvc does not always contribute an ObjectMapper bean,
 * which ChatClient depends on. Provide one (only if none already exists).
 */
@Configuration
public class JacksonConfig {

    @Bean
    @ConditionalOnMissingBean
    public ObjectMapper objectMapper() {
        return new ObjectMapper().findAndRegisterModules();
    }
}

package dev.joaopdias.vox.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;

@Configuration
@EnableWebSocketSecurity
public class WebSocketSecurityConfig {

    @Bean
    AuthorizationManager<Message<?>> messageAuthorizationManager(
            MessageMatcherDelegatingAuthorizationManager.Builder messages
    ) {
        messages
                .nullDestMatcher().permitAll()
                .simpDestMatchers("/app/ballot/*/open").authenticated()
                .simpDestMatchers("/app/ballot/*/close").authenticated()
                .simpSubscribeDestMatchers("/topic/ballot/**").permitAll()
                .anyMessage().denyAll();

        return messages.build();
    }
}
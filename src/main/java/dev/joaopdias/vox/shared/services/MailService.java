package dev.joaopdias.vox.shared.services;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Year;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class MailService {
    @Autowired
    private JavaMailSender mailSender;

    private final String from;
    private final String clientUrl;

    public MailService(
        @Value("${app.mail.from}") String from,
        @Value("${app.clients.url}") String clientsUrl
    ) {
        this.from = from;
        this.clientUrl = clientsUrl.split(";")[0].trim();
    }

    public void sendAccountValidationEmail(String to, String token) {
        String html = loadTemplate(
            "templates/mail/account-validation.html",
            Map.of(
                "validationUrl", clientUrl + "/user/validate-account?token=" + token,
                "year", String.valueOf(Year.now().getValue())
            )
        );

        sendHtmlEmail(to, "VOX - Confirmação de conta", html);
    }

    public void sendTemporaryPasswordEmail(String to, String password) {
        sendTemporaryPasswordEmail(to, password, clientUrl);
    }

    public void sendTemporaryPasswordEmail(String to, String password, String url) {
        String html = loadTemplate(
            "templates/mail/temporary-password.html",
            Map.of(
                "password", password,
                "url", url,
                "year", String.valueOf(Year.now().getValue())
            )
        );

        sendHtmlEmail(to, "VOX - Nova senha gerada", html);
    }

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            message.setFrom(from);
            message.setRecipients(MimeMessage.RecipientType.TO, to);
            message.setSubject(subject, "UTF-8");
            message.setText(html, StandardCharsets.UTF_8.name(), "html");

            mailSender.send(message);
        } catch (MessagingException exception) {
            throw new IllegalStateException("Não foi possível enviar o e-mail", exception);
        }
    }

    private String loadTemplate(String path, Map<String, String> variables) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
            String html = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);

            for (Map.Entry<String, String> entry : variables.entrySet()) 
                html = html.replace("{{" + entry.getKey() + "}}", escapeHtml(entry.getValue()));

            return html;
        } catch (IOException exception) {
            throw new IllegalStateException("Não foi possível carregar o template de e-mail: " + path, exception);
        }
    }

    private String escapeHtml(String value) {
        if (value == null) return "";

        return value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }
}

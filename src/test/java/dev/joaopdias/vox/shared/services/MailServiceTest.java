package dev.joaopdias.vox.shared.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

@ExtendWith(MockitoExtension.class)
class MailServiceTest {
    @Mock
    private JavaMailSender mailSender;

    private MailService mailService;

    @BeforeEach
    void setUp() {
        mailService = new MailService(
            "noreply@vox.test",
            "https://client-a.example; https://client-b.example",
            mailSender
        );
    }

    @Test
    void sendsAccountValidationEmailUsingFirstConfiguredClientUrl() throws Exception {
        MimeMessage message = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(message);

        mailService.sendAccountValidationEmail("ana@example.com", "validation-jwt");

        MimeMessage sent = sentMessage();
        String html = (String) sent.getContent();

        assertThat(((InternetAddress) sent.getFrom()[0]).getAddress()).isEqualTo("noreply@vox.test");
        assertThat(((InternetAddress) sent.getAllRecipients()[0]).getAddress()).isEqualTo("ana@example.com");
        assertThat(sent.getSubject()).isEqualTo("VOX - Confirmação de conta");
        assertThat(sent.getContentType()).contains("text/html");
        assertThat(html).contains("https://client-a.example/user/validate-account?token=validation-jwt");
        assertThat(html).doesNotContain("https://client-b.example");
    }

    @Test
    void sendsTemporaryPasswordEmailWithEscapedVariables() throws Exception {
        MimeMessage message = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(message);

        mailService.sendTemporaryPasswordEmail(
            "ana@example.com",
            "A<>&\"'1a!",
            "https://client.example/login?next=<home>&q=\"x\""
        );

        MimeMessage sent = sentMessage();
        String html = (String) sent.getContent();

        assertThat(sent.getSubject()).isEqualTo("VOX - Nova senha gerada");
        assertThat(html).contains("A&lt;&gt;&amp;&quot;&#39;1a!");
        assertThat(html).contains("https://client.example/login?next=&lt;home&gt;&amp;q=&quot;x&quot;");
        assertThat(html).doesNotContain("A<>&\"'1a!");
        assertThat(html).doesNotContain("next=<home>");
    }

    private MimeMessage sentMessage() throws Exception {
        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        MimeMessage message = messageCaptor.getValue();
        message.saveChanges();
        return message;
    }
}

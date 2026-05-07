package com.cj.beautybook.auth.application;

import com.cj.beautybook.common.exception.BusinessException;
import com.cj.beautybook.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationSender {

    private final JavaMailSender mailSender;
    private final EmailVerificationProperties properties;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public void sendCode(String email, String code) {
        if (properties.isLogOnly()) {
            log.info("[DEV] 이메일 인증코드 log-only 모드. destination={}, code={}, ttlSeconds={}",
                    email, code, properties.getCodeTtlSeconds());
            return;
        }

        String from = StringUtils.hasText(properties.getFrom()) ? properties.getFrom() : mailUsername;
        if (!StringUtils.hasText(from)) {
            // dev-bypass-code가 설정되어 있으면 SMTP 없이도 로그로 대체 (개발 전용)
            if (StringUtils.hasText(properties.getDevBypassCode())) {
                log.info("[DEV] SMTP 미설정이지만 dev-bypass-code가 있으므로 로그로 대체. destination={}, code={}",
                        email, code);
                return;
            }
            throw new BusinessException(ErrorCode.MAIL_NOT_CONFIGURED);
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(email);
        message.setSubject(properties.getSubject());
        message.setText("""
                BeautyBook 이메일 인증코드입니다.

                인증코드: %s

                인증코드는 %d분 동안 유효합니다.
                """.formatted(code, Math.max(1, properties.getCodeTtlSeconds() / 60)));
        mailSender.send(message);
    }
}

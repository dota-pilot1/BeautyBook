package com.cj.beautybook.auth.application;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "auth.email-verification")
public class EmailVerificationProperties {
    private long codeTtlSeconds = 300;
    private long verifiedTokenTtlSeconds = 600;
    private String subject = "BeautyBook 이메일 인증코드";
    private String from = "";
    private boolean logOnly = true;
    private String devBypassCode = "";
}

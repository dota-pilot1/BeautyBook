package com.cj.beautybook.user.application;

import com.cj.beautybook.auth.application.EmailVerificationService;
import com.cj.beautybook.auth.domain.AuthAccount;
import com.cj.beautybook.auth.domain.AuthProviderType;
import com.cj.beautybook.auth.domain.RefreshToken;
import com.cj.beautybook.auth.infrastructure.AuthAccountRepository;
import com.cj.beautybook.auth.infrastructure.RefreshTokenRepository;
import com.cj.beautybook.auth.jwt.JwtTokenProvider;
import com.cj.beautybook.auth.jwt.TokenType;
import com.cj.beautybook.common.exception.BusinessException;
import com.cj.beautybook.common.exception.DuplicateEmailException;
import com.cj.beautybook.common.exception.ErrorCode;
import com.cj.beautybook.common.exception.InvalidRefreshTokenException;
import com.cj.beautybook.config.RoleSeeder;
import com.cj.beautybook.role.domain.Role;
import com.cj.beautybook.role.infrastructure.RoleRepository;
import com.cj.beautybook.user.domain.User;
import com.cj.beautybook.user.infrastructure.UserRepository;
import com.cj.beautybook.user.presentation.dto.*;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AuthAccountRepository authAccountRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public TokenResponse signup(SignupRequest req) {
        String email = emailVerificationService.normalizeEmail(req.email());
        verifySignupToken(email, req.verifiedToken());
        if (authAccountRepository.existsByProviderTypeAndIdentifier(AuthProviderType.EMAIL, email)) {
            throw new DuplicateEmailException();
        }
        String signupRoleCode = userRepository.count() == 0
                ? RoleSeeder.ROLE_ADMIN
                : RoleSeeder.ROLE_USER;
        Role defaultRole = roleRepository.findByCode(signupRoleCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));
        String hash = passwordEncoder.encode(req.password());
        User saved = userRepository.save(User.createNewUser(req.username(), defaultRole));
        authAccountRepository.save(AuthAccount.createEmail(saved, email, hash, true));
        return issueTokens(saved, email);
    }

    @Transactional(readOnly = true)
    public boolean isEmailAvailable(String email) {
        String normalized = emailVerificationService.normalizeEmail(email);
        return !authAccountRepository.existsByProviderTypeAndIdentifier(AuthProviderType.EMAIL, normalized);
    }

    @Transactional
    public TokenResponse login(LoginRequest req) {
        String email = emailVerificationService.normalizeEmail(req.email());
        AuthAccount account = authAccountRepository.findByProviderTypeAndIdentifier(AuthProviderType.EMAIL, email)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        if (account.getPasswordHash() == null || !passwordEncoder.matches(req.password(), account.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        if (!account.isVerified()) throw new BusinessException(ErrorCode.EMAIL_NOT_VERIFIED);
        User user = account.getUser();
        if (!user.isActive()) throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE);
        return issueTokens(user, account.getIdentifier());
    }

    @Transactional
    public TokenResponse refresh(RefreshRequest req) {
        Claims claims;
        try {
            claims = jwtTokenProvider.parse(req.refreshToken()).getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new InvalidRefreshTokenException();
        }
        if (jwtTokenProvider.getType(claims) != TokenType.REFRESH) {
            throw new InvalidRefreshTokenException();
        }
        Long userId = jwtTokenProvider.getUserId(claims);

        RefreshToken saved = refreshTokenRepository.findByUserId(userId)
                .orElseThrow(InvalidRefreshTokenException::new);

        if (!saved.getToken().equals(req.refreshToken()) || saved.isExpired()) {
            refreshTokenRepository.deleteByUserId(userId);
            throw new InvalidRefreshTokenException();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (!user.isActive()) throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE);

        return issueTokens(user, findEmailIdentifier(user));
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public UserSummary me(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return UserSummary.from(user, findEmailIdentifier(user));
    }

    private TokenResponse issueTokens(User user, String email) {
        List<String> permCodes = user.getRole().getPermissions()
                .stream().map(p -> p.getCode()).toList();
        String access  = jwtTokenProvider.generateAccessToken(user.getId(), email, user.getUsername(), user.getRole().getCode(), permCodes);
        String refresh = jwtTokenProvider.generateRefreshToken(user.getId());
        Instant expiresAt = Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpirationMs());

        refreshTokenRepository.findByUserId(user.getId()).ifPresentOrElse(
                rt -> rt.rotate(refresh, expiresAt),
                () -> refreshTokenRepository.save(RefreshToken.create(user.getId(), refresh, expiresAt))
        );

        long expiresInSec = jwtTokenProvider.getAccessTokenExpirationMs() / 1000;
        return new TokenResponse(access, refresh, expiresInSec, UserSummary.from(user, email));
    }

    private String findEmailIdentifier(User user) {
        return authAccountRepository.findFirstByUserIdAndProviderTypeOrderByIdAsc(user.getId(), AuthProviderType.EMAIL)
                .map(AuthAccount::getIdentifier)
                .orElse(null);
    }

    private void verifySignupToken(String email, String verifiedToken) {
        Claims claims;
        try {
            claims = jwtTokenProvider.parse(verifiedToken).getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
        if (jwtTokenProvider.getType(claims) != TokenType.EMAIL_VERIFICATION
                || jwtTokenProvider.getProviderType(claims) != AuthProviderType.EMAIL
                || !email.equals(jwtTokenProvider.getIdentifier(claims))) {
            throw new BusinessException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
    }
}

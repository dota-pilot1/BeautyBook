package com.cj.beautybook.config;

import com.cj.beautybook.auth.domain.AuthAccount;
import com.cj.beautybook.auth.domain.AuthProviderType;
import com.cj.beautybook.auth.infrastructure.AuthAccountRepository;
import com.cj.beautybook.role.domain.Role;
import com.cj.beautybook.role.infrastructure.RoleRepository;
import com.cj.beautybook.user.domain.User;
import com.cj.beautybook.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@Order(5)
@RequiredArgsConstructor
public class TestAccountSeeder implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AuthAccountRepository authAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.test-accounts.enabled:true}")
    private boolean enabled;

    @Value("${app.seed.test-accounts.password:password123}")
    private String password;

    @Value("${app.seed.test-accounts.email-domain:beautybook.local}")
    private String emailDomain;

    private record TestAccountDef(String roleCode, String username, String emailLocalPart) {}

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("Test account seeding is disabled.");
            return;
        }

        List<TestAccountDef> defaults = List.of(
                new TestAccountDef(RoleSeeder.ROLE_ADMIN, "관리자 테스트", "admin"),
                new TestAccountDef(RoleSeeder.ROLE_MANAGER, "매니저 테스트", "manager"),
                new TestAccountDef(RoleSeeder.ROLE_USER, "일반 사용자 테스트", "user")
        );

        for (TestAccountDef def : defaults) {
            String email = "%s@%s".formatted(def.emailLocalPart(), emailDomain);
            if (authAccountRepository.existsByProviderTypeAndIdentifier(AuthProviderType.EMAIL, email)) {
                continue;
            }

            Role role = roleRepository.findByCode(def.roleCode())
                    .orElseThrow(() -> new IllegalStateException("Default role not found: " + def.roleCode()));
            User user = userRepository.save(User.createNewUser(def.username(), role));
            authAccountRepository.save(AuthAccount.createEmail(
                    user,
                    email,
                    passwordEncoder.encode(password),
                    true
            ));
            log.info("Seeded test account: {} ({})", email, def.roleCode());
        }
    }
}

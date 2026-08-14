package com.cj.beautybook.config;

import com.cj.beautybook.role.domain.Role;
import com.cj.beautybook.role.infrastructure.RoleRepository;
import com.cj.beautybook.user.domain.User;
import com.cj.beautybook.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@Profile("dev")
@Order(4)
@RequiredArgsConstructor
public class DevAdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.dev-admin.email:terecal@daum.net}")
    private String email;

    @Value("${app.dev-admin.password:password123}")
    private String password;

    @Value("${app.dev-admin.username:개발 관리자}")
    private String username;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(email)) {
            log.info("Dev admin already exists: {}", email);
            return;
        }

        Role adminRole = roleRepository.findByCode(RoleSeeder.ROLE_ADMIN)
                .orElseThrow(() -> new IllegalStateException("Admin role not found"));

        userRepository.save(User.createNewUser(
                email,
                passwordEncoder.encode(password),
                username,
                adminRole
        ));
        log.info("Seeded dev admin user: {}", email);
    }
}

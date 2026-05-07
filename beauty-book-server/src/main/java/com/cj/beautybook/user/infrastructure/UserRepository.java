package com.cj.beautybook.user.infrastructure;

import com.cj.beautybook.user.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByRoleCode(String code);
    boolean existsByRoleId(Long roleId);
    Page<User> findAll(Pageable pageable);
}

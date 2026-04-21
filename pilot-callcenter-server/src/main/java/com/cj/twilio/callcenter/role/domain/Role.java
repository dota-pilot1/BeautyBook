package com.cj.twilio.callcenter.role.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "roles", uniqueConstraints = @UniqueConstraint(columnNames = "code"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String code;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private boolean systemRole;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public static Role create(String code, String name, String description, boolean systemRole) {
        Role r = new Role();
        r.code = code;
        r.name = name;
        r.description = description;
        r.systemRole = systemRole;
        return r;
    }

    public void rename(String name, String description) {
        this.name = name;
        this.description = description;
    }
}

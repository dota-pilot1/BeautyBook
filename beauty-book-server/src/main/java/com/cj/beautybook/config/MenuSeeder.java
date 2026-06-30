package com.cj.beautybook.config;

import com.cj.beautybook.menu.domain.Menu;
import com.cj.beautybook.menu.infrastructure.MenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@Order(4)
@RequiredArgsConstructor
public class MenuSeeder implements ApplicationRunner {

    private final MenuRepository menuRepository;

    private record MenuDef(
            String code, String parentCode, String label, String labelKey,
            String path, String icon, String requiredRole, int displayOrder
    ) {}

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<MenuDef> defs = List.of(
                new MenuDef("DASHBOARD",             null,    "대시보드",      "nav.dashboard",        "/dashboard",        "LayoutDashboard", null,                    0),
                new MenuDef("ADMIN",                 null,    "관리",          "nav.admin",            null,                "Settings",        RoleSeeder.ROLE_ADMIN,   1),
                new MenuDef("ADMIN_RESERVATIONS",    "ADMIN", "예약 관리",     "nav.reservations",     "/reservations",     "ClipboardList",   RoleSeeder.ROLE_ADMIN,   0),
                new MenuDef("ADMIN_APPOINTMENT_BOARD","ADMIN","예약 현황",     "nav.appointmentBoard", "/appointment-board","CalendarDays",    RoleSeeder.ROLE_ADMIN,   1),
                new MenuDef("ADMIN_SERVICES",        "ADMIN", "시술 메뉴 관리", "nav.services",         "/services",         "Scissors",        RoleSeeder.ROLE_ADMIN,   2),
                new MenuDef("ADMIN_SERVICE_CATEGORIES","ADMIN","시술 카테고리", "nav.serviceCategories","/service-categories","Package",         RoleSeeder.ROLE_ADMIN,   3),
                new MenuDef("ADMIN_SERVICE_AVAILABILITY","ADMIN","예약 가능 관리","nav.serviceAvailability","/service-availability","Eye",        RoleSeeder.ROLE_ADMIN,   4),
                new MenuDef("ADMIN_REVENUE",         "ADMIN", "매출 관리",     "nav.revenue",          "/revenue",          "BarChart3",       RoleSeeder.ROLE_ADMIN,   5),
                new MenuDef("ADMIN_USERS",           "ADMIN", "유저 관리",     "nav.users",            "/users",            "Users",           RoleSeeder.ROLE_ADMIN,   6),
                new MenuDef("ADMIN_ROLES",           "ADMIN", "롤 관리",       "nav.roleManagement",   "/roles",            "BadgeCheck",      RoleSeeder.ROLE_ADMIN,   7),
                new MenuDef("ADMIN_PERMISSIONS",     "ADMIN", "권한 관리",     "nav.permissions",      "/permissions",      "KeyRound",        RoleSeeder.ROLE_ADMIN,   8),
                new MenuDef("ADMIN_ROLE_PERMISSIONS","ADMIN", "역할-권한 매핑","nav.rolePermissions",  "/role-permissions", "ShieldCheck",     RoleSeeder.ROLE_ADMIN,   9),
                new MenuDef("ADMIN_SITE_SETTINGS",   "ADMIN", "매장 설정",     "nav.siteSettings",     "/site-settings",    "LayoutDashboard", RoleSeeder.ROLE_ADMIN,   10),
                new MenuDef("ADMIN_MENU_MANAGEMENT", "ADMIN", "헤더 메뉴 관리","nav.menuManagement",   "/menu-management",  "Menu",            RoleSeeder.ROLE_ADMIN,   11)
        );

        for (MenuDef def : defs) {
            if (menuRepository.existsByCode(def.code())) continue;
            Menu parent = def.parentCode() != null
                    ? menuRepository.findByCode(def.parentCode()).orElse(null)
                    : null;
            menuRepository.save(Menu.create(
                    def.code(), parent, def.label(), def.labelKey(),
                    def.path(), def.icon(), false,
                    def.requiredRole(), null, true, def.displayOrder()
            ));
            log.info("Seeded menu: {}", def.code());
        }
    }
}

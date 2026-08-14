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
                new MenuDef("ADMIN_OPERATIONS",      "ADMIN", "운영 관리",     null,                   null,                "ClipboardList",   RoleSeeder.ROLE_ADMIN,   0),
                new MenuDef("ADMIN_SYSTEM",          "ADMIN", "시스템 관리",   null,                   null,                "Settings",        RoleSeeder.ROLE_ADMIN,   1),
                new MenuDef("ADMIN_RESERVATIONS",    "ADMIN_OPERATIONS", "예약 관리",     "nav.reservations",     "/reservations",     "ClipboardList",   RoleSeeder.ROLE_ADMIN,   0),
                new MenuDef("ADMIN_APPOINTMENT_BOARD","ADMIN_OPERATIONS","예약 현황",     "nav.appointmentBoard", "/appointment-board","CalendarDays",    RoleSeeder.ROLE_ADMIN,   1),
                new MenuDef("ADMIN_SERVICES",        "ADMIN_OPERATIONS", "시술 메뉴 관리", "nav.services",         "/services",         "Scissors",        RoleSeeder.ROLE_ADMIN,   2),
                new MenuDef("ADMIN_SERVICE_CATEGORIES","ADMIN_OPERATIONS","시술 카테고리", "nav.serviceCategories","/service-categories","Package",         RoleSeeder.ROLE_ADMIN,   3),
                new MenuDef("ADMIN_SERVICE_AVAILABILITY","ADMIN_OPERATIONS","예약 가능 관리","nav.serviceAvailability","/service-availability","Eye",        RoleSeeder.ROLE_ADMIN,   4),
                new MenuDef("ADMIN_REVENUE",         "ADMIN_OPERATIONS", "매출 관리",     "nav.revenue",          "/revenue",          "BarChart3",       RoleSeeder.ROLE_ADMIN,   5),
                new MenuDef("ADMIN_USERS",           "ADMIN_SYSTEM", "유저 관리",     "nav.users",            "/users",            "Users",           RoleSeeder.ROLE_ADMIN,   0),
                new MenuDef("ADMIN_ROLES",           "ADMIN_SYSTEM", "롤 관리",       "nav.roleManagement",   "/roles",            "BadgeCheck",      RoleSeeder.ROLE_ADMIN,   1),
                new MenuDef("ADMIN_PERMISSIONS",     "ADMIN_SYSTEM", "권한 관리",     "nav.permissions",      "/permissions",      "KeyRound",        RoleSeeder.ROLE_ADMIN,   2),
                new MenuDef("ADMIN_ROLE_PERMISSIONS","ADMIN_SYSTEM", "역할-권한 매핑","nav.rolePermissions",  "/role-permissions", "ShieldCheck",     RoleSeeder.ROLE_ADMIN,   3),
                new MenuDef("ADMIN_SITE_SETTINGS",   "ADMIN_SYSTEM", "매장 설정",     "nav.siteSettings",     "/site-settings",    "LayoutDashboard", RoleSeeder.ROLE_ADMIN,   4),
                new MenuDef("ADMIN_MENU_MANAGEMENT", "ADMIN_SYSTEM", "헤더 메뉴 관리","nav.menuManagement",   "/menu-management",  "Menu",            RoleSeeder.ROLE_ADMIN,   5)
        );

        for (MenuDef def : defs) {
            Menu parent = def.parentCode() != null
                    ? menuRepository.findByCode(def.parentCode()).orElse(null)
                    : null;
            Menu menu = menuRepository.findByCode(def.code())
                    .orElseGet(() -> Menu.create(
                            def.code(), parent, def.label(), def.labelKey(),
                            def.path(), def.icon(), false,
                            def.requiredRole(), null, true, def.displayOrder()
                    ));
            menu.update(
                    parent, def.label(), def.labelKey(),
                    def.path(), def.icon(), false,
                    def.requiredRole(), null, true, def.displayOrder()
            );
            menuRepository.save(menu);
            log.info("Upserted menu: {}", def.code());
        }
    }
}

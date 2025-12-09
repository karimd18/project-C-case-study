package com.projectc.service;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class StartupService {

    private static final Logger LOG = LoggerFactory.getLogger(StartupService.class);

    @Inject
    AuthService authService;

    void onStart(@Observes StartupEvent ev) {
        LOG.info("Application starting... Checking Database connection...");
        try {
            // Attempt to create a seed user to verify DB writes and create collection
            try {
                authService.register("admin@projectc.com", "Admin123!");
                LOG.info("SUCCESS: Database connected. 'users' collection created. Admin user registered.");
            } catch (Exception e) {
                if (e.getMessage().contains("User already exists")) {
                    LOG.info("SUCCESS: Database connected. Admin user already exists.");
                } else {
                    LOG.error("FAILURE: Could not write to Database during startup.", e);
                }
            }
        } catch (Exception e) {
            LOG.error("CRITICAL: Unexpected error during startup DB probe.", e);
        }
    }
}

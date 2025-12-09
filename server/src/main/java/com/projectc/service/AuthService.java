package com.projectc.service;

import com.projectc.model.User;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;

@ApplicationScoped
public class AuthService {

    @ConfigProperty(name = "mp.jwt.verify.issuer")
    String issuer;

    public String register(String email, String password) {
        if (User.findByEmail(email) != null) {
            throw new WebApplicationException("User already exists", Response.Status.CONFLICT);
        }

        User user = new User();
        user.email = email;
        user.password = BcryptUtil.bcryptHash(password);
        user.role = "USER";
        user.settings = Map.of("theme", "light"); // Default
        user.persist();

        return generateToken(user);
    }

    public String login(String email, String password) {
        User user = User.findByEmail(email);
        if (user == null || !BcryptUtil.matches(password, user.password)) {
            throw new WebApplicationException("Invalid credentials", Response.Status.UNAUTHORIZED);
        }
        return generateToken(user);
    }

    private String generateToken(User user) {
        return Jwt.issuer(issuer)
                .upn(user.email)
                .groups(new HashSet<>(Arrays.asList(user.role)))
                .claim("userId", user.id.toString()) // Store Mongo ID in token
                .expiresIn(3600 * 24) // 24 hours
                .sign();
    }
}

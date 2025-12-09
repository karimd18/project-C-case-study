package com.projectc.resource;

import com.projectc.service.AuthService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/register")
    public AuthResponse register(AuthRequest request) {
        String token = authService.register(request.email, request.password);
        return new AuthResponse(token);
    }

    @POST
    @Path("/login")
    public AuthResponse login(AuthRequest request) {
        String token = authService.login(request.email, request.password);
        return new AuthResponse(token);
    }

    // DTOs
    public record AuthRequest(String email, String password) {
    }

    public record AuthResponse(String token) {
    }
}

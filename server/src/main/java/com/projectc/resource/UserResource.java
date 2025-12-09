package com.projectc.resource;

import com.projectc.model.User;
import io.quarkus.security.Authenticated;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import org.eclipse.microprofile.jwt.JsonWebToken;
import jakarta.inject.Inject;

@Path("/user")
@Authenticated
public class UserResource {

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/me")
    public User me() {
        return User.findByEmail(jwt.getName());
    }
}

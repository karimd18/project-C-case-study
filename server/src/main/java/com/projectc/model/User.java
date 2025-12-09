package com.projectc.model;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import java.util.Map;

@MongoEntity(collection = "users")
public class User extends PanacheMongoEntity {
    public String email;
    public String password; // Hashed
    public String role; // "USER", "ADMIN"
    public Map<String, String> settings; // Theme, etc.

    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }
}

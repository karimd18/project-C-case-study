package com.projectc.model;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import java.time.LocalDateTime;

@MongoEntity(collection = "history")
public class GenerationHistory extends PanacheMongoEntity {

    public String userId; // Link to User
    public String userInput;
    public String jsonOutput;
    public LocalDateTime timestamp;
    public String slideHeader;

    public GenerationHistory() {
    }

    public GenerationHistory(String userId, String userInput, String jsonOutput, String slideHeader) {
        this.userId = userId;
        this.userInput = userInput;
        this.jsonOutput = jsonOutput;
        this.slideHeader = slideHeader;
        this.timestamp = LocalDateTime.now();
    }

    public GenerationHistory(String userInput, String jsonOutput, String slideHeader) {
        this(null, userInput, jsonOutput, slideHeader);
    }
}

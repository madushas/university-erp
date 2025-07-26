package com.university.backend.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.university.backend.entity.Role;

import java.io.IOException;

public class RoleDeserializer extends JsonDeserializer<Role> {
    
    @Override
    public Role deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        if ("FACULTY".equalsIgnoreCase(value)) {
            return Role.INSTRUCTOR;
        }
        return Role.valueOf(value.toUpperCase());
    }
}
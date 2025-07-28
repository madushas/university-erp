package com.university.backend.modules.core.entity;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.university.backend.config.RoleDeserializer;

@JsonDeserialize(using = RoleDeserializer.class)
public enum Role {
    STUDENT, INSTRUCTOR, ADMIN
}
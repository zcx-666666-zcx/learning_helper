package com.zzuli.learning_helper.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "`user`") // user 在某些 DB/工具里敏感，加反引号更保险
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "open_id", length = 64, unique = true)
    private String openId;

    @Column(name = "username", length = 50, unique = true)
    private String username;

    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "nick_name", length = 100)
    private String nickName;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(length = 10)
    private String gender;

    @Column(length = 50)
    private String country;

    @Column(length = 50)
    private String city;

    @Column(length = 50)
    private String province;

    @Column(length = 20)
    private String language;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    // 添加年龄字段
    @Column(name = "age")
    private Integer age;

    // 关联学习会话
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<StudySession> studySessions;

    @PrePersist
    protected void onCreate() {
        this.createTime = LocalDateTime.now();
        this.updateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updateTime = LocalDateTime.now();
    }
}
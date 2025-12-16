package com.zzuli.learning_helper.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "study_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudySession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_study_session_user"))
    @JsonIgnore
    private User user;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "total_duration")
    private Long totalDuration; // 总学习时长(秒)

    @Column(name = "fatigue_duration")
    private Long fatigueDuration; // 学习疲劳时长(秒)

    @Column(name = "poor_posture_duration")
    private Long poorPostureDuration; // 学习姿态不端正时长(秒)

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        this.createTime = LocalDateTime.now();
    }
}
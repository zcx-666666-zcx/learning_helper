package com.zzuli.learning_helper.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_posture")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyPosture {
    public enum PostureType {
        GOOD, POOR, FATIGUE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false, foreignKey = @ForeignKey(name = "fk_study_posture_session"))
    private StudySession session;

    @Enumerated(EnumType.STRING)
    @Column(name = "posture_type", nullable = false)
    private PostureType postureType;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "duration")
    private Long duration; // 持续时间(秒)

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        this.createTime = LocalDateTime.now();
    }
}
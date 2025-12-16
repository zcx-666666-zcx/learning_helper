package com.zzuli.learning_helper.dto;

import lombok.Data;

@Data
public class StudyStatsDTO {
    private Long totalStudySessions;      // 总学习次数
    private Long totalStudyDuration;      // 总学习时长(秒)
    private Long totalPoorPostureDuration; // 学习姿态不端正的时长(秒)
    private Long poorPostureCount;        // 学习姿态不端正的次数
    private Long totalFatigueDuration;    // 学习疲劳的时长(秒)
    private Long fatigueCount;            // 学习疲劳的次数
}
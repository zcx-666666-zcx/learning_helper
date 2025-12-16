package com.zzuli.learning_helper.service;

import com.zzuli.learning_helper.dto.StudyStatsDTO;
import com.zzuli.learning_helper.entity.StudySession;
import com.zzuli.learning_helper.entity.StudyPosture;

import java.util.List;

public interface StudyService {
    /**
     * 创建学习会话
     */
    StudySession createStudySession(Long userId, StudySession session);

    /**
     * 记录学习姿态
     */
    StudyPosture recordPosture(Long sessionId, StudyPosture posture);

    /**
     * 批量记录学习姿态
     */
    List<StudyPosture> recordPostures(Long sessionId, List<StudyPosture> postures);

    /**
     * 获取用户的学习统计数据
     */
    StudyStatsDTO getUserStudyStats(Long userId);

    /**
     * 根据用户名获取用户的学习统计数据
     */
    StudyStatsDTO getUserStudyStatsByUsername(String username);

    /**
     * 获取用户的所有学习会话
     */
    List<StudySession> getUserStudySessions(Long userId);

    /**
     * 获取学习会话的所有姿态记录
     */
    List<StudyPosture> getSessionPostures(Long sessionId);
}
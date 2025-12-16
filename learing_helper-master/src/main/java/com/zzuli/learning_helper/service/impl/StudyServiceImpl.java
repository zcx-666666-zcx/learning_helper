package com.zzuli.learning_helper.service.impl;

import com.zzuli.learning_helper.dao.StudyPostureRepository;
import com.zzuli.learning_helper.dao.StudySessionRepository;
import com.zzuli.learning_helper.dao.UserRepository;
import com.zzuli.learning_helper.dto.StudyStatsDTO;
import com.zzuli.learning_helper.entity.StudySession;
import com.zzuli.learning_helper.entity.StudyPosture;
import com.zzuli.learning_helper.entity.User;
import com.zzuli.learning_helper.service.StudyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyServiceImpl implements StudyService {
    private final StudySessionRepository studySessionRepository;
    private final StudyPostureRepository studyPostureRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public StudySession createStudySession(Long userId, StudySession session) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        session.setUser(user);
        return studySessionRepository.save(session);
    }

    @Override
    @Transactional
    public StudyPosture recordPosture(Long sessionId, StudyPosture posture) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("学习会话不存在"));

        posture.setSession(session);
        return studyPostureRepository.save(posture);
    }

    @Override
    @Transactional
    public List<StudyPosture> recordPostures(Long sessionId, List<StudyPosture> postures) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("学习会话不存在"));

        for (StudyPosture posture : postures) {
            posture.setSession(session);
        }

        return studyPostureRepository.saveAll(postures);
    }

    @Override
    public StudyStatsDTO getUserStudyStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        // 计算总学习时长
        List<StudySession> sessions = studySessionRepository.findByUserId(userId);
        long totalStudyTime = sessions.stream()
                .mapToLong(session -> Duration.between(session.getStartTime(), session.getEndTime()).getSeconds())
                .sum();

        // 计算不良姿态时长
        long totalPoorPostureTime = sessions.stream()
                .mapToLong(StudySession::getPoorPostureDuration)
                .sum();

        // 计算疲劳时长
        long totalFatigueTime = sessions.stream()
                .mapToLong(StudySession::getFatigueDuration)
                .sum();

        // 计算不良姿态次数
        long poorPostureCount = studyPostureRepository.countPoorPostureByUser(user);

        // 计算疲劳次数
        long fatigueCount = studyPostureRepository.countFatigueByUser(user);

        StudyStatsDTO studyStatsDTO = new StudyStatsDTO();
        studyStatsDTO.setTotalStudyDuration(totalStudyTime);
        studyStatsDTO.setTotalPoorPostureDuration(totalPoorPostureTime);
        studyStatsDTO.setPoorPostureCount(poorPostureCount);
        studyStatsDTO.setTotalFatigueDuration(totalFatigueTime);
        studyStatsDTO.setFatigueCount(fatigueCount);
        studyStatsDTO.setTotalStudySessions((long) sessions.size());
        
        // 设置默认值，避免空值
        if (studyStatsDTO.getTotalStudyDuration() == null) {
            studyStatsDTO.setTotalStudyDuration(0L);
        }
        if (studyStatsDTO.getTotalPoorPostureDuration() == null) {
            studyStatsDTO.setTotalPoorPostureDuration(0L);
        }
        if (studyStatsDTO.getPoorPostureCount() == null) {
            studyStatsDTO.setPoorPostureCount(0L);
        }
        if (studyStatsDTO.getTotalFatigueDuration() == null) {
            studyStatsDTO.setTotalFatigueDuration(0L);
        }
        if (studyStatsDTO.getFatigueCount() == null) {
            studyStatsDTO.setFatigueCount(0L);
        }
        if (studyStatsDTO.getTotalStudySessions() == null) {
            studyStatsDTO.setTotalStudySessions(0L);
        }
        
        return studyStatsDTO;
    }

    @Override
    public StudyStatsDTO getUserStudyStatsByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("用户 \"" + username + "\" 不存在"));

        return getUserStudyStats(user.getId());
    }

    @Override
    public List<StudySession> getUserStudySessions(Long userId) {
        return studySessionRepository.findByUserId(userId);
    }

    @Override
    public List<StudyPosture> getSessionPostures(Long sessionId) {
        return studyPostureRepository.findBySessionId(sessionId);
    }
}
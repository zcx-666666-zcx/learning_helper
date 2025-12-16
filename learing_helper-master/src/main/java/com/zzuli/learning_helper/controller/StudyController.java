package com.zzuli.learning_helper.controller;

import com.zzuli.learning_helper.dto.ApiResponse;
import com.zzuli.learning_helper.dto.StudyStatsDTO;
import com.zzuli.learning_helper.entity.StudySession;
import com.zzuli.learning_helper.entity.StudyPosture;
import com.zzuli.learning_helper.service.StudyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study")
@RequiredArgsConstructor
public class StudyController {
    private final StudyService studyService;

    /**
     * 创建学习会话
     */
    @PostMapping("/session")
    public ApiResponse<StudySession> createStudySession(
            @RequestParam Long userId,
            @RequestBody StudySession session) {
        try {
            StudySession createdSession = studyService.createStudySession(userId, session);
            return new ApiResponse<>(true, "创建成功", createdSession);
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    /**
     * 记录学习姿态
     */
    @PostMapping("/posture")
    public ApiResponse<StudyPosture> recordPosture(
            @RequestParam Long sessionId,
            @RequestBody StudyPosture posture) {
        try {
            StudyPosture recordedPosture = studyService.recordPosture(sessionId, posture);
            return new ApiResponse<>(true, "记录成功", recordedPosture);
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    /**
     * 批量记录学习姿态
     */
    @PostMapping("/postures")
    public ApiResponse<List<StudyPosture>> recordPostures(
            @RequestParam Long sessionId,
            @RequestBody List<StudyPosture> postures) {
        try {
            List<StudyPosture> recordedPostures = studyService.recordPostures(sessionId, postures);
            return new ApiResponse<>(true, "记录成功", recordedPostures);
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    /**
     * 获取用户的学习统计数据
     */
    @GetMapping("/stats/{userId}")
    public ApiResponse<StudyStatsDTO> getUserStudyStats(@PathVariable Long userId) {
        try {
            StudyStatsDTO stats = studyService.getUserStudyStats(userId);
            return new ApiResponse<>(true, "获取成功", stats);
        } catch (Exception e) {
            e.printStackTrace(); // 打印错误信息便于调试
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    /**
     * 根据用户名获取用户的学习统计数据
     */
    @GetMapping("/stats/username/{username}")
    public ApiResponse<StudyStatsDTO> getUserStudyStatsByUsername(@PathVariable String username) {
        try {
            StudyStatsDTO stats = studyService.getUserStudyStatsByUsername(username);
            return new ApiResponse<>(true, "获取成功", stats);
        } catch (Exception e) {
            e.printStackTrace(); // 打印错误信息便于调试
            return new ApiResponse<>(false, "用户 \"" + username + "\" 不存在或无学习数据", null);
        }
    }

    /**
     * 获取用户的所有学习会话
     */
    @GetMapping("/sessions/{userId}")
    public ApiResponse<List<StudySession>> getUserStudySessions(@PathVariable Long userId) {
        try {
            List<StudySession> sessions = studyService.getUserStudySessions(userId);
            return new ApiResponse<>(true, "获取成功", sessions);
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    /**
     * 获取学习会话的所有姿态记录
     */
    @GetMapping("/postures/{sessionId}")
    public ApiResponse<List<StudyPosture>> getSessionPostures(@PathVariable Long sessionId) {
        try {
            List<StudyPosture> postures = studyService.getSessionPostures(sessionId);
            return new ApiResponse<>(true, "获取成功", postures);
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
}
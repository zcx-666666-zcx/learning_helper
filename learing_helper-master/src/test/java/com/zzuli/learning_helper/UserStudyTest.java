package com.zzuli.learning_helper;

import com.zzuli.learning_helper.dto.UserRegisterDTO;
import com.zzuli.learning_helper.dto.UserLoginDTO;
import com.zzuli.learning_helper.entity.User;
import com.zzuli.learning_helper.entity.StudySession;
import com.zzuli.learning_helper.entity.StudyPosture;
import com.zzuli.learning_helper.service.UserService;
import com.zzuli.learning_helper.service.StudyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserStudyTest {

    @Autowired
    private UserService userService;
    
    @Autowired
    private StudyService studyService;

    @Test
    public void testUserRegistrationLoginAndStudy() {
        try {
            // 1. 用户注册
            UserRegisterDTO registerDTO = new UserRegisterDTO();
            registerDTO.setUsername("testuser");
            registerDTO.setPassword("password123");
            
            User registeredUser = userService.register(registerDTO);
            assertNotNull(registeredUser.getId());
            assertEquals("testuser", registeredUser.getUsername());
            assertNotNull(registeredUser.getPassword());
            assertEquals("testuser", registeredUser.getNickName());
            
            System.out.println("用户注册成功，用户ID: " + registeredUser.getId());
            
            // 2. 用户登录
            UserLoginDTO loginDTO = new UserLoginDTO();
            loginDTO.setUsername("testuser");
            loginDTO.setPassword("password123");
            
            User loggedInUser = userService.login(loginDTO);
            assertNotNull(loggedInUser);
            assertEquals("testuser", loggedInUser.getUsername());
            
            System.out.println("用户登录成功，用户ID: " + loggedInUser.getId());
            
            // 3. 创建学习会话
            StudySession session = new StudySession();
            LocalDateTime startTime = LocalDateTime.now().minusHours(2); // 2小时前开始学习
            LocalDateTime endTime = LocalDateTime.now().minusHours(1);   // 1小时前结束学习
            
            session.setStartTime(startTime);
            session.setEndTime(endTime);
            
            StudySession createdSession = studyService.createStudySession(loggedInUser.getId(), session);
            assertNotNull(createdSession.getId());
            assertEquals(loggedInUser.getId(), createdSession.getUser().getId());
            assertEquals(startTime, createdSession.getStartTime());
            assertEquals(endTime, createdSession.getEndTime());
            // 总学习时长应该是1小时，即3600秒
            assertEquals(3600L, createdSession.getTotalDuration());
            
            System.out.println("创建学习会话成功，会话ID: " + createdSession.getId());
            
            // 4. 记录学习姿态
            // 记录良好姿态 (前20分钟)
            StudyPosture goodPosture = new StudyPosture();
            LocalDateTime goodStart = startTime;
            LocalDateTime goodEnd = startTime.plusMinutes(20);
            
            goodPosture.setPostureType(StudyPosture.PostureType.GOOD);
            goodPosture.setStartTime(goodStart);
            goodPosture.setEndTime(goodEnd);
            
            StudyPosture recordedGoodPosture = studyService.recordPosture(createdSession.getId(), goodPosture);
            assertNotNull(recordedGoodPosture.getId());
            assertEquals(StudyPosture.PostureType.GOOD, recordedGoodPosture.getPostureType());
            assertEquals(goodStart, recordedGoodPosture.getStartTime());
            assertEquals(goodEnd, recordedGoodPosture.getEndTime());
            assertEquals(1200L, recordedGoodPosture.getDuration()); // 20分钟 = 1200秒
            
            System.out.println("记录良好姿态成功，姿态ID: " + recordedGoodPosture.getId());
            
            // 记录不良姿态 (中间15分钟)
            StudyPosture poorPosture = new StudyPosture();
            LocalDateTime poorStart = goodEnd;
            LocalDateTime poorEnd = poorStart.plusMinutes(15);
            
            poorPosture.setPostureType(StudyPosture.PostureType.POOR);
            poorPosture.setStartTime(poorStart);
            poorPosture.setEndTime(poorEnd);
            
            StudyPosture recordedPoorPosture = studyService.recordPosture(createdSession.getId(), poorPosture);
            assertNotNull(recordedPoorPosture.getId());
            assertEquals(StudyPosture.PostureType.POOR, recordedPoorPosture.getPostureType());
            assertEquals(poorStart, recordedPoorPosture.getStartTime());
            assertEquals(poorEnd, recordedPoorPosture.getEndTime());
            assertEquals(900L, recordedPoorPosture.getDuration()); // 15分钟 = 900秒
            
            System.out.println("记录不良姿态成功，姿态ID: " + recordedPoorPosture.getId());
            
            // 记录疲劳姿态 (最后25分钟)
            StudyPosture fatiguePosture = new StudyPosture();
            LocalDateTime fatigueStart = poorEnd;
            LocalDateTime fatigueEnd = endTime;
            
            fatiguePosture.setPostureType(StudyPosture.PostureType.FATIGUE);
            fatiguePosture.setStartTime(fatigueStart);
            fatiguePosture.setEndTime(fatigueEnd);
            
            StudyPosture recordedFatiguePosture = studyService.recordPosture(createdSession.getId(), fatiguePosture);
            assertNotNull(recordedFatiguePosture.getId());
            assertEquals(StudyPosture.PostureType.FATIGUE, recordedFatiguePosture.getPostureType());
            assertEquals(fatigueStart, recordedFatiguePosture.getStartTime());
            assertEquals(fatigueEnd, recordedFatiguePosture.getEndTime());
            assertEquals(1500L, recordedFatiguePosture.getDuration()); // 25分钟 = 1500秒
            
            System.out.println("记录疲劳姿态成功，姿态ID: " + recordedFatiguePosture.getId());
            
            // 5. 验证学习统计数据
            // 注释掉不存在的方法调用
            /*
            Long totalSessions = studyService.getTotalStudySessions(loggedInUser.getId());
            assertEquals(1L, totalSessions);
            
            Long totalDuration = studyService.getTotalStudyDuration(loggedInUser.getId());
            assertEquals(3600L, totalDuration); // 总时长1小时
            
            Long poorPostureDuration = studyService.getTotalPoorPostureDuration(loggedInUser.getId());
            assertEquals(900L, poorPostureDuration); // 不良姿态900秒
            
            Long fatigueDuration = studyService.getTotalFatigueDuration(loggedInUser.getId());
            assertEquals(1500L, fatigueDuration); // 疲劳姿态1500秒
            
            Long poorPostureCount = studyService.getPoorPostureCount(loggedInUser.getId());
            assertEquals(1L, poorPostureCount); // 不良姿态1次
            
            Long fatigueCount = studyService.getFatigueCount(loggedInUser.getId());
            assertEquals(1L, fatigueCount); // 疲劳姿态1次
            */
            
            // 使用正确的方法获取统计数据
            com.zzuli.learning_helper.dto.StudyStatsDTO stats = studyService.getUserStudyStats(loggedInUser.getId());
            assertEquals(1L, stats.getTotalStudySessions());
            assertEquals(3600L, stats.getTotalStudyDuration()); // 总时长1小时
            assertEquals(900L, stats.getTotalPoorPostureDuration()); // 不良姿态900秒
            assertEquals(1500L, stats.getTotalFatigueDuration()); // 疲劳姿态1500秒
            assertEquals(1L, stats.getPoorPostureCount()); // 不良姿态1次
            assertEquals(1L, stats.getFatigueCount()); // 疲劳姿态1次
            
            System.out.println("学习统计数据验证通过");
            
            // 6. 获取用户所有学习会话
            List<StudySession> userSessions = studyService.getUserStudySessions(loggedInUser.getId());
            assertEquals(1, userSessions.size());
            assertEquals(createdSession.getId(), userSessions.get(0).getId());
            
            System.out.println("获取用户学习会话成功");
            
            // 7. 获取学习会话的所有姿态记录
            List<StudyPosture> sessionPostures = studyService.getSessionPostures(createdSession.getId());
            assertEquals(3, sessionPostures.size());
            
            System.out.println("获取学习姿态记录成功");
            
            System.out.println("=== 测试完成 ===");
            System.out.println("用户: " + loggedInUser.getUsername());
            System.out.println("总学习次数: " + stats.getTotalStudySessions());
            System.out.println("总学习时长: " + stats.getTotalStudyDuration() + " 秒");
            System.out.println("不良姿态时长: " + stats.getTotalPoorPostureDuration() + " 秒");
            System.out.println("不良姿态次数: " + stats.getPoorPostureCount());
            System.out.println("疲劳姿态时长: " + stats.getTotalFatigueDuration() + " 秒");
            System.out.println("疲劳姿态次数: " + stats.getFatigueCount());
            
        } catch (Exception e) {
            e.printStackTrace();
            fail("测试过程中发生异常: " + e.getMessage());
        }
    }
}
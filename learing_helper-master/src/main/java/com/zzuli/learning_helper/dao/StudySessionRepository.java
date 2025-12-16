package com.zzuli.learning_helper.dao;

import com.zzuli.learning_helper.entity.StudySession;
import com.zzuli.learning_helper.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByUser(User user);
    
    @Query("SELECT COUNT(s) FROM StudySession s WHERE s.user = ?1")
    Long countByUser(User user);
    
    @Query("SELECT COALESCE(SUM(s.totalDuration), 0) FROM StudySession s WHERE s.user = ?1")
    Long sumTotalDurationByUser(User user);
    
    @Query("SELECT COALESCE(SUM(s.poorPostureDuration), 0) FROM StudySession s WHERE s.user = ?1")
    Long sumPoorPostureDurationByUser(User user);
    
    @Query("SELECT COALESCE(SUM(s.fatigueDuration), 0) FROM StudySession s WHERE s.user = ?1")
    Long sumFatigueDurationByUser(User user);
    
    List<StudySession> findByUserId(Long userId);
}
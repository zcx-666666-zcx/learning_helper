package com.zzuli.learning_helper.dao;

import com.zzuli.learning_helper.entity.StudyPosture;
import com.zzuli.learning_helper.entity.StudySession;
import com.zzuli.learning_helper.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StudyPostureRepository extends JpaRepository<StudyPosture, Long> {
    List<StudyPosture> findBySession(StudySession session);
    
    @Query("SELECT COUNT(p) FROM StudyPosture p WHERE p.session IN (SELECT s FROM StudySession s WHERE s.user = ?1) AND p.postureType = 'POOR'")
    Long countPoorPostureByUser(User user);
    
    @Query("SELECT COUNT(p) FROM StudyPosture p WHERE p.session IN (SELECT s FROM StudySession s WHERE s.user = ?1) AND p.postureType = 'FATIGUE'")
    Long countFatigueByUser(User user);
    
    List<StudyPosture> findBySessionId(Long sessionId);
}
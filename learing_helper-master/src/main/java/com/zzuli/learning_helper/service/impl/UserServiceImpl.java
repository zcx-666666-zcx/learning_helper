package com.zzuli.learning_helper.service.impl;

import com.zzuli.learning_helper.dao.UserRepository;
import com.zzuli.learning_helper.dto.UserLoginDTO;
import com.zzuli.learning_helper.dto.UserRegisterDTO;
import com.zzuli.learning_helper.entity.User;
import com.zzuli.learning_helper.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User register(UserRegisterDTO dto) throws Exception {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("用户名已存在");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setNickName(dto.getUsername());
        // 添加额外字段
        user.setProvince(dto.getProvince());
        user.setCity(dto.getCity());
        user.setAge(dto.getAge());
        
        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            // 可能并发导致唯一性冲突
            throw new IllegalArgumentException("用户名已存在（或违反唯一性约束）");
        }
    }

    @Override
    public User login(UserLoginDTO dto) throws Exception {
        // 根据用户名查找用户
        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        // 验证密码
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("密码错误");
        }

        return user;
    }
    
    @Override
    public User getUserById(Long id) throws Exception {
        return userRepository.findById(id).orElse(null);
    }
    
    @Override
    public User getUserByUsername(String username) throws Exception {
        return userRepository.findByUsername(username).orElse(null);
    }
}
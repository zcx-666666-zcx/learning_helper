package com.zzuli.learning_helper.service;

import com.zzuli.learning_helper.dto.UserLoginDTO;
import com.zzuli.learning_helper.dto.UserRegisterDTO;
import com.zzuli.learning_helper.entity.User;

public interface UserService {
    User register(UserRegisterDTO dto) throws Exception;
    User login(UserLoginDTO dto) throws Exception;
    User getUserById(Long id) throws Exception;
    User getUserByUsername(String username) throws Exception;
}
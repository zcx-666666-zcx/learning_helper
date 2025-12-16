package com.zzuli.learning_helper.controller;

import com.zzuli.learning_helper.dto.ApiResponse;
import com.zzuli.learning_helper.dto.UserLoginDTO;
import com.zzuli.learning_helper.dto.UserRegisterDTO;
import com.zzuli.learning_helper.entity.User;
import com.zzuli.learning_helper.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public ApiResponse<?> register(@Valid @RequestBody UserRegisterDTO dto) {
        try {
            User saved = userService.register(dto);
            // 返回格式与小程序前端期望一致（{ success: true/false, message: '', data: ... }）
            return new ApiResponse<>(true, "注册成功", null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>(false, e.getMessage(), null);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, "服务器错误", null);
        }
    }

    @PostMapping("/login")
    public ApiResponse<?> login(@Valid @RequestBody UserLoginDTO dto) {
        try {
            User user = userService.login(dto);
            // 登录成功，返回用户信息
            return new ApiResponse<>(true, "登录成功", user);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>(false, e.getMessage(), null);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, "服务器错误", null);
        }
    }
    
    // 根据用户ID获取用户信息
    @GetMapping("/{id}")
    public ApiResponse<User> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            if (user != null) {
                return new ApiResponse<>(true, "获取用户信息成功", user);
            } else {
                return new ApiResponse<>(false, "用户不存在", null);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, "服务器错误", null);
        }
    }
    
    // 根据用户名获取用户信息
    @GetMapping("/username/{username}")
    public ApiResponse<User> getUserByUsername(@PathVariable String username) {
        try {
            User user = userService.getUserByUsername(username);
            if (user != null) {
                return new ApiResponse<>(true, "获取用户信息成功", user);
            } else {
                return new ApiResponse<>(false, "用户不存在", null);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, "服务器错误", null);
        }
    }
}
package com.zzuli.learning_helper.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegisterDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度应为3~50")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 100, message = "密码长度至少6位")
    private String password;
    
    @Size(max = 50, message = "省份长度不能超过50")
    private String province;
    
    @Size(max = 50, message = "城市长度不能超过50")
    private String city;
    
    @NotNull(message = "年龄不能为空")
    private Integer age;
}
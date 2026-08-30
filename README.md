# Learning Helper — AI 学习助手

面向学习场景的 AI 陪伴/监督应用，包含**微信小程序端**与 **Spring Boot 后端**两部分：小程序提供登录注册、学习会话、坐姿记录上传、学习统计与 AI 助手对话；后端负责用户、学习会话、坐姿数据的管理与统计分析，并集成 AI 模型能力。

## 功能特性

- **用户体系**：注册、登录（`UserController`）
- **学习会话**：创建学习会话、查询会话列表（`/api/study/session`）
- **坐姿记录**：单条/批量上报学习时的坐姿数据，按会话查询（`/api/study/posture`、`/api/study/postures`）
- **学习统计**：按用户 ID 或用户名查询学习统计数据（`/api/study/stats/...`）
- **AI 对话**：小程序端「agent」页接入 [Coze API](https://api.coze.cn) 实现智能问答；后端通过 Spring AI 集成 Ollama 本地模型

## 目录结构

| 目录 | 内容 |
|------|------|
| `learing_helper-master/` | Spring Boot 后端（`com.zzuli.learning_helper`，Maven 工程） |
| `wechatmini1216/` | 微信小程序（原生开发） |

## 技术栈

- 后端：Spring Boot 3.4.3 · Java 17 · Spring AI 1.0.2（Ollama）
- 小程序：微信小程序原生框架，页面包括 `login`、`registion`、`index`、`learn`、`upl`（上传）、`user`、`userDATA`、`log`、`info`、`agent`（AI 对话）、`userprofile`

## 后端启动

```bash
cd learing_helper-master
./mvnw spring-boot:run
```

数据库等配置见 `src/main/resources/application.properties`。

## 主要接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/study/session` | 创建学习会话 |
| POST | `/api/study/posture` | 记录单条坐姿数据 |
| POST | `/api/study/postures` | 批量记录坐姿数据 |
| GET | `/api/study/stats/{userId}` | 按用户 ID 查询学习统计 |
| GET | `/api/study/stats/username/{username}` | 按用户名查询学习统计 |
| GET | `/api/study/sessions/{userId}` | 查询用户学习会话列表 |
| GET | `/api/study/postures/{sessionId}` | 按会话查询坐姿记录 |

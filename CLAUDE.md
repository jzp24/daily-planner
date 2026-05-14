# CLAUDE.md — 日程本项目工作指引

## 项目简介

这是一个本地日程管理 Web 应用，纯前端、localStorage 存储。用户是非技术背景，沟通过程中避免使用代码术语，用自然语言说明变更内容。

## 标准文件路径

| 文档 | 路径 | 说明 |
|------|------|------|
| 需求文档 | [docs/requirements.md](docs/requirements.md) | 功能和非功能需求 |
| 技术规范 | [docs/tech-spec.md](docs/tech-spec.md) | 技术栈、目录结构、编码规范 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | 颜色、字体、间距、组件样式 |
| 数据模型 | [docs/data-model.md](docs/data-model.md) | TypeScript 类型定义、存储结构 |
| 执行计划 | [docs/implementation-plan.md](docs/implementation-plan.md) | 分步实施步骤 |
| 开发日志 | [dev-logs/](dev-logs/) | 每日开发记录 |

## 工作流程

1. **每次开始工作前**：阅读 [docs/implementation-plan.md](docs/implementation-plan.md) 确认当前进度和下一步任务
2. **执行开发**：按执行计划中的步骤逐项完成，每步只做一个功能模块
3. **完成后验证**：`npm run dev` 启动项目，在浏览器确认功能正常
4. **更新日志**：在 `dev-logs/YYYY-MM-DD.md` 记录当天的完成事项和待办事项
5. **更新计划**：将执行计划中已完成的项勾选

## 核心规则

- **分步推进**：严格按照执行计划，一次只做一步，不跳跃
- **保持可运行**：每一步结束时项目必须能成功启动和运行
- **先基础设施后功能**：类型定义 → 数据层 → 基础框架 → 页面功能
- **UI 优先移动端**：所有页面先在手机宽度（375px）下验证，再适配桌面端
- **数据安全**：删除操作必须有确认弹窗，避免误删
- **不引入外部 UI 库**：所有组件手写 CSS，保持轻量

## 沟通规范

- 面向非技术用户，用"添加了按钮""修改了颜色"而非"添加了 onClick handler"
- 每步完成后用一句话总结变更，不超过 50 字
- 不要主动提代码细节，除非用户问了

## 技术要点速查

```bash
npm run dev    # 启动开发服务器
npm run build  # 构建生产版本
```

- 端口默认 5173，被占用则自动换端口
- 所有数据以 `planner_data` 为 key 存在 localStorage
- 日期统一用 `YYYY-MM-DD` 字符串格式
- 时间统一用 `HH:mm` 字符串格式

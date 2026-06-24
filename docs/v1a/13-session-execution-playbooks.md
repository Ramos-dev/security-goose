# Security Goose Session 执行 Playbook

## 文档目的

这份文档不是再解释“为什么这样拆”，而是把并行 session 直接扩成可执行方案。

适用场景：

- 你准备开多个 Codex / agent session 并行推进 `security-goose`
- 你希望每个 session 都有明确边界、分支、阶段目标、验收命令和交接格式
- 你希望把“goal 提示词”升级成“可实际执行 1 到 3 天的工作包”

配套文档：

- [12-current-state-and-parallel-goals.md](./12-current-state-and-parallel-goals.md)
- [06-development-sequence.md](./06-development-sequence.md)
- [11-bootstrap-audit.md](./11-bootstrap-audit.md)
- [07-testing-ci-cd.md](./07-testing-ci-cd.md)

---

## 总体使用方式

## 推荐开法

第一波并行：

1. Session 0：集成守门
2. Session 1：本地安全网关扩展
3. Session 2：signed release 演练
4. Session 3：任务入口与 runtime 体验
5. Session 4：skills / recipes 内容资产

第二波：

6. Session 5：模型 / 网关 Phase 6 预留

## 每个 session 的统一要求

- 开工前先读：
  - `AGENTS.md`
  - `docs/v1a/12-current-state-and-parallel-goals.md`
  - 自己 session 指定的必读文件
- 优先复用 Goose 现有机制：
  - config
  - recipe
  - skill
  - MCP extension
  - desktop 薄 UI 映射
- 不新增并行：
  - agent runtime
  - memory system
  - task engine
  - extension loader
- 除非必要，不碰这些共享文件：
  - `ui/desktop/src/main.ts`
  - `ui/desktop/package.json`
  - `ui/desktop/src/security/taskCatalog.ts`
  - `ui/desktop/src/securityRuntimeBootstrap.ts`
  - `ui/desktop/src/securityBackendConfig.ts`
  - `.github/workflows/bundle-desktop*.yml`

## 每个 session 的统一交付物

至少交付：

- 代码改动
- 测试或 smoke
- 文档更新
- 一段 handoff 总结

handoff 统一模板：

```text
本 session 完成：
- ...

主要改动文件：
- ...

已验证：
- 命令：
- 结果：

未完成 / blocker：
- ...

建议下一个 session 接手：
- ...
```

---

## Session 0

## 名称

集成守门 / Shared-file Owner

## 推荐分支

- `codex/v1a-integration-gatekeeper`

## 角色定位

这是唯一一个不以“做 feature”为主要目标的 session。

它负责：

- 划定并行边界
- 维护共享文件 owner
- 审核其他 session 是否越界
- 整合最后的 shared-file 修改
- 提供全局验收命令

## 必读文件

- `docs/v1a/12-current-state-and-parallel-goals.md`
- `docs/v1a/11-bootstrap-audit.md`
- `docs/v1a/07-testing-ci-cd.md`
- `AGENTS.md`
- `Justfile`
- `ui/desktop/package.json`

## 开工 prompt

```text
目标：
你是 security-goose V1a 收口阶段的集成守门 session。你的职责不是实现单一 feature，而是控制并行 session 的边界、共享文件 owner、集成顺序和全局回归风险。

上下文：
- 仓库是成熟 Goose 主产品 + V1a 安全发行定制
- 当前重点是收口，不是重造平台
- 高冲突共享文件必须尽量由你统一维护

必读文件：
- AGENTS.md
- docs/v1a/12-current-state-and-parallel-goals.md
- docs/v1a/11-bootstrap-audit.md
- docs/v1a/07-testing-ci-cd.md
- Justfile
- ui/desktop/package.json

你的任务：
1. 审核当前高冲突共享文件并建立 owner 表。
2. 给出所有 worker session 的目录边界、禁止修改文件、合并顺序。
3. 输出统一回归命令和全局验收标准。
4. 如需改共享文件，只做最小整合改动。

约束：
- 不承接 AiseeSec/live gateway feature
- 不承接大规模内容资产改写
- 不做视觉重构

输出：
- ownership 表
- merge order
- 每个 session 风险点
- 全局验收命令
```

## 执行节奏

### 阶段 0：盘点

- 检查工作树和当前分支状态
- 检查 `12-current-state-and-parallel-goals.md` 中列出的高冲突文件
- 输出一版 owner 表

### 阶段 1：收口规则

- 为 Session 1-5 指定：
  - 可改目录
  - 禁改共享文件
  - 需要你代改的共享文件
- 制定 merge 顺序

### 阶段 2：集成验收

- 产出最终统一验收命令：
  - `node scripts/sync-security-runtime-assets.mjs`
  - `node scripts/smoke-security-extensions.mjs`
  - `./scripts/check-security-v1a.sh`
  - 必要时补 packaged smoke 或 release preflight

## 验收

- 有可执行 owner 表
- 有可执行 merge order
- 有统一全局回归命令

## 典型 blocker

- 多个 session 同时改 `taskCatalog.ts`
- workflow 改动互相覆盖
- 扩展状态和 UI 文案表达不一致

---

## Session 1

## 名称

本地安全网关扩展落地

## 推荐分支

- `codex/v1a-local-security-gateway`

## 角色定位

把 `local-security-gateway-mcp` 从 disabled stub 变成真实本地工具桥。

## 必读文件

- `distro/security-cn/README.md`
- `distro/security-cn/extensions/README.md`
- `distro/security-cn/extensions/local-security-gateway-mcp/README.md`
- `distro/security-cn/extensions/local-security-gateway-mcp/server.mjs`
- `distro/security-cn/extensions/_shared/mcp-stdio.mjs`
- `scripts/smoke-security-extensions.mjs`
- `scripts/validate-security-distro.mjs`
- `ui/desktop/src/security/extensionCatalog.ts`
- `docs/v1a/12-current-state-and-parallel-goals.md`

## 开工 prompt

```text
目标：
把 `distro/security-cn/extensions/local-security-gateway-mcp/` 从 disabled stub 实现成可在本地预览链路启用的真实 MCP 扩展。

上下文：
- 当前 V1a 的关键短板不是 UI，而是 live integration
- 这条线必须走 Goose 现有 extension/MCP/runtime 路径
- 不允许为这个 feature 新造并行平台层

必读文件：
- AGENTS.md
- docs/v1a/12-current-state-and-parallel-goals.md
- distro/security-cn/README.md
- distro/security-cn/extensions/README.md
- distro/security-cn/extensions/local-security-gateway-mcp/README.md
- distro/security-cn/extensions/local-security-gateway-mcp/server.mjs
- distro/security-cn/extensions/_shared/mcp-stdio.mjs
- scripts/smoke-security-extensions.mjs
- scripts/validate-security-distro.mjs
- ui/desktop/src/security/extensionCatalog.ts

任务：
1. 先确认 stub 的真实阻塞点。
2. 设计最小 live path，至少支持 1 个真实查询动作。
3. 通过现有 MCP helper 实现 server。
4. 更新 smoke、校验和文档。
5. 如果需要改桌面状态表达，只做最小改动。

约束：
- 不改 Goose core 协议
- 不改 main.ts / package.json
- 必须补 smoke 或测试
- 必须明确配置方式、失败边界、无凭证行为

输出：
- root cause
- live path 说明
- 修改文件
- 验证步骤
```

## 执行节奏

### 阶段 0：问题定界

- 查清 stub 是缺：
  - endpoint
  - auth
  - schema
  - 本地依赖
- 明确“最小 live integration”定义

### 阶段 1：最小实现

- 选 1 到 2 个动作实现
- 写清输入输出 schema
- 实现错误边界
- 保持 repo preview 可跑

### 阶段 2：验证与文档

- 更新 `smoke-security-extensions.mjs`
- 更新 `validate-security-distro.mjs`
- 更新 `capability-catalog.md` / README

## 建议验收命令

```bash
node scripts/sync-security-runtime-assets.mjs
node scripts/smoke-security-extensions.mjs
node scripts/validate-security-distro.mjs
```

## 交付标准

- 扩展能在桌面中启用
- 有至少 1 条真实调用链路
- smoke 能覆盖
- 文档说明配置和失败边界

## 典型 blocker

- 需要外部凭证但没有 mock / fallback
- server 可以启动但 schema 不稳定
- smoke 只测握手，没测真实动作

---

## Session 2

## 名称

Signed Release 演练收口

## 推荐分支

- `codex/v1a-signed-release-rehearsal`

## 角色定位

把 macOS signed/notarized 路径从“脚本存在”推进到“真实可复核演练”。

## 必读文件

- `docs/v1a/11-bootstrap-audit.md`
- `docs/v1a/07-testing-ci-cd.md`
- `distro/security-cn/docs/signed-release-runbook.md`
- `distro/security-cn/docs/signed-release-handoff-panel.md`
- `scripts/check-security-apple-signing-env.mjs`
- `scripts/check-security-macos-bundle.sh`
- `scripts/render-security-macos-release-evidence.mjs`
- `scripts/run-security-packaged-smoke.sh`
- `.github/workflows/bundle-desktop.yml`
- `.github/workflows/bundle-desktop-intel.yml`
- `.github/workflows/bundle-desktop-manual.yml`

## 开工 prompt

```text
目标：
把 Security Goose 的 macOS signed/notarized 流程从“已有脚本骨架”推进到“真实环境下可复核演练”。

上下文：
- local-preview / packaged-preview 已经比较完整
- 当前最大风险在 Apple secrets、codesign、notarization、证据输出
- 这条 session 不做业务功能

必读文件：
- AGENTS.md
- docs/v1a/11-bootstrap-audit.md
- docs/v1a/07-testing-ci-cd.md
- distro/security-cn/docs/signed-release-runbook.md
- distro/security-cn/docs/signed-release-handoff-panel.md
- scripts/check-security-apple-signing-env.mjs
- scripts/check-security-macos-bundle.sh
- scripts/render-security-macos-release-evidence.mjs
- scripts/run-security-packaged-smoke.sh
- .github/workflows/bundle-desktop.yml
- .github/workflows/bundle-desktop-intel.yml
- .github/workflows/bundle-desktop-manual.yml

任务：
1. 审计 repo preview / packaged preview / signed release 三条链路边界。
2. 找出 signed rehearsal 尚未闭环的最小缺口。
3. 修正 workflow、script、文档和证据输出。
4. 若环境允许，完成一次真实演练；若不允许，明确 blocker 分类。

约束：
- 不改业务功能
- 不改任务 UI
- 清晰区分 local-preview、packaged-preview、signed

输出：
- blocker 分类
- 修复后的 release 链路
- 真实演练结果或明确外部阻塞
- release checklist
```

## 执行节奏

### 阶段 0：链路审计

- 画清楚三条路径：
  - repo preview
  - packaged local preview
  - signed release
- 标出当前真正依赖 Apple 环境的步骤

### 阶段 1：证据链闭环

- 补齐：
  - preflight
  - bundle check
  - notarization evidence
  - summary artifact

### 阶段 2：演练与 runbook

- 若有环境，跑一次真实 rehearsal
- 若无环境，保证失败时明确归因为 Apple blocker
- 收口 runbook

## 建议验收命令

```bash
node scripts/check-security-apple-signing-env.mjs --require-signed
./scripts/check-security-macos-bundle.sh --arch arm64 --expect signed --require-notarized
./scripts/run-security-packaged-smoke.sh
```

## 交付标准

- 失败点能分清是 Apple 环境还是代码链路
- 有完整证据输出
- 文档可独立指导操作

## 典型 blocker

- Apple secrets 缺失
- notarization 失败但原因没沉淀
- local-preview 和 signed 边界混淆

---

## Session 3

## 名称

安全任务入口与 Runtime 体验收口

## 推荐分支

- `codex/v1a-task-runtime-experience`

## 角色定位

收口 launcher / recipes / runtime diagnostics，让任务状态能被普通用户理解。

## 必读文件

- `ui/desktop/src/components/LauncherView.tsx`
- `ui/desktop/src/components/recipes/RecipesView.tsx`
- `ui/desktop/src/components/security/SecurityRuntimeNotice.tsx`
- `ui/desktop/src/components/security/SecurityExtensionHints.tsx`
- `ui/desktop/src/components/security/SecurityPreviewLaunchGuard.tsx`
- `ui/desktop/src/security/taskCatalog.ts`
- `ui/desktop/src/security/taskMessages.ts`
- `ui/desktop/src/securityRuntimeBootstrap.ts`
- `ui/desktop/src/securityRuntimeDiagnostics.ts`
- `ui/desktop/src/components/LauncherView.test.tsx`
- `ui/desktop/src/components/recipes/RecipesView.test.tsx`

## 开工 prompt

```text
目标：
收口安全任务入口、runtime diagnostics 和 fallback 体验，让用户清楚知道当前任务到底走的是 recipe、skill 还是 preview fallback。

上下文：
- 当前已有 6 个安全任务定义
- 已有 runtime asset bootstrap 和 diagnostics
- 当前主要问题是产品表达偏工程视角

必读文件：
- AGENTS.md
- docs/v1a/12-current-state-and-parallel-goals.md
- ui/desktop/src/components/LauncherView.tsx
- ui/desktop/src/components/recipes/RecipesView.tsx
- ui/desktop/src/components/security/SecurityRuntimeNotice.tsx
- ui/desktop/src/components/security/SecurityExtensionHints.tsx
- ui/desktop/src/components/security/SecurityPreviewLaunchGuard.tsx
- ui/desktop/src/security/taskCatalog.ts
- ui/desktop/src/security/taskMessages.ts
- ui/desktop/src/securityRuntimeBootstrap.ts
- ui/desktop/src/securityRuntimeDiagnostics.ts
- ui/desktop/src/components/LauncherView.test.tsx
- ui/desktop/src/components/recipes/RecipesView.test.tsx

任务：
1. 梳理 6 个任务的真实运行路径和状态机。
2. 找出用户最困惑的状态表达点。
3. 优化 badge、hint、fallback、diagnostics 呈现。
4. 补组件测试。

约束：
- 不新增并行任务编排层
- 保持 recipe 优先、prompt fallback
- 不改 MCP server 实现

输出：
- 现状痛点
- 设计决策
- 改动文件
- 测试结果
```

## 执行节奏

### 阶段 0：状态机梳理

- 列出每个任务的：
  - recipe available
  - recipe missing
  - extension recommended
  - runtime drift/missing

### 阶段 1：产品表达收口

- 改 badge
- 改 hint
- 改 fallback 文案
- 改 diagnostics 可操作提示

### 阶段 2：测试与回归

- 补 `LauncherView` / `RecipesView` / security components 测试
- 保证 runtime 缺失与 fallback 状态都能断言

## 建议验收命令

```bash
pnpm --dir ui/desktop exec vitest run \
  src/components/LauncherView.test.tsx \
  src/components/recipes/RecipesView.test.tsx \
  src/security/taskCatalog.test.ts \
  src/securityRuntimeBootstrap.test.ts
pnpm --dir ui/desktop exec tsc --noEmit
```

## 交付标准

- 状态 badge 和提示可被非工程用户理解
- fallback 逻辑表达一致
- 测试覆盖关键状态分支

## 典型 blocker

- `taskCatalog.ts` 与共享文件冲突
- 文案变化与 extension catalog 状态不一致
- diagnostics 正确但不够可操作

---

## Session 4

## 名称

Skills / Recipes 内容资产强化

## 推荐分支

- `codex/v1a-content-assets`

## 角色定位

把现有技能、配方、提示词打磨成正式可交付的安全分析内容资产。

## 必读文件

- `distro/security-cn/skills/README.md`
- `distro/security-cn/recipes/README.md`
- `distro/security-cn/docs/capability-catalog.md`
- `distro/security-cn/docs/operator-guide.md`
- `distro/security-cn/skills/*/SKILL.md`
- `distro/security-cn/recipes/*.yaml.example`
- `ui/desktop/src/security/taskCatalog.ts`
- `scripts/validate-security-distro.mjs`

## 开工 prompt

```text
目标：
继续把 `distro/security-cn/skills/**` 和 `distro/security-cn/recipes/**` 打磨成可直接交付给安全团队使用的内容资产。

上下文：
- 当前数量已经够用
- 当前问题不是“有没有”，而是“是否稳定、统一、专业”
- 这条 session 优先做内容质量、一致性和样例

必读文件：
- AGENTS.md
- docs/v1a/12-current-state-and-parallel-goals.md
- distro/security-cn/skills/README.md
- distro/security-cn/recipes/README.md
- distro/security-cn/docs/capability-catalog.md
- distro/security-cn/docs/operator-guide.md
- 所有 distro/security-cn/skills/*/SKILL.md
- 所有 distro/security-cn/recipes/*.yaml.example
- ui/desktop/src/security/taskCatalog.ts
- scripts/validate-security-distro.mjs

任务：
1. 审核 6 个任务对应 skill/recipe 是否一致。
2. 统一输出模板、边界、待确认项、后续动作。
3. 补真实使用样例。
4. 必要时增强 validate 脚本的内容一致性检查。

约束：
- 以内容和方法论为主，不做 core patch
- 尽量不改 desktop shared files

输出：
- 内容不一致点
- 统一模板规则
- 新增样例
- 剩余内容债务
```

## 执行节奏

### 阶段 0：内容审计

- 对齐 skill 和 recipe 的：
  - 输出结构
  - 风险边界
  - 待确认项
  - 后续动作
  - 中英一致性

### 阶段 1：模板统一

- 抽出统一规范
- 改写不一致项
- 补样例

### 阶段 2：校验增强

- 用 `validate-security-distro.mjs` 固化关键约束
- 更新 operator guide / capability catalog

## 建议验收命令

```bash
node scripts/sync-security-runtime-assets.mjs
node scripts/validate-security-distro.mjs
git diff --check
```

## 交付标准

- 每个 skill / recipe 更像正式安全产出模板
- 中英结构一致
- 文档能指导真实使用

## 典型 blocker

- 内容风格统一后，taskCatalog 文案映射跟不上
- 样例过于抽象，不足以指导真实分析
- 校验脚本约束不够精确

---

## Session 5

## 名称

模型 / 网关 Phase 6 预留层

## 推荐分支

- `codex/v1a-phase6-boundary`

## 角色定位

只做下一阶段的接入边界预留，不做完整网关平台。

## 必读文件

- `docs/v1a/03-gateway-model-routing.md`
- `docs/v1a/02-v1-architecture.md`
- `docs/v1a/12-current-state-and-parallel-goals.md`
- `distro/security-cn/config/model-catalog.json`
- `distro/security-cn/config/provider-defaults.yaml`
- `distro/security-cn/config/desktop-env.example`
- `ui/desktop/src/securityBackendConfig.ts`
- `ui/desktop/src/branding/distro.ts`
- `crates/goose/src/model.rs`
- `ui/desktop/src/components/settings/models/predefinedModelsUtils.ts`

## 开工 prompt

```text
目标：
为 Phase 6 的模型/网关/套餐/配额/usage 记录留出干净接入边界，但不提前做完整平台。

上下文：
- 当前 V1a 应继续优先走 Goose 原生 provider/model/config
- 不能因为预研网关，把当前分支拉回平台化大改
- 这条 session 以架构预留 + 最小验证为主

必读文件：
- AGENTS.md
- docs/v1a/03-gateway-model-routing.md
- docs/v1a/02-v1-architecture.md
- docs/v1a/12-current-state-and-parallel-goals.md
- distro/security-cn/config/model-catalog.json
- distro/security-cn/config/provider-defaults.yaml
- distro/security-cn/config/desktop-env.example
- ui/desktop/src/securityBackendConfig.ts
- ui/desktop/src/branding/distro.ts
- crates/goose/src/model.rs
- ui/desktop/src/components/settings/models/predefinedModelsUtils.ts

任务：
1. 梳理当前模型选择链路。
2. 明确 auth/quota/usage 的未来插入点。
3. 如果要改代码，只做最薄配置边界或类型预留。
4. 输出一份 Phase 6 边界说明。

约束：
- 不上线完整网关
- 不改现有任务 UI
- 不做 Apple signing
- 不新增并行 runtime

输出：
- 当前链路图
- 将来接入点
- 最小预留改动
- 哪些工作必须推迟到 V1.5+
```

## 执行节奏

### 阶段 0：现状建模

- 梳理模型来源：
  - distro config
  - desktop env
  - predefined models
  - provider defaults

### 阶段 1：边界预留

- 设计：
  - auth hook
  - quota hook
  - usage event hook
  - model availability policy hook

### 阶段 2：最小实现或文档化

- 若确实需要代码改动，只做：
  - config 接口
  - 类型
  - 文档化边界

## 建议验收命令

```bash
pnpm --dir ui/desktop exec vitest run src/components/settings/models/predefinedModelsUtils.test.ts
pnpm --dir ui/desktop exec tsc --noEmit
```

## 交付标准

- 能清楚回答 auth/quota/usage 将来插在哪
- 不破坏当前 Goose-native 模型切换路径
- 不把 Phase 6 偷偷做成平台重构

## 典型 blocker

- 方案太大，超出 V1a 边界
- 为了预留而过度抽象
- 改动共享文件导致和 Session 0/3 冲突

---

## 建议的每日节奏

如果每个 session 以 1 到 3 天计算，推荐节奏：

### Day 0

- 读文档
- 定边界
- 出最小实现方案
- 列出计划改动文件

### Day 1

- 完成核心实现
- 写最小测试或 smoke
- 跑本地验证

### Day 2

- 收口文档
- 修边角
- 补 handoff
- 如果要合并，先过 Session 0 审核共享文件冲突

---

## 最后建议

如果你的目标是“尽快把收到做成可内部试用、可演示、可继续向正式产品推进的版本”，推荐优先顺序不变：

1. Session 1：live integration
2. Session 2：signed release rehearsal
3. Session 3：task/runtime experience
4. Session 4：content assets
5. Session 5：Phase 6 boundary

不要把 Session 5 提前到第一波核心资源位，否则最容易把节奏重新带回平台预研。

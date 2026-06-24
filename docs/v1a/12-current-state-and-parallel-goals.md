# Security Goose 当前状态与并行开发建议

## 文档目的

这份文档回答 4 个问题：

1. 当前仓库整体开发进展到什么程度
2. 这条 `codex/goose-v1a-bootstrap` 分支已经把 `V1a` 做到了哪一步
3. 目前最值得继续投入的 backlog 是什么
4. 接下来应该如何拆成多个 session / goal 并行推进，尽量减少互相冲突

本结论基于当前仓库静态审计、分支 diff、目录结构、脚本、测试分布和 `docs/v1a` / `distro/security-cn` 现状整理。

---

## 一句话结论

- 这不是一个“从 0 到 1”仓库，而是一个已经成熟的 Goose 主产品仓库。
- `security-goose` 这条 `V1a` 分支已经完成了大部分“发行版定制”工作，而不是只停在 spec。
- 如果以 `docs/v1a/06-development-sequence.md` 的阶段来衡量：
  - `Phase 0` 到 `Phase 4` 基本已落地
  - `Phase 5` 已做出可演示的本地预览能力，但真实外部集成仍未完成
  - `Phase 7` 已经有较完整的本地校验、smoke、bundle 和 CI 骨架
  - `Phase 6` 基本还没真正开始
- 接下来最适合并行的不是“再写一批大 spec”，而是把剩余工作拆成 4 个工作面：
  - 外部安全扩展真实接入
  - 桌面发行/签名/打包收口
  - 安全任务入口与技能运行时体验收口
  - 模型/网关/商业化预留层

---

## 当前仓库总体成熟度

### 1. 主仓库成熟度

- 工作区不是单一应用，而是一个多产品仓库：
  - Rust core agent
  - CLI
  - server / API
  - Electron desktop
  - ACP TUI
  - docs site
  - evals
- 顶层 README 已把产品定位明确为：
  - desktop app
  - CLI
  - API
  - 多 provider
  - MCP 扩展生态
- `ui/text/README.md` 明确说明 ACP TUI 仍是 early stage；这部分不应当被当成当前主产品重心。

### 2. 代码体量信号

按当前工作区粗略统计：

- Rust 源文件约 `445`
- TypeScript / TSX 源文件约 `607`
- Rust 代码总行数约 `193k`
- TypeScript / TSX 代码总行数约 `113k`

主要 Rust crate 体量：

- `crates/goose` 约 `138k` Rust 行，是绝对核心
- `crates/goose-cli` 约 `22k`
- `crates/goose-server` 约 `12k`
- `crates/goose-providers` 约 `10k`
- `crates/goose-mcp` 约 `7k`

这说明：

- Goose 上游能力已经很完整
- `security-goose` 当前更像是“在成熟宿主上的产品化与领域化定制”
- 不应该轻易在 core 层重造 runtime / scheduler / memory / loader

### 3. 测试信号

粗略统计：

- Rust 测试标记约 `2327`
- TS 测试调用约 `575`
- `#[ignore]` 测试约 `19`

解释：

- 上游仓库测试基数足够大，说明基础设施层成熟度较高
- 仍存在少量被忽略的 ACP / 本地推理相关测试债务
- `V1a` 分支本身在桌面、安全任务、品牌、bundle、runtime bootstrap 这些区域新增了大量前端测试和脚本校验

---

## 当前分支状态

### Git 状态

- 当前分支：`codex/goose-v1a-bootstrap`
- 相对 `main`：`ahead 9 / behind 0`
- 当前工作树未提交内容主要是本地运行态目录：
  - `.agents/`
  - `.goose/`
  - `.preview/`

这些目录更像 runtime mirror / 预览状态目录，不应当被当成待开发 feature。

### 这条分支到底做了多少事

相对 `main` 的变更规模：

- `311` 个文件变更
- `+30170 / -2621`

变更重点非常集中，不是随机漂移：

- `distro/security-cn/**`
- `docs/v1a/**`
- `ui/desktop/**`
- `scripts/check-security-*.{sh,mjs}`
- `scripts/run-security-*.sh`
- `scripts/sync-security-runtime-assets.mjs`
- `.github/workflows/security-goose-v1a-checks.yml`
- `crates/goose/src/goose_apps/**`

结论：

- 这条分支已经不是“Bootstrap only”
- 它已经实现了一个相当完整的 `Security Goose local preview + runtime asset packaging + desktop task surface` 版本

---

## 按 V1a 阶段评估当前进展

### Phase 0：仓库初始化

结论：`已完成`

证据：

- `docs/v1a/` 已成体系
- `distro/security-cn/` 已建立完整目录骨架
- `just run-security-preview`、`scripts/start-security-preview.sh` 已存在
- `ui/desktop`、`goosed`、preview wrapper 都有明确入口

### Phase 1：品牌与基础发行版

结论：`大体完成`

已完成：

- `ui/desktop/package.json` 已改成产品名 `收到`
- `distro/security-cn/branding/product-metadata.json` 已存在
- `ui/desktop/src/branding/distro.ts` 能从 distro 读取产品名、locale、default provider、default model、predefined models
- 品牌图标、brand mark、生成脚本、测试都已接入
- 默认中文和中英产品文案已经进入桌面流程

剩余问题：

- 仍然带有 `preview` / `Security Goose` 的开发态命名痕迹
- 正式品牌、正式 bundle id、正式分发名还有后续收口空间

### Phase 2：模型切换与默认模型配置

结论：`基本完成`

已完成：

- `distro/security-cn/config/model-catalog.json`
- `provider-defaults.yaml`
- `desktop-env.example`
- `GOOSE_PREDEFINED_MODELS` 的 JSON 注入路径已明确
- 桌面端有相应的模型预置与测试

剩余问题：

- 现在还是 Goose 原生 provider / env 配置优先
- 网关、套餐、配额、统一策略层还没有真正实现

### Phase 3：安全 skills

结论：`完成度高`

当前已有 skill：

- `vuln-triage`
- `alert-triage`
- `ioc-analysis`
- `asset-risk-summary`
- `report-writing`
- `wooyun-legacy`

已完成内容：

- 源 skill 目录在 `distro/security-cn/skills/`
- repo preview runtime mirror 已通过脚本接到 `.agents/skills/`
- packaged preview seed 也已实现
- `managedSkills.ts` / `SkillsView.tsx` 已经不是“只读展示”，而是带有：
  - bundled skill inventory
  - local override
  - import / delete / restore
  - invalid package diagnosis

这部分已经明显超出最初 Phase 3。

### Phase 4：Recipe 与任务模板入口

结论：`基本完成`

已完成：

- recipe 源文件与 runtime mirror
- `LauncherView.tsx` 提供安全任务快速入口
- `RecipesView.tsx` 有安全任务卡片与映射
- `taskCatalog.ts` 已把 6 个任务定义成：
  - task id
  - recipe id
  - skill id
  - starter prompt
  - recommended extension ids
- 具备 recipe 缺失时降级到 skill/prompt 的 fallback 逻辑

值得注意：

- 这条线目前坚持了“Goose-first”原则
- 没有另造并行任务引擎，而是在 `recipe` 不可用时降级为 prompt/skill 引导

### Phase 5：精选 MCP / 扩展

结论：`部分完成，尚未闭环`

当前状态不是全做完，而是分成三类：

- `real local preview`
  - `browser-assist-mcp`
  - `threat-intel-mcp`
- `disabled stub`
  - `local-security-gateway-mcp`
- `blocked external dependency`
  - `aiseesec-mcp`

这是当前最关键的“半完成区”。

好处：

- UI 和配置层已经诚实表达了真实状态
- 任务入口、推荐扩展、runtime 文案是一致的

不足：

- 用户体验上已经“能看见这些能力”，但并不等于真实商业可用
- 真正决定产品上限的 live integration 还没落地

### Phase 6：网关、套餐、配额、usage

结论：`尚未真正开始`

现状：

- `docs/v1a/03-gateway-model-routing.md` 只是预留路线
- `securityBackendConfig.ts` 更多是在做 preview / packaged / init-config / env 注入边界
- 并没有看到真正的：
  - auth middleware
  - quota policy
  - plan policy
  - usage event pipeline

这部分应视为下一阶段独立 feature，不应混进当前 V1a 收口任务里。

### Phase 7：测试、打包、发布

结论：`本地预览和 CI 骨架较完整，正式签名发布依赖外部环境`

已完成：

- `scripts/check-security-v1a.sh`
- `scripts/validate-security-distro.mjs`
- `scripts/check-security-apple-signing-env.mjs`
- `scripts/check-security-macos-bundle.sh`
- `scripts/run-security-packaged-smoke.sh`
- `scripts/run-security-visual-smoke.sh`
- GitHub workflow：`security-goose-v1a-checks.yml`
- `ui/desktop/package.json` 已有 `bundle:default`、`bundle:intel`、`start:packaged-preview`

未完成或外部依赖部分：

- signed / notarized release 仍受 Apple secrets、证书、notarization 条件约束
- 这更像“发布环境 blocker”，不是代码结构 blocker

---

## 当前代码质量判断

## 优点

- 架构边界基本清晰：
  - 上游 Goose core 保持主干
  - distro 目录承担发行素材
  - desktop 承担薄 UI 映射和体验层
  - scripts 承担 preview / bundle / validation
- `V1a` 没有明显失控地重造 runtime
- 任务入口、skills、recipes、bundled extensions、packaged preview bootstrap 之间有一条完整的映射链
- 文档密度很高，且与代码落点较一致
- 前端新功能基本都伴随测试

## 风险

### 1. 共享文件冲突风险高

以下文件已经变成多人改动热点：

- `ui/desktop/src/main.ts`
- `ui/desktop/package.json`
- `ui/desktop/src/components/settings/extensions/bundled-extensions.json`
- `ui/desktop/src/security/taskCatalog.ts`
- `ui/desktop/src/securityRuntimeBootstrap.ts`
- `.github/workflows/bundle-desktop*.yml`
- `scripts/check-security-*.mjs`

如果并行 session 不控边界，冲突会很多。

### 2. Preview / packaged / signed 三套路径复杂度上升

当前已经不是单一启动链，而是至少 3 层：

- repo preview
- packaged local preview
- signed release rehearsal

这条线的复杂度已经足以形成独立 feature 面，不能继续顺手加逻辑。

### 3. 外部集成仍是产品真空区

`AiseeSec` 和 `local-security-gateway` 现在还是 stub / blocker。

这意味着：

- UI 侧工作做得越多，越容易让人误判“产品已经 ready”
- 真正的差异化价值仍然依赖后续集成兑现

### 4. 少量上游 ACP / provider 债务仍在

从 ignored tests 和 `unimplemented!()` 看，至少还有这些未闭环点：

- ACP provider `load_session`
- 某些自定义 request / provider 测试夹具
- 本地推理和特定供应商集成测试默认不跑

这类债务不一定阻塞 V1a，但会影响后续“把安全发行版真正做成主线产品”。

---

## 建议 backlog

## P0：必须继续做，不做产品会卡住

### P0-1. 把 `AiseeSec` 从 blocker 变成真实可用集成

目标：

- 至少能跑通一条最小查询链路
- 配置、错误边界、文案、smoke 都要同步完成

涉及目录：

- `distro/security-cn/extensions/aiseesec-mcp/`
- `ui/desktop/src/security/extensionCatalog.ts`
- `ui/desktop/src/components/settings/extensions/`
- `scripts/smoke-security-extensions.mjs`
- `distro/security-cn/docs/capability-catalog.md`

### P0-2. 把 `local-security-gateway-mcp` 从 stub 变成真实本地工具桥

目标：

- 至少实现 1 到 2 个真实查询动作
- 明确 auth / endpoint / 本地依赖约束

原因：

- 这是“安全工作台”与普通 Goose 的一个关键差异位

### P0-3. 收口 macOS signed release 真正演练

目标：

- 不是只保证脚本存在
- 而是要在真实 Apple signing 环境下拿到一次成功证据

原因：

- 当前 preview/bundle 已经很多
- 再不验证真签名链路，后续会堆积大量“看起来差一点就能发”的假完成

### P0-4. 固化 shared-file ownership

目标：

- 把容易冲突的文件指定单一 owner session
- 尤其是：
  - `taskCatalog.ts`
  - `bundled-extensions.json`
  - `main.ts`
  - `package.json`
  - workflow

原因：

- 现在最容易浪费时间的不是技术难题，而是并行 session 相互踩改动

## P1：建议尽快做

### P1-1. 任务入口与运行时诊断再收口

目标：

- 让用户更容易理解：
  - 当前任务是 recipe 还是 prompt fallback
  - 当前 extension 是 preview、stub 还是 blocker
  - 当前 runtime assets 是否 drift

原因：

- 这部分现在已经有基础，但信息还比较“工程视角”
- 还可以更偏产品使用视角

### P1-2. Runtime assets 同步策略再清晰化

目标：

- 明确 repo preview mirror 与 packaged seed 的职责边界
- 明确“用户本地 override”与“bundled source 更新”的优先级

原因：

- 这部分已经有实现，但后续容易出现内容 drift / 恢复策略歧义

### P1-3. Security apps 的使用路径与验证再补一层

当前 core 中已经新增内置 app：

- `ioc-toolbox`
- `encode-hash-lab`
- `secret-credential-scanner`
- `jwt-inspector`

建议补：

- 更明确的入口说明
- 与安全任务的配套说明
- 更完整的 smoke 和场景文档

## P2：可后推，不要打断当前主线

### P2-1. 网关 / 套餐 / 配额 / usage

这是下一阶段 feature，不建议夹带在当前收口任务里。

### P2-2. TUI / ACP 客户端补全

当前 `ui/text` 明确是 early stage，不应占用当前主线资源。

### P2-3. 更深的 UI 重构与审美刷新

当前桌面端已经足够支撑验证，不要在正式差异化能力没跑通前优先做 UI 大手术。

---

## 并行 session 总体策略

## 不建议的拆法

- 一个 session 负责“安全平台全做完”
- 一个 session 同时改 core、desktop、workflow、docs、extensions
- 多个 session 同时碰 `main.ts` / `package.json` / `taskCatalog.ts`

这会导致：

- 冲突多
- 评审困难
- 很难判断回归来自哪里

## 建议的拆法

建议采用 `1 个集成/守门 session + 4 个 feature session`。

也就是总共 `5` 个并行 session，已经够多；再多冲突成本会高于收益。

### Session 0：集成守门

职责：

- 只做协调、评审、合并、补 shared-file 小改动
- 不主动承接大 feature

适合改动：

- `ui/desktop/src/main.ts`
- `ui/desktop/package.json`
- workflow 收口
- 跨 feature 的文档与校验脚本

验收：

- 每个 worker session 的 PR / diff 能被整合
- shared files 不被多人长期并行改

### Session 1：安全扩展真实接入

Goal：

- 完成 `AiseeSec` 或 `local-security-gateway` 其中一个 live integration

推荐顺序：

1. 先做 `local-security-gateway-mcp`
2. 再做 `AiseeSec`

原因：

- `local-security-gateway` 更可控，依赖面更小

主要目录：

- `distro/security-cn/extensions/**`
- `scripts/smoke-security-extensions.mjs`
- `distro/security-cn/docs/capability-catalog.md`

避免碰：

- `ui/desktop/src/main.ts`
- `ui/desktop/package.json`

### Session 2：桌面发行与签名链路

Goal：

- 收口 repo preview / packaged preview / signed release 三层链路

主要目录：

- `ui/desktop/scripts/**`
- `scripts/check-security-*.{sh,mjs}`
- `scripts/run-security-*.sh`
- `.github/workflows/**bundle**`
- `distro/security-cn/docs/signed-release-*.md`

重点目标：

- 真正跑通一次 signed release rehearsal
- 明确失败属于 Apple 环境还是代码链路

避免碰：

- `taskCatalog.ts`
- skills / recipes 内容

### Session 3：安全任务入口与运行时体验

Goal：

- 把任务入口、runtime diagnostics、fallback 体验收口成稳定产品面

主要目录：

- `ui/desktop/src/components/LauncherView.tsx`
- `ui/desktop/src/components/recipes/RecipesView.tsx`
- `ui/desktop/src/components/security/**`
- `ui/desktop/src/security/taskCatalog.ts`
- `ui/desktop/src/security/taskMessages.ts`
- `ui/desktop/src/securityRuntimeBootstrap.ts`
- `ui/desktop/src/securityRuntimeDiagnostics.ts`

重点目标：

- 让用户知道“现在是在走 recipe 还是 preview fallback”
- 让 drift / missing runtime 信息更可操作
- 补相关组件测试

避免碰：

- MCP server 实现
- bundle workflow

### Session 4：技能与配方内容资产

Goal：

- 继续把 skills / recipes 做成可直接交付的内容资产

主要目录：

- `distro/security-cn/skills/**`
- `distro/security-cn/recipes/**`
- `distro/security-cn/prompts/**`
- `distro/security-cn/docs/operator-guide.md`
- `.agents/skills/**` 仅在需要验证 mirror 时触碰

重点目标：

- 统一输出模板
- 补真实安全场景样例
- 把“方法论、边界、待确认项、后续动作”写得更稳定

避免碰：

- desktop shared files
- workflow / signing

### Session 5：模型与网关预留层

Goal：

- 只做下一阶段的最小准备，不直接把 Phase 6 做大

主要目录：

- `distro/security-cn/config/**`
- `docs/v1a/03-gateway-model-routing.md`
- `ui/desktop/src/securityBackendConfig.ts`
- 必要时少量 server/config 边界代码

重点目标：

- 明确后续 plan / quota / usage 会插在哪
- 先补可验证的配置与边界，不急着上完整服务

避免碰：

- signed release
- skills / task UI

---

## 推荐执行顺序

## 第一波并行

- Session 1：安全扩展真实接入
- Session 2：桌面发行与签名链路
- Session 3：安全任务入口与运行时体验
- Session 4：技能与配方内容资产

这 4 个可以同时开。

前提：

- Session 0 先声明 shared-file owner

## 第二波并行

在第一波至少完成 2 个成果后，再开 Session 5。

原因：

- 模型/网关层属于下一阶段
- 过早进入，会把当前分支从 `V1a 收口` 拉回 `平台预研`

---

## 适合直接下发给 session 的 goal 文案

下面这些 goal 文案可以直接作为新 session 的起始提示。

### Goal A：本地安全网关扩展落地

目标：
在不新增并行 runtime 的前提下，把 `distro/security-cn/extensions/local-security-gateway-mcp/` 从 disabled stub 实现成可在本地预览链路启用的真实 MCP 扩展。

约束：

- 不改 Goose core 协议
- 优先改 `distro/security-cn/extensions/**`、桌面 catalog、smoke 脚本和文档
- 必须补 smoke 或测试
- 必须明确配置方式、失败边界、回退行为

验收：

- 扩展可从桌面设置中启用
- 至少 1 条真实工具链路可跑通
- `scripts/smoke-security-extensions.mjs` 覆盖该链路

### Goal B：signed release 演练收口

目标：
把 `Security Goose` 的 macOS signed/notarized 流程从“脚本存在”推进到“真实环境下完成一次可复核演练”。

约束：

- 不改业务功能
- 只改打包、签名校验、workflow、发布文档
- 清晰区分 local-preview、packaged-preview、signed

验收：

- 能明确输出 preflight、bundle check、notarization evidence
- 能判断失败点是 Apple 环境还是代码链路

### Goal C：安全任务入口体验收口

目标：
优化安全任务入口、runtime diagnostics 和 fallback 体验，让用户更容易理解当前任务的实际运行路径和依赖状态。

约束：

- 不新增并行任务引擎
- 保持 recipe 优先、prompt fallback 的现有架构
- 补前端测试

验收：

- launcher / recipes 页面上的状态表达更清晰
- 缺 recipe、缺 runtime asset、extension stub/blocker 都能被清楚解释

### Goal D：skills / recipes 内容资产强化

目标：
把 `distro/security-cn/skills/**` 与 `recipes/**` 继续打磨成可直接交付给安全团队使用的内容资产。

约束：

- 以内容和方法论为主，不做 core patch
- 同步维护文档、样例和验证脚本

验收：

- 每个 skill / recipe 都有稳定结构、明确边界和输出模板
- 文档能指导真实分析任务使用

### Goal E：模型/网关 Phase 6 预留设计

目标：
在不提前引入完整网关平台的前提下，为后续套餐、配额、usage 记录留出干净的接入边界。

约束：

- 不直接做大网关
- 优先做 config、接口边界、文档和最小验证

验收：

- 能回答 auth、quota、usage 将来分别插在哪
- 不破坏当前 V1a 的 Goose-native 模型切换路径

---

## 不建议并行的文件

如果你准备真的开多个 session，下面这些文件尽量指定单一 owner：

- `ui/desktop/src/main.ts`
- `ui/desktop/package.json`
- `ui/desktop/src/components/settings/extensions/bundled-extensions.json`
- `ui/desktop/src/security/taskCatalog.ts`
- `ui/desktop/src/securityRuntimeBootstrap.ts`
- `ui/desktop/src/securityBackendConfig.ts`
- `.github/workflows/bundle-desktop.yml`
- `.github/workflows/bundle-desktop-intel.yml`
- `.github/workflows/bundle-desktop-manual.yml`

---

## 最后建议

如果你的目标是“尽快把 `security-goose` 做成可对外展示、可内部试用的产品”，优先级应当是：

1. 真实扩展接入
2. signed release 真实演练
3. 任务入口体验收口
4. 内容资产强化
5. 最后才是网关/套餐层

如果反过来先做网关、平台或大 UI 重构，短期内会显著拉长交付路径。

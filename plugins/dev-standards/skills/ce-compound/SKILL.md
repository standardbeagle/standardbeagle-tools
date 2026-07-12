---
name: dev-standards-ce-compound
description: "記錄已解決問題以複利機構知識。Document solved problems in docs/solutions/ with structured YAML frontmatter. Use when: non-trivial problem solved + verified, prevent re-discovery, capture institutional learning before context fades, document best practice or workflow pattern. Skip: trivial (typo), solution unverified, problem in progress, project lacks docs/solutions/ convention."
---

<!--
Originally ported from Compound Engineering (`ce-compound`).
Upstream: https://github.com/every-org/compound-engineering — MIT License.
Body content preserved verbatim; only frontmatter normalized per
standardbeagle-tools R1 §2.2 (bilingual Use when/Skip when triggers).
References to `ce-session-historian` in body refer to the SBT-ported
`research:session-historian` agent. References to specialized review agents
(ce-performance-oracle, ce-kieran-rails-reviewer, etc.) are narrative pointers;
where SBT has equivalents (risk-pipeline:security-reviewer, etc.) they may be
substituted by the coordinator at dispatch time.
-->

# /ce-compound

协调多个子代理并行运作，记录近期已解决之问题。

## 目的

趁脉络犹新，记录问题解决方案，于 `docs/solutions/` 创结构化文档，含 YAML frontmatter 以便搜索与日后参考。以并行子代理求最高效率。

**何以名"compound"？** 每一文档化之解决方案复利累增团队知识。首解一问题须研究。记录之，下次再遇但须数分。知识复利增长。

## 用法

```bash
/ce-compound                    # 记录最近之修复
/ce-compound [简要脉络]    # 提供额外脉络提示
```

## 支撑文件

此诸文件为工作流之持久约定。于所需步骤按需读之——勿于技能启动时批量载入。

- `references/schema.yaml` — 标准 frontmatter 字段与枚举值（验证 YAML 时读）
- `references/yaml-schema.md` — 自 problem_type 至目录之类目映射（分类时读）
- `assets/resolution-template.md` — 新文档之段落结构（组装时读）

分派子代理时，将相关文件内容传入任务提示词，使彼有约定而无需跨技能路径。

## 执行策略

以平台之阻塞提问工具提问二选一（Claude Code 之 `AskUserQuestion`、Codex 之 `request_user_input`、Gemini 之 `ask_user`）。若无提问工具，列选项候用户回复。

```
1. 完整模式（推荐）— 完整 compound 工作流。研究、交叉参照、
   审查你的方案，产出复利累增团队知识之文档。

2. 轻量模式 — 同等文档，单次处理。较快且省 token，
   然不检测重复，不交叉参照既有文档。适用于简单修复
   或长会话逼近脉络上限。
```

勿预选模式。勿跳过此提示。候用户选择方续行。

**若用户选完整模式**，续行前再问一题。检测运行平台（Claude Code、Codex 或 Cursor）并问：

```
是否亦搜索你的 [平台名] 会话历史
以觅相关知识点辅助 Compound 流程？此举将增耗时与 token 用量。
```

若用户允之，Phase 1 分派 Session Historian。若否，跳过。轻量模式不问此题。

---

### 完整模式

<critical_requirement>
**主要产出为一文件——最终文档。**

Phase 1 子代理返还文字数据予协调器。彼等绝不可用 Write、Edit 或创建任何档案。唯协调器写档案：Phase 2 之解决方案文档，及——若可发现性检查发现缺漏——项目指示文件（AGENTS.md 或 CLAUDE.md）之小幅编辑。指示文件之编辑为维护，非第二交付物；确保未来代理能发现知识库。
</critical_requirement>

### Phase 0.5：自动记忆扫描

启动 Phase 1 子代理前，检查注入系统提示词之自动记忆区块，寻找与所记录问题相关之注记。

1. 寻标为"user's auto-memory"之区块（仅 Claude Code）已存在于系统提示词脉络——MEMORY.md 条目已行内嵌入
2. 若区块缺如、空白、或非 Claude Code 平台，跳过此步，照常进入 Phase 1
3. 扫描条目，寻与所记录问题相关者——用语义判断，非关键词匹配
4. 若寻得相关条目，预备标签摘录区块：

```
## Supplementary notes from auto memory
Treat as additional context, not primary evidence. Conversation history
and codebase findings take priority over these notes.

[relevant entries here]
```

5. 将此区块作为额外脉络传入 Phase 1 之 Context Analyzer 与 Solution Extractor 任务提示词。若有记忆注记最终进入文档（如为调查步骤或根因分析之一部），标注"(auto memory [claude])"以明其来源。

若未寻得相关条目，径入 Phase 1，不传记忆脉络。

### Phase 1：研究

启动研究子代理。各返文字数据予协调器。

**分派顺序：**
- 并行（背景）启动 `Context Analyzer`、`Solution Extractor` 与 `Related Docs Finder`
- 再前景分派 `session-historian`——其读取工作目录外之会话文件，背景代理或无权访问
- 前景分派与背景代理工作同时进行，不增墙上时钟时间

<parallel_tasks>

#### 1. **Context Analyzer**
   - 提取对话历史
   - 读 `references/schema.yaml` 以验证枚举及**追踪分类**
   - 自 problem_type 判定追踪（bug 或 knowledge）
   - 辨识问题类型、组件、及追踪适用字段：
     - **Bug 追踪**：症状、root_cause、resolution_type
     - **Knowledge 追踪**：applies_when（symptoms/root_cause/resolution_type 可选）
   - 纳入自动记忆摘录（若协调器提供）作为补充证据
   - 读 `references/yaml-schema.md` 获取类目映射至 `docs/solutions/`
   - 建议档名，用模式 `[sanitized-problem-slug]-[date].md`
   - 返还：YAML frontmatter 骨架（须含 `category:` 字段，映射自 problem_type）、类目目录路径、建议档名、适用追踪
   - 不凭记忆捏造枚举值、类目或 frontmatter 字段；读上方之 schema 与映射文件
   - 不强将 bug 追踪字段施于 knowledge 追踪学习，反之亦然

#### 2. **Solution Extractor**
   - 读 `references/schema.yaml` 以判追踪分类（bug vs knowledge）
   - 据 problem_type 追踪调整输出结构
   - 纳入自动记忆摘录（若协调器提供）作为补充证据——对话历史与已验证之修复优先；若记忆注记与对话矛盾，标注矛盾为警示脉络

   **Bug 追踪输出段落：**

   - **Problem**：问题之一二句描述
   - **Symptoms**：可观之症状（错误讯息、行为）
   - **What Didn't Work**：失败之调查尝试及其原因
   - **Solution**：实际修复，含代码示例（适用时附前后对照）
   - **Why This Works**：根因解释及何以解决方案对症
   - **Prevention**：避免复发之策略、最佳实践、测试用例。适用时含具体代码示例（如 gem 配置、测试断言、linting 规则）

   **Knowledge 追踪输出段落：**

   - **Context**：何种情况、差距或摩擦促生此指引
   - **Guidance**：实践、模式或建议，有用时附代码示例
   - **Why This Matters**：遵循或不遵循此指引之理据与影响
   - **When to Apply**：适用之条件或情况
   - **Examples**：具体之前后对照或使用示例，展示实践运作

#### 3. **Related Docs Finder**
   - 搜索 `docs/solutions/` 寻相关文档
   - 辨识交叉参照与链接
   - 寻相关 GitHub issues
   - 标记可能已过时、矛盾或过宽之相关学习或模式文档
   - **评估重叠**，就新文档跨五维评量：问题陈述、根因、方案路径、引用档案、预防规则。评分为：
     - **High**：4-5 维匹配——本质上同一问题再解一次
     - **Moderate**：2-3 维匹配——同域不同角度或方案
     - **Low**：0-1 维匹配——相关但不同
   - 返还：链接、关系、刷新候选、及重叠评估（评分 + 匹配维度）

   **搜索策略（先 grep 过滤以增效）：**

   1. 自问题脉络提取关键词：模块名、技术术语、错误讯息、组件类型
   2. 若问题类目明确，缩搜索至对应 `docs/solutions/<category>/` 目录
   3. 用原生内容搜索工具（如 Claude Code 之 Grep）于读取内容前先过滤候选档案。并行多搜，不区分大小写，针对 frontmatter 字段。此为模板模式——替换实际关键词：
      - `title:.*<keyword>`
      - `tags:.*(<keyword1>|<keyword2>)`
      - `module:.*<module name>`
      - `component:.*<component>`
   4. 若搜索返 >25 候选，以更精确模式重搜。若 <3，扩至全文搜索
   5. 仅读候选档案之 frontmatter（前 30 行）以评相关性
   6. 仅全文读强/中度匹配
   7. 返还提炼之链接与关系，非原始文件内容

   **GitHub issue 搜索：**

   优先用 `gh` CLI 搜索相关 issues：`gh issue list --search "<keywords>" --state all --limit 5`。若 `gh` 未安装，回退至 GitHub MCP 工具（如 `unblocked` data_retrieval）若有可用。若皆不可用，跳过 GitHub issue 搜索并于输出注明。

</parallel_tasks>

#### 4. **Session Historian**（前景，于上方之后——仅当用户选择参与）
   - 若用户拒绝会话历史则**完全跳过**
   - 以 `research:session-historian` 分派
   - **前景**分派——此代理读取工作目录外之会话文件（`~/.claude/projects/`、`~/.codex/sessions/`、`~/.cursor/projects/`），背景代理或无权访问
   - 搜索同一项目之先前 Claude Code、Codex 及 Cursor 会话以觅相关调查脉络
   - 跨平台以仓库名关联会话（匹配主 checkout、worktree 及 Conductor 工作区之会话）
   - 于分派提示词中传入：
     - 所记录问题之具体描述——非泛泛话题，乃确切之事（错误讯息、模块名、何者坏及如何修）。此为代理过滤所据。
     - 当前 git 分支与工作目录
     - 指令："仅呈现与此具体问题直接相关之先前会话发现。忽略同一会话或分支中之无关工作。"
     - 输出格式：

       ```
       Structure your response with these sections (omit any with no findings):
       - What was tried before: prior approaches to this specific problem
       - What didn't work: failed attempts at this problem from prior sessions
       - Key decisions: choices made about this problem and their rationale
       - Related context: anything else from prior sessions that directly informs this problem's documentation
       ```
   - 省略 `mode` 参数以使用户已配置之权限设定生效
   - 以中层模型分派（如 Claude Code 中 `model: "sonnet"`）——综合结果供 compound 组装，无需前沿推理
   - 返还：先前会话发现之结构化摘要，或"无相关先前会话"

### Phase 2：组装与写入

<sequential_tasks>

**候 Phase 1 所有子代理完成方续行。**

协调代理（主对话）执行此诸步：

1. 收集 Phase 1 子代理之所有文字结果
2. **检查重叠评估**，然后决定写何物：

   | 重叠 | 行动 |
   |------|------|
   | **High** — 既有文档涵盖同一问题、根因与方案 | **更新既有文档**以更新鲜之脉络（新代码示例、更新引用、额外预防提示），而非创重复。既有文档之路径与结构不变。 |
   | **Moderate** — 同一问题域但不同角度、根因或方案 | **照常创新文档**。为 Phase 2.5 标记重叠以建议合并审查。 |
   | **Low 或无** | **照常创新文档**。 |

   更新而非创建之因：两文档描述同一问题与方案将不可避免地渐行渐远。新者脉络更新鲜、更可信，故纳入既有文档，而非创立即需合并之第二份。

   更新既有文档时，保留其文件路径与 frontmatter 结构。更新方案、代码示例、预防提示及任何过时引用。于 frontmatter 添 `last_updated: YYYY-MM-DD` 字段。除非问题框架已实质性偏移，否则不改标题。

3. **纳入会话历史发现**（若有）。当 Session History Researcher 返还相关先前会话脉络：
   - 将调查死路与失败尝试并入 **What Didn't Work** 段（bug 追踪）或 **Context** 段（knowledge 追踪）
   - 用跨会话模式充实 **Prevention** 或 **Why This Matters** 段
   - 标注会话来源内容以"(session history)"以明其出处
   - 若发现单薄或"无相关先前会话"，不传会话脉络径行
4. 自收集之片段组装完整 markdown 文件，读 `assets/resolution-template.md` 以取新文档之段落结构
5. 对照 `references/schema.yaml` 验证 YAML frontmatter
6. 按需建目录：`mkdir -p docs/solutions/[category]/`
7. 写文件：更新既有文档或新创 `docs/solutions/[category]/[filename].md`

创新文档时，保留 `assets/resolution-template.md` 之段落顺序，除非用户明确要求不同结构。

</sequential_tasks>

### Phase 2.5：选择性刷新检查

写入新学习后，判断此新解决方案是否为证据表明旧文档应刷新。

`ce-compound-refresh` **非**默认后续。仅于新学习暗示较旧学习或模式文档可能已不准确时选择性使用。

当以下一或多条为真时，调用 `ce-compound-refresh` 为合理：

1. 相关学习或模式文档推荐之方法为新修复所矛盾
2. 新修复明确取代较旧之文档化方案
3. 当前工作涉及重构、迁移、更名或依赖升级，可能使旧文档中引用失效
4. 模式文档如今看来过宽、过时或不再为刷新后之现实所支持
5. Related Docs Finder 于同一问题空间浮现高置信度刷新候选
6. Related Docs Finder 报告与既有文档之**中度重叠**——或有合并机会可受益于聚焦审查

以下情况调用 `ce-compound-refresh` **不合理**：

1. 未寻得相关文档
2. 相关文档与新学习仍一致
3. 重叠为表面，不改变先前指引
4. 刷新需广泛历史审查而证据薄弱

循此规则：

- 若有**一个明显过时候选**，于新学习写入后以窄范围提示调用 `ce-compound-refresh`
- 若同一区域有**多个候选**，问用户是否对该模块、类目或模式集执行定向刷新
- 若脉络已紧或处轻量模式，勿自动扩展为广泛刷新；改为推荐 `ce-compound-refresh` 为下一步并附范围提示

调用或推荐 `ce-compound-refresh` 时，明确传入参数。偏好最窄之有用范围：

- **特定文件** 当一份学习或模式文档为可能过时之物
- **模块或组件名** 当数份相关文档可能需审查
- **类目名** 当偏移集中于一个解决方案区域
- **模式文件名或模式主题** 当过时指引位于 `docs/solutions/patterns/`

示例：

- `/ce-compound-refresh plugin-versioning-requirements`
- `/ce-compound-refresh payments`
- `/ce-compound-refresh performance-issues`
- `/ce-compound-refresh critical-patterns`

单一范围提示于变更横切同一域、类目或模式区域时仍可能扩展至多份相关文档。

除非用户明确欲广泛扫描，勿无参数调用 `ce-compound-refresh`。

务必先记录新学习。刷新为定向维护后续，非文档化之前提。

### 可发现性检查

学习写入且刷新决定作出后，检查项目指示文件是否会引导代理于已记录领域工作前发现并搜索 `docs/solutions/`。此每次皆行——知识库唯代理能寻方有价值。

1. 辨识根层级指示文件何在（AGENTS.md、CLAUDE.md 或两者）。读文件，判何者含实质内容——或一文件仅为 `@`-包含另一者之垫片（如 `CLAUDE.md` 仅含 `@AGENTS.md` 或反之）。实质文件为评估与编辑目标；忽略垫片。若两文件皆无，全跳过此检查。
2. 评估代理读指示文件后能否知三事：
   - 可搜索之已记录解决方案知识库存在
   - 足知其结构以有效搜索（类目组织、YAML frontmatter 字段如 `module`、`tags`、`problem_type`）
   - 何时搜索（于已记录领域实现功能、除错问题或做决定前——学习或含 bug、最佳实践、工作流模式或其他机构知识）

   此为语义评估，非字串匹配。信息可为架构段落之一行、注意事项之一要点、散布多处、或从未用确切路径 `docs/solutions/` 表达。用判断——若代理读文件后能合理发现并使用知识库，检查通过。

3. 若精神已合，无需行动——续行。
4. 若否：
   a. 据文件现有之结构、语气与密度，辨何处提及自然嵌入。创建新段落前，先查信息可否为最相关段落之一行——架构树、目录清单、文档段落或约定区块。加一行于既有段落几乎总优于加带标题之新段落。仅当文件有明确分段结构且无任何勉强相关之物时方添新段落作为最后手段。
   b. 草拟最小增补以传达三事。匹配文件现有之风格与密度。增补应描述知识库本身，非插件——无插件之代理亦当从中获益。

      保持语气为信息性，非祈使性。以描述表达时机，非以指令——"relevant when implementing or debugging in documented areas"而非"check before implementing or debugging."。祈使性指令如"always search before implementing"于工作流已含专用搜索步骤时造成冗余读取。目标为意识：代理知文件夹存在及其中何物，后自行判断何时查阅。

      校准示例（非模板——适文件而变）：

      当有既有目录清单或架构段落——加一行：
      ```
      docs/solutions/  # documented solutions to past problems (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (module, tags, problem_type)
      ```

      当文件中无自然嵌入处——小标题段落为适当：
      ```
      ## Documented Solutions

      `docs/solutions/` — documented solutions to past problems (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`). Relevant when implementing or debugging in documented areas.
      ```
   c. 完整模式中，向用户解释其重要性——此仓库中工作之代理（包括新会话、其他工具或无插件之协作者）将不知检查 `docs/solutions/`，除非指示文件呈现之。展示拟议变更及位置，后以平台之阻塞提问工具（Claude Code 之 `AskUserQuestion`、Codex 之 `request_user_input`、Gemini 之 `ask_user`）征得同意方编辑。若无提问工具，展示提案候用户回复。轻量模式中，输出一行注记即续行

### Phase 3：可选增强

**候 Phase 2 完成方续行。**

<parallel_tasks>

据问题类型，选择性调用专门代理审查文档：

- **performance_issue** → `review:ce-performance-oracle`
- **security_issue** → `review:ce-security-sentinel`
- **database_issue** → `review:ce-data-integrity-guardian`
- 任何代码密集之问题 → 必行 `review:ce-code-simplicity-reviewer`，并运行匹配仓库主要技术栈之 kieran 审查器：
   - Ruby/Rails → 亦行 `review:ce-kieran-rails-reviewer`
   - Python → 亦行 `review:ce-kieran-python-reviewer`
   - TypeScript/JavaScript → 亦行 `review:ce-kieran-typescript-reviewer`
   - 其他技术栈 → 无需 kieran 审查器

</parallel_tasks>

---

### 轻量模式

<critical_requirement>
**单次处理替代——同等文档，较少 token。**

此模式全然跳过并行子代理。协调器以单次处理执行全部工作，产出同等解决方案文档，不交叉参照，不检测重复。
</critical_requirement>

协调器（主对话）于一次顺序处理中执行以下全部：

1. **自对话提取**：自对话历史辨识问题与方案。亦扫描注入系统提示词之"user's auto-memory"区块（若存在，仅 Claude Code）——以相关注记为对话历史之补充脉络。以"(auto memory [claude])"标注纳入最终文档之任何记忆来源内容
2. **分类**：读 `references/schema.yaml` 与 `references/yaml-schema.md`，后判定追踪（bug vs knowledge）、类目与档名
3. **写最小文档**：用 `assets/resolution-template.md` 中适当追踪模板创 `docs/solutions/[category]/[filename].md`，含：
   - YAML frontmatter 具追踪适用字段
   - Bug 追踪：Problem、根因、方案含关键代码片段、一条预防提示
   - Knowledge 追踪：Context、指引含关键示例、一条适用说明
4. **跳过专门代理审查**（Phase 3）以节省脉络

**轻量输出：**
```
✓ Documentation complete (lightweight mode)

File created:
- docs/solutions/[category]/[filename].md

[If discoverability check found instruction files don't surface the knowledge store:]
Tip: Your AGENTS.md/CLAUDE.md doesn't surface docs/solutions/ to agents —
a brief mention helps all agents discover these learnings.

Note: This was created in lightweight mode. For richer documentation
(cross-references, detailed prevention strategies, specialized reviews),
re-run /ce-compound in a fresh session.
```

**无子代理启动。无并行任务。一文件写入。**

轻量模式中，重叠检查跳过（无 Related Docs Finder 子代理）。此意味着轻量模式或创与既有文档重叠之文档。此可接受——`ce-compound-refresh` 后续将捕获之。仅当有明显之窄范围刷新目标时方建议 `ce-compound-refresh`。勿自轻量会话扩展为大型刷新扫描。

---

## 所记何物

- **问题症状**：确切错误讯息、可观行为
- **调查已试之步**：何者无效及何以
- **根因分析**：技术解释
- **可用方案**：逐步修复含代码示例
- **预防策略**：未来何以避免
- **交叉参照**：相关 issues 与文档之链接

## 前提

<preconditions enforcement="advisory">
  <check condition="problem_solved">
    问题已解决（非进行中）
  </check>
  <check condition="solution_verified">
    方案已验证可用
  </check>
  <check condition="non_trivial">
    非平凡问题（非简单笔误或明显错误）
  </check>
</preconditions>

## 所创何物

**组织化文档：**

- 文件：`docs/solutions/[category]/[filename].md`

**自问题自动检测之类目：**

Bug 追踪：
- build-errors/
- test-failures/
- runtime-errors/
- performance-issues/
- database-issues/
- security-issues/
- ui-bugs/
- integration-issues/
- logic-errors/

Knowledge 追踪：
- best-practices/
- workflow-issues/
- developer-experience/
- documentation-gaps/
- deferral-outcomes/  # ponytail 捷徑之天花板被跨越：所延遲者、觸發升級之條件、升級為何。複利累積何種延遲值得、何種腐爛。見 [[ponytail-debt]]

## 常见误区

| ❌ 误 | ✅ 正 |
|-------|-------|
| 子代理写文件如 `context-analysis.md`、`solution-draft.md` | 子代理返还文字数据；协调器写一份最终文件 |
| 研究与组装并行 | 研究完成 → 后组装运行 |
| 工作流中创多文件 | 一份解决方案文档写入或更新：`docs/solutions/[category]/[filename].md`（加项目指示文件之可选小幅编辑以利发现） |
| 既有文档涵盖同一问题时仍创新文档 | 检查重叠评估；重叠高时更新既有文档 |

## 成功输出

```
✓ Documentation complete

Auto memory: 2 relevant entries used as supplementary evidence

Subagent Results:
  ✓ Context Analyzer: Identified performance_issue in brief_system, category: performance-issues/
  ✓ Solution Extractor: 3 code fixes, prevention strategies
  ✓ Related Docs Finder: 2 related issues
  ✓ Session History: 3 prior sessions on same branch, 2 failed approaches surfaced

Specialized Agent Reviews (Auto-Triggered):
  ✓ ce-performance-oracle: Validated query optimization approach
  ✓ ce-kieran-rails-reviewer: Code examples meet Rails conventions
  ✓ ce-code-simplicity-reviewer: Solution is appropriately minimal

File created:
- docs/solutions/performance-issues/n-plus-one-brief-generation.md

This documentation will be searchable for future reference when similar
issues occur in the Email Processing or Brief System modules.

What's next?
1. Continue workflow (recommended)
2. Link related documentation
3. Update other references
4. View documentation
5. Other
```

**展示成功输出后，以平台之阻塞提问工具呈现"What's next?"选项**（Claude Code 之 `AskUserQuestion`、Codex 之 `request_user_input`、Gemini 之 `ask_user`）。若无提问工具，呈现编号选项候用户回复方续行。勿于用户选择前续行工作流或结束回合。

**替代输出（高重叠时更新既有文档）：**

```
✓ Documentation updated (existing doc refreshed with current context)

Overlap detected: docs/solutions/performance-issues/n-plus-one-queries.md
  Matched dimensions: problem statement, root cause, solution, referenced files
  Action: Updated existing doc with fresher code examples and prevention tips

File updated:
- docs/solutions/performance-issues/n-plus-one-queries.md (added last_updated: 2026-03-24)
```

## 复利哲学

此创一复利知识系统：

1. 首解"brief 生成中之 N+1 查询" → 研究（30 分）
2. 记录方案 → docs/solutions/performance-issues/n-plus-one-briefs.md（5 分）
3. 下次类似问题出 → 速查（2 分）
4. 知识复利 → 团队日益聪慧

反馈循环：

```
Build → Test → Find Issue → Research → Improve → Document → Validate → Deploy
    ↑                                                                      ↓
    └──────────────────────────────────────────────────────────────────────┘
```

**每一工程工作单元当使后续工作更易——而非更难。**

## 自动调用

<auto_invoke> <trigger_phrases> - "that worked" - "it's fixed" - "working now" - "problem solved" </trigger_phrases>

<manual_override> 使用 /ce-compound [context] 立即记录，无需等候自动检测。 </manual_override> </auto_invoke>

## 输出

直接将最终学习写入 `docs/solutions/`。

## 适用专门代理

据问题类型，此诸代理可增强文档：

### 码质与审查
- **review:ce-kieran-rails-reviewer**：审查代码示例之 Rails 最佳实践
- **review:ce-kieran-python-reviewer**：审查代码示例之 Python 最佳实践
- **review:ce-kieran-typescript-reviewer**：审查代码示例之 TypeScript 最佳实践
- **review:ce-code-simplicity-reviewer**：确保方案代码精简清晰
- **review:ce-pattern-recognition-specialist**：辨识反模式或重复问题

### 特定领域专家
- **review:ce-performance-oracle**：分析 performance_issue 类目方案
- **review:ce-security-sentinel**：审查 security_issue 方案之漏洞
- **review:ce-data-integrity-guardian**：审查 database_issue 迁移与查询

### 增强与研究
- **research:web-researcher**（mode=best-practices 或 mode=framework-docs）：以业界最佳实践或框架文档充实方案

### 何时调用
- **自动触发**（可选）：代理可于文档化后运行以增强
- **手动触发**：用户可于 /ce-compound 完成后调用代理以深入审查

## 相关指令

- `/research [topic]` - 深度调查（搜索 docs/solutions/ 以觅模式）
- `/ce-plan` - 规划工作流（参照已记录之方案）

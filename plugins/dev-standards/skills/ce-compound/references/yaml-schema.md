# YAML前揭綱目

此目錄之 `schema.yaml` 乃 `docs/solutions/` 前揭之正典契約，亦為 `ce-compound` 所遵。

速查：
- 必填欄
- 枚舉值
- 驗證規範
- 類目映射
- 軌道分類（缺陷 vs 知識）

## 軌道

`problem_type` 定其軌。各軌必填/選填不同。

| 軌 | problem_types | 述 |
|-------|--------------|-------------|
| **缺陷** | `build_error`, `test_failure`, `runtime_error`, `performance_issue`, `database_issue`, `security_issue`, `ui_bug`, `integration_issue`, `logic_error` | 已診斷修復之缺陷 |
| **知識** | `best_practice`, `documentation_gap`, `workflow_issue`, `developer_experience`, `deferral_outcome` | 實踐、模式、流程改善、文檔、ponytail 延遲成效 |

## 必填欄（雙軌共通）

- **module**: 受影響之模組或區域
- **date**: ISO日期 `YYYY-MM-DD`
- **problem_type**: 見上表枚舉
- **component**: `rails_model`, `rails_controller`, `rails_view`, `service_object`, `background_job`, `database`, `frontend_stimulus`, `hotwire_turbo`, `email_processing`, `brief_system`, `assistant`, `authentication`, `payments`, `development_workflow`, `testing_framework`, `documentation`, `tooling` 之一
- **severity**: `critical`, `high`, `medium`, `low` 之一

## 缺陷軌欄

必填：
- **symptoms**: YAML陣列，1-5可觀症狀
- **root_cause**: `missing_association`, `missing_include`, `missing_index`, `wrong_api`, `scope_issue`, `thread_violation`, `async_timing`, `memory_leak`, `config_error`, `logic_error`, `test_isolation`, `missing_validation`, `missing_permission`, `missing_workflow_step`, `inadequate_documentation`, `missing_tooling`, `incomplete_setup` 之一
- **resolution_type**: `code_fix`, `migration`, `config_change`, `test_fix`, `dependency_update`, `environment_setup`, `workflow_improvement`, `documentation_update`, `tooling_addition`, `seed_data_update` 之一

## 知識軌欄

共通必填之外無額外必填。下皆選填：

- **applies_when**: 適用條件
- **symptoms**: 可觀缺口或摩擦
- **root_cause**: 潛在成因（若有）
- **resolution_type**: 變更類型（若適用）

## 選填欄（雙軌共通）

- **related_components**: 涉及之他組件
- **tags**: 搜尋關鍵詞，小寫連字符

## 選填欄（僅缺陷軌）

- **rails_version**: Rails版本 `X.Y.Z`

## 向後相容

軌道系統之前所作文檔，知識類可有 `symptoms`/`root_cause`/`resolution_type`。此乃合法舊文：

- 缺陷軌欄出現於知識軌文檔，無害。除非因他故重寫，否則刷新時勿刪。
- 新建文檔須循上軌道規則。

## 類目映射

- `build_error` -> `docs/solutions/build-errors/`
- `test_failure` -> `docs/solutions/test-failures/`
- `runtime_error` -> `docs/solutions/runtime-errors/`
- `performance_issue` -> `docs/solutions/performance-issues/`
- `database_issue` -> `docs/solutions/database-issues/`
- `security_issue` -> `docs/solutions/security-issues/`
- `ui_bug` -> `docs/solutions/ui-bugs/`
- `integration_issue` -> `docs/solutions/integration-issues/`
- `logic_error` -> `docs/solutions/logic-errors/`
- `developer_experience` -> `docs/solutions/developer-experience/`
- `workflow_issue` -> `docs/solutions/workflow-issues/`
- `best_practice` -> `docs/solutions/best-practices/`
- `documentation_gap` -> `docs/solutions/documentation-gaps/`
- `deferral_outcome` -> `docs/solutions/deferral-outcomes/`  # ponytail 捷徑天花板被跨越之成效記錄

## 驗證規則

1. 由 `problem_type` 依上表定軌。
2. 共通必填欄須齊備。
3. 缺陷軌必填欄（`symptoms`, `root_cause`, `resolution_type`）須見於缺陷軌文檔。
4. 知識軌文檔除共通必填外無額外必填。
5. 缺陷軌欄出現於既有知識軌文檔，無害（見向後相容）。
6. 枚舉欄須精確匹配。
7. 陣列欄須守最小/最大項數。
8. `date` 須合 `YYYY-MM-DD`。
9. `rails_version` 若有，須合 `X.Y.Z` 且僅適用缺陷軌。

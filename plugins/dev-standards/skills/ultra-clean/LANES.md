# Ultra Clean — Lanes

每道五節：Inspect / Evidence / High-confidence / Anti-patterns / Validation。高信者方實施。

## Lane 1: Dedupe and Consolidate

- **Inspect**：近同之函數/hook/helper/serializer；重複 switch 與條件梯；複製之校驗/正規化；繞相近數據形之重複編排；重複測試 helper/fixture。
- **Evidence**：證同一真契約（非文本相似）；比調用點與副作用；驗生命週期、序、錯誤行為；證合併不生更寬更晦之抽象。
- **High-confidence**：內聯無策略之一次性包裝；≥2 調用點已同行為同名者抽共享 helper；合重複常量表；輸入輸出同者併控制流為一顯實現。
- **Anti-patterns**：過早抽象；掩領域義之泛用工具；合邊界行為異之相似路徑；以間接與 option bag 代重複。
- **Validation**：合併點周之測試；lint/typecheck；棧跡、日誌、序仍可。
- 評：DRY 之敗多因視重複為病而非策略不一。重複常為症；真問在行為是否實共享。

## Lane 2: Shared Types

- **Inspect**：同名近場之 interface/alias；跨層複製之 DTO；手抄之 API 響應型；schema 派生型與手寫變體並存；跨包漂移之 enum/字串聯合。
- **Evidence**：證同一概念（非偶似）；映所有權（domain / transport / persistence / UI view model）；證合併後 import 方向仍潔；查生成型或外部型是否已為權威。
- **High-confidence**：真共享契約歸一主模塊；能自 schema/真源派生則派生；複製字面聯合→導出共享聯合；一 alias 藏多概念者拆之。
- **Anti-patterns**：強各層共一巨型；transport DTO 深入 domain；所有權本地卻移入 `shared`；barrel 加劇循環。
- **Validation**：全 typecheck；序列化/映射邊界之聚焦測試；無新循環。
- 評：型蔓延即邊界混淆。非默認「移入 shared」，乃顯所有權，一概念一權威處。

## Lane 3: Unused Code

- **Inspect**：`knip` 結果；無引用之檔/導出/依賴；死 feature flag、未用 config 鍵；未用 fixture/mock/helper/script；陳舊包依賴與 scripts。
- **Evidence**：工具輸出；直接與間接用法之代碼搜索；config 驅動/字串驅動引用；test-only、CLI-only、框架約定用法；公共包非有意導出。
- **High-confidence**：私有無引用 helper（證無運行注冊）；確認 import 與 barrel 後去未用導出；去陳依賴並驗 install/lockfile；證無環境/部署路徑依賴後刪舊 flag。
- **Anti-patterns**：盲信 `knip`；因無直接 importer 而刪框架入口；未查外部消費者而去庫公共導出；刪 CI/發布自動化所用 script。
- **Validation**：重跑工具；依賴變則驗 install；tests、typecheck、build。
- 評：敗於混「未 import」與「未用」。現代倉藏用法於 config、反射、框架約定、外部消費者。

## Lane 4: Circular Dependencies

- **Inspect**：`madge` 結果；barrel 周之 import 圖；越界之 feature→feature import；type-only 誤成運行 import；共享工具悄依上層。
- **Evidence**：具體循環路徑；運行後果或維護成本；環中各節點所有權；證所提抽取/邊界改善方向性。
- **High-confidence**：運行 import→type-only（合法處）；中性共享邏輯下移；拆生隱後邊之 barrel；抽小 interface/adapter 模塊反轉一依賴。
- **Anti-patterns**：小環大重寫；皆入 `shared`；引 service locator/全局注冊表避 import；非真需惰性卻以動態 import 掩環。
- **Validation**：重跑環檢；受影響簇之 typecheck 與定向測試；import 方向合意圖架構。
- 評：環多源於所有權不清或便利 import。正解常局部而平淡：移一 helper、刪一 barrel、一 type-only import。

## Lane 5: Strong Types

- **Inspect**：`any`、`unknown`、鬆散對象映射、寬聯合、可空瀑布；隱式 `any` 或推斷之弱邊界；schema 校驗器與解析器輸出；第三方/生成型；重複窄化邏輯（示缺共享型）。
- **Evidence**：真運行形或真源 schema；示必填與可選之用法點；外部者之上游型或文檔契約；證強型不對不確定輸入說謊。
- **High-confidence**：契約已知則 `any`→具體 interface/tagged union/泛型；`unknown` 僅留信任邊界且即窄化；外部輸入邊界引解析/校驗結果型；已有分支邏輯抽可重用 discriminated union。
- **Anti-patterns**：以猜測型代 `any`；將不確定推深；以斷言滅錯而無證；放寬型以避修真邊界。
- **Validation**：全 typecheck；解析/序列化/分支之聚焦測試；編譯錯因正當理由而減。
- 評：弱型即邊界不確定之症。強型唯當編碼真實，非代碼所願。

## Lane 6: Error Handling and Defensive Fallbacks

- **Inspect**：包局部純邏輯之籠統 try/catch；壓失敗之默認返回值；新舊行為並存之 fallback 分支；僅記日誌之吞錯 catch；無主之重試/恢復碼。
- **Evidence**：辨信任邊界抑內部不變量邊界；catch 是否添可觀測性、清理、轉譯、策略；調用者是否已處理；fallback 是否仍被依賴。
- **High-confidence**：去僅重包或壓內部錯之 catch；留將外部失敗譯為顯域錯之 catch；留資源管理所需之 `finally`；靜默 fallback 值→顯失敗路徑，由調用者決。
- **Anti-patterns**：刪不可信輸入之邊界校驗；未查調用者期望而將受控運維錯轉崩潰；留無主「以防萬一」fallback；不變量破而記日誌續行。
- **Validation**：錯誤例與邊界輸入之定向測試；驗日誌、退出碼、API 響應、清理行為；失敗浮於正確層。
- 評：防禦雜物多為遺留瘢痕。標準非「永不 catch」，乃「唯錯誤所有權真處 catch」。本倉 AGENTS.md：fail fast、no fallback data。

## Lane 7: Legacy, Deprecated, and Fallback Paths

- **Inspect**：`deprecated`、`legacy`、`compat`、`fallback`、`old`、`v1`、`temporary` 標記；雙路實現；舊 flag 與遷移腳手架；已去 API 之兼容 shim；許諾將刪之注釋。
- **Evidence**：活路徑之證；config、測試、搜索證舊路徑非必需；涉存儲數據/外部客戶者之遷移狀態所有權；監控/灰度碼已無需。
- **High-confidence**：一路明為準則刪死雙路；調用者已遷則去兼容包裝；off 路已廢之 flag 分支摺疊；數據形與部署穩則刪過期遷移 helper。
- **Anti-patterns**：未查版本支持而刪外部消費者之兼容碼；遷移未竟而去灰度安全；「或有用」而留雙路；刪碼而留廢注釋。
- **Validation**：準路徑之測試；config 與部署檢查；無殘留對已刪 flag/舊名之引用。
- 評：遺留因刪比增顯險而存。真險在所有權分裂與行為久而不明。本倉 AGENTS.md：「Replace and remove. No old implementation as fallback.」

## Lane 8: Comment Hygiene and AI Slop

- **Inspect**：無主無期之占位注釋與 TODO；復述顯碼之注釋；已過時之改寫進行中注釋；自誇或臆測注釋；生成腔散文、空抽象、泛節頭。
- **Evidence**：注釋仍合碼否；是否載名與結構不顯之知識；刪後是否該以更小更利之說明代之。
- **High-confidence**：刪僅復述之注釋；碼已遷則刪陳舊遷移/替換注釋；冗長說明→一短意圖注釋（必要時）；去 stub、假例、暗示未竟而無上下文之臆測註。
- **Anti-patterns**：刪載安全/協議/業務不變量之注釋；以另一層空話代具體文；留無主無觸發無下一步之 TODO；以注釋辯護本應簡化之晦碼。
- **Validation**：鄰近重構後注釋仍對齊；抽查要模塊可讀而無解釋膨脹。
- 評：注釋衛生非妝飾。陳舊散文主動誤導，尤在積多次半竟清理之倉。`ponytail:` 注釋乃有意記錄（名其上限與升級路），非 slop，留之。

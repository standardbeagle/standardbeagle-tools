---
description: "Compress context to fit within token limits while preserving signal"
allowed-tools: ["Read", "Write", "AskUserQuestion"]
---

Compress context to maximize information density while staying within token limits, using 2026 context engineering best practices.

## Context Compression Process

### 1. Analyze Current Context

Gather the context to compress:

**Question 1**: "What type of context needs compression?"
- Conversation history
- Retrieved documents (RAG)
- Code files
- System prompt
- Tool definitions
- Mixed content

**Question 2**: "What's your token budget?"
- Specific number
- Percentage of model's context window
- "As small as possible while preserving X"

### 2. Identify Preservation Priorities

**Question 3**: "What MUST be preserved?" (multiSelect: true)
- Key decisions and their rationale
- Unresolved issues/open questions
- Critical facts and figures
- Code changes and their purpose
- Action items and next steps
- User preferences and constraints

### 3. Apply Compression Techniques

#### Technique 1: Extractive Summarization
Keep only essential sentences:

```markdown
## Extractive Summary

### Before (X tokens)
[Original text with redundancy]

### After (Y tokens)
[Key sentences only, preserving critical information]

### Compression: XX%
```

#### Technique 2: Abstractive Summarization
Rewrite to be more concise:

```markdown
## Abstractive Summary

### Before
"The user initially wanted to implement feature X using approach A, but after discussing the trade-offs, we decided that approach B would be better because it offers better performance and is easier to maintain in the long term."

### After
"Switched from approach A to B for feature X: better performance and maintainability."

### Compression: XX%
```

#### Technique 3: Structured Compression
Convert prose to structured format:

```markdown
## Structured Compression

### Before (narrative)
"We discussed the authentication system. The user wants OAuth 2.0 with Google and GitHub providers. They prefer JWT tokens over sessions. The tokens should expire after 24 hours. We need to implement refresh tokens as well."

### After (structured)
Auth Requirements:
- Method: OAuth 2.0
- Providers: Google, GitHub
- Tokens: JWT (24h expiry)
- Refresh: Yes

### Compression: XX%
```

#### Technique 4: Reference Substitution
Replace repeated content with references:

```markdown
## Reference Substitution

### Before
"The AuthenticationService handles login. The AuthenticationService also handles logout. The AuthenticationService manages token refresh. The AuthenticationService validates sessions."

### After
"AuthService: handles login/logout, token refresh, session validation"

### Compression: XX%
```

#### Technique 5: Code Compression
For code context:

```markdown
## Code Compression

### Before (full implementation)
[Complete code file]

### After (signature + purpose)
```
// auth.ts - Authentication utilities
export async function login(creds): Promise<Token>
export async function logout(token): Promise<void>
export async function refresh(token): Promise<Token>
// Implementation: JWT-based, 24h expiry
```

### Compression: XX%
```

#### Technique 6: Conversation Summarization
For chat history:

```markdown
## Conversation Compression

### Before (full history)
Turn 1: [Full user message]
Turn 1: [Full assistant response]
Turn 2: [Full user message]
...

### After (summary + recent)
<conversation_summary>
Discussed: [Topic 1], [Topic 2]
Decided: [Decision 1], [Decision 2]
Open: [Question 1]
</conversation_summary>

<recent_turns>
[Last 2-3 turns in full]
</recent_turns>

### Compression: XX%
```

### 4. Verify Compression Quality

Check that compressed version preserves signal:

```markdown
## Compression Verification

### Information Preservation Test
- [ ] Can answer: What are the key decisions?
- [ ] Can answer: What's left to do?
- [ ] Can answer: What were the constraints?
- [ ] Can answer: What was the rationale?

### Reconstruction Test
Given only the compressed context, could someone:
- [ ] Continue the conversation naturally?
- [ ] Make correct decisions?
- [ ] Avoid repeating past discussions?

### Signal-to-Noise Improvement
- Original SNR: [estimate]
- Compressed SNR: [estimate]
- Improvement: XX%
```

### 5. Generate Compressed Output

```markdown
## Compression Results

### Summary Statistics
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Tokens | X | Y | -Z% |
| Key facts | N | N | 0 |
| Decisions | N | N | 0 |
| Open items | N | N | 0 |

### Compressed Context
[Final compressed version]

### What Was Removed
- Redundant greetings and pleasantries
- Repeated explanations
- Verbose descriptions replaced with concise summaries
- Historical context no longer relevant
- [Other removed content]

### What Was Preserved
- All decisions with rationale
- Open questions and next steps
- User requirements and preferences
- Critical technical details
- [Other preserved content]
```

### 6. Compression Templates

#### For RAG Documents
```markdown
<compressed_context>
<source file="[filename]" tokens="[count]">
[Key excerpts with line numbers]
</source>
<summary>
[Abstractive summary of document]
</summary>
</compressed_context>
```

#### For Code Context
```markdown
<code_context>
<file path="[path]" purpose="[description]">
[Signatures and key logic only]
</file>
<changes>
[Recent modifications with rationale]
</changes>
</code_context>
```

#### For Conversation
```markdown
<session_context>
<decisions>
- [Decision 1]: [Rationale]
</decisions>
<open_items>
- [Item 1]: [Status]
</open_items>
<preferences>
- [Preference 1]
</preferences>
</session_context>
<recent_exchange>
[Last 2-3 turns]
</recent_exchange>
```

## Compression Best Practices

### When to Compress
- Approaching context limit (>70% usage)
- Conversation exceeds 10 turns
- Retrieved documents exceed budget
- Multiple code files loaded

### When Not to Compress
- Exact wording matters (legal, code)
- User explicitly wants verbatim content
- Compression would lose critical nuance
- Below 30% of context budget

### Iterative Compression
1. Start with aggressive compression
2. Test if critical information preserved
3. Add back content if needed
4. Re-compress different sections
5. Find optimal balance

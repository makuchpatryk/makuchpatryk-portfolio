---
name: portfolio-review
description: Review code for correctness, quality, performance, security, and test coverage. Triggers on "review", "check this code", "code review", "/review" — whenever user wants feedback on uncommitted changes. Reviews staged files, modified files, or user-specified files. Reports all findings ranked by severity (critical first) with suggested fixes. Explores project patterns and checks changes against the project's docs/ARCHITECTURE.md and docs/CODE_QUALITY.md. Does NOT auto-fix; user decides whether to apply suggestions.
compatibility: Reads git status, reviews uncommitted changes, explores project codebase
---

## When to Use This Skill

Use when user explicitly says: "review this", "code review", "check my code", "find issues", "review changes", or "/review". 

This skill reviews uncommitted code changes and provides feedback on:
- **Bugs & Correctness**: Logic errors, crashes, data corruption, edge cases
- **Code Quality**: Style violations, DRY violations, simplification opportunities, readability
- **Performance**: N+1 queries, inefficient algorithms, memory leaks, unnecessary allocations
- **Security**: SQL injection, XSS, auth bypass, credential leaks, unsafe patterns
- **Tests**: Missing test coverage, untested branches, test gaps for new functionality
- **Docs conformance**: Violations of the project's own `docs/ARCHITECTURE.md` (layers, conventions, decisions) and `docs/CODE_QUALITY.md` (KISS, YAGNI, DRY, separation of concerns, SOLID, Law of Demeter, composition over inheritance), and docs left stale by the change

## Workflow

### Phase 0: Scope & Discover

Determine what to review:

1. **Check git status**: Are there staged files? Modified files? Untracked files?
2. **Ask if needed**: "Should I review staged changes, all modified files, or specific files you mention?"
3. **Read the project docs**: project docs: `docs/ARCHITECTURE.md` (structure, layers, conventions) and `docs/CODE_QUALITY.md` (KISS, YAGNI, DRY, separation of concerns, SOLID, Law of Demeter, composition over inheritance, review checklist, known debt). If they live elsewhere (repo root, `docs/`), find them with a quick glob; if the project has neither, skip this step. These define what "correct" means for this project; the review is measured against them.
4. **Explore project**: Read existing code to understand patterns, conventions, architecture
5. **Set context**: Note language, framework, testing strategy, security requirements

### Phase 1: Review Uncommitted Changes

For each file in scope:

1. **Read the file**: Understand what changed and why
2. **Check against patterns**: Compare against existing project patterns and best practices
3. **Analyze for issues**: Look for bugs, quality problems, perf issues, security flaws, test gaps
4. **Check against the docs**, rule by rule (each is a documented, non-subjective standard):
   - `ARCHITECTURE.md`: is each change in the right layer/directory, following the documented routing, data, i18n, theme and SEO conventions and the decisions table (no re-introducing a rejected approach)?
   - `CODE_QUALITY.md`: KISS (needless complexity), YAGNI (speculative props/options/abstractions, dead code), DRY (duplicated knowledge, third copy of the same markup/logic), separation of concerns (domain rule in a template, Nuxt import in a pure util, sentence hard-coded outside i18n), SOLID (mixed responsibilities, wide props, untestable seams), Law of Demeter (reaching through objects instead of passing flat values), composition over inheritance (`extends`, mixins, base components)
   - Does the change touch anything the docs describe (structure, commands, env vars, decisions) without updating them? Does it add to, or fix, an item in "Known debt"?
5. **Categorize findings**: Critical, Warning, Suggestion, Nitpick

### Phase 2: Evaluate Findings

For each finding:

1. **Assess severity**:
   - **Critical**: Crashes, data loss, security breach, logic error that breaks feature
   - **Warning**: Code smell, performance problem, missing test, style violation affecting readability
   - **Suggestion**: Simplification opportunity, edge case, minor optimization
   - **Nitpick**: Style preference, comment clarity (low priority)

2. **Provide evidence**: Show exact line/code causing the issue
3. **Suggest fix**: Offer code snippet or refactoring approach
4. **Explain why**: Why this matters and what happens if ignored

### Phase 3: Report Findings

Report ONLY findings that are either:
- **Objectively wrong** (logic error, crashes, security flaw)
- **High-impact** (perf problem, missing critical test, architectural inconsistency)
- **A clear violation of a rule written in the project docs** (cite the doc and section, e.g. `CODE_QUALITY.md › DRY`, `ARCHITECTURE.md §4`), or a doc left stale by the change. A documented rule is not a style preference. Default severity: Warning; Critical only if it also breaks behavior

Findings the docs already list under "Known debt" are not new findings unless the change makes them worse.

Do NOT report:
- Subjective style preferences (unless project has lint rules that enforce them)
- Single-line cleanups that don't affect readability
- Theoretical edge cases unlikely to occur in practice

**Format findings as:**
```
## [CRITICAL] Issue Name

**File**: src/auth/login.js:45  
**Rule**: (only for docs violations) CODE_QUALITY.md › Separation of concerns  
**Issue**: Password stored in plaintext  
**Evidence**: `user.password = password;` (should be hashed)  
**Suggested Fix**:
```javascript
user.password = bcrypt.hashSync(password, 10);
```
**Why**: Passwords must be hashed. Storing plaintext is a security breach.  
**Risk if ignored**: User accounts compromised if database leaked.
```

### Phase 4: Suggest Fixes (Don't Apply)

For each finding:
1. Show the problematic code
2. Show what it should be
3. Explain the fix (1-2 sentences)
4. Do NOT modify the actual file (user decides if they want to apply it)

## Scoping Rules

**Review these files:**
- Staged files (git add)
- Modified files since last commit (git status)
- Files user explicitly names ("review src/auth.js")

**Don't review:**
- Unchanged files
- Deleted files (unless they broke something)
- Vendor code / node_modules
- Generated files (unless user asks)

## What Good Looks Like

**Good code review:**
- Finds real bugs (not hypothetical)
- Explains why it matters
- Suggests actionable fixes
- Ranked by severity (critical first)
- Aware of project patterns and holds the change to the project's own written rules (cites the doc section)
- Doesn't nitpick trivial things

**Weak code review:**
- Complains about style without context
- Finds issues but no fixes suggested
- All findings treated equally (not ranked)
- Doesn't understand project patterns
- Too many low-value findings (drowns out real issues)

## Integration with portfolio-implement

This skill works standalone. However:
- If code came from portfolio-implement skill, review will focus on implementation quality
- If code came from user edits, review will check correctness and patterns
- Can review partial implementations or work-in-progress code

The skill doesn't require portfolio-implement to have run first—any uncommitted code can be reviewed.

## Tech-Stack Agnostic

Works with any language/framework:
- **Backend**: Node.js, Python, Go, Ruby, Java, etc.
- **Frontend**: React, Vue, Angular, etc.
- **SQL**: PostgreSQL, MySQL, etc.
- **Tests**: Jest, pytest, RSpec, etc.

The review approach is the same: understand patterns, check against best practices, rank by severity.

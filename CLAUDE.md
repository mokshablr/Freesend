# CLAUDE.md — Freesend

## Vault Access

Read vault files (`~/Documents/Claude/Projects/freesend/`) only when:
- The user explicitly asks you to check, recall, or reference prior work
- You need historical context to resolve an ambiguity or answer a question about past decisions

Do NOT proactively read vault files at session start.

---

## Session End

At the end of each session, if anything meaningful changed in the project (new features, decisions, bugs fixed, direction shifts), update the vault:
- Write a log to `~/Documents/Claude/Logs/session_<YYYY-MM-DD>_<N>.md`
- Update `~/Documents/Claude/Projects/freesend/progress.md` with current state and next steps

Only do this if there is something worthwhile to record. Skip if the session was trivial.

---

## Project

**Freesend** — open-source self-hostable email API layer over user-owned SMTP servers.

- Local path: `~/Desktop/Arjun/github-repos/Freesend/`
- Version: 0.3.1
- Self-hosted only (no hosted instance)

---

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

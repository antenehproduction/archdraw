# Claude Code Guide — ArchDraw Intel

## What is Claude Code?

Claude Code is Anthropic's CLI tool that gives Claude direct access to your local filesystem, terminal, and git. Unlike Claude.ai chat, Claude Code can read your actual files, run commands, and commit changes directly — no copy-pasting required.

---

## Installation

### Requirements
- Node.js 18 or higher
- An Anthropic API key (`sk-ant-...`)

### Install

```bash
npm install -g @anthropic-ai/claude-code
```

Verify:
```bash
claude --version
```

---

## First-time setup

### 1. Set your API key

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

To make it permanent, add to your shell profile:

```bash
# ~/.zshrc or ~/.bashrc
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key-here' >> ~/.zshrc
source ~/.zshrc
```

### 2. Clone the repo

```bash
git clone https://github.com/antenehproduction/Premit-Ready.git
cd Premit-Ready
```

### 3. Launch Claude Code

```bash
claude
```

Claude Code will:
- Read `CLAUDE.md` automatically (the project context file)
- Show you the available tools (read, write, bash, git)
- Give you a `>` prompt to start working

---

## How to use it

### The prompt

Type natural language instructions exactly like you would in Claude.ai chat:

```
> Fix the API connection bug in probeConnection()
> Add door swing arcs to the floor plan renderer
> Show me all the places that call callAI() directly
> What is the current version number shown in the title block?
```

Claude Code reads `index.html`, understands the whole codebase, makes the edit, and you review it.

### Review every change

Claude Code shows you a diff before writing any file:

```
Edit index.html (3 changes):

  Line 520: - const headers={'Content-Type':'application/json'};
            + const headers={'Content-Type':'application/json','anthropic-version':'2023-06-01'};

Accept? [y/n/e] 
```

- `y` — accept and write
- `n` — reject
- `e` — open in editor to modify

### Multi-step tasks

Claude Code can chain operations:

```
> Compare probeConnection in v13 vs v14, explain what broke, then fix it in index.html
```

It will read both files, analyze them, explain its reasoning, show the diff, then apply if you approve.

---

## Recommended workflows

### Daily development session

```bash
cd Premit-Ready
git pull                    # get latest from GitHub
claude                      # start Claude Code
```

First message each session:
```
> Summarize the current state of the project and active bugs
```
Claude Code reads CLAUDE.md and gives you a status report.

### Fix a specific bug

```
> The floor plan sheet A-2 doesn't show room dimension labels when zoomed out.
> Find the relevant code and fix it.
```

### Add a feature

```
> Add a button to the checklist panel that exports all checked items 
> as a formatted PDF report including the project address and date.
```

### Debug a log error

Paste the log output directly:
```
> I got this error in the LOG panel:
> [ERROR] callJSON: ALL parse strategies failed. Raw preview: ```json { "meta": { "projectName":
> Fix the issue.
```

### Before committing

```
> Run through the testing checklist in CLAUDE.md and tell me what to verify manually
```

### Commit and push

Claude Code can run git commands:
```
> Commit the current changes with message "Fix door swing arcs on A-2 floor plan"
```

Or do it yourself:
```bash
git add index.html
git commit -m "Fix door swing arcs on A-2 floor plan"
git push
```

---

## Project-specific commands to know

### "What does X do?"
```
> Explain how localFloorPlan() calculates the ADU position
> What is the TL_MAP object used for?
> Walk me through the 7 pipeline phases
```

### "Show me where X is"
```
> Find all the places where S.plan is set
> Show me the probeConnection function
> Where is the structural grid drawn?
```

### "Fix X without breaking Y"
Always be specific about constraints:
```
> Increase the zoning JSON token limit to 2000.
> Do NOT change the timeout — keep it at 90s.
> Do NOT modify saveKey or probeConnection.
```

### "Compare versions"
```
> Read archdraw-intel-v13.html and the current index.html.
> List every difference in the connection functions.
```

---

## Key files

| File | Purpose |
|------|---------|
| `index.html` | The entire application |
| `CLAUDE.md` | Context for Claude Code — read on every session |
| `README.md` | Public documentation |
| `.claude/settings.json` | Claude Code permissions |
| `.github/workflows/deploy.yml` | Auto-deploy to GitHub Pages on push to main |

---

## GitHub Pages setup (one-time)

After pushing, enable Pages:

1. Go to `https://github.com/antenehproduction/Premit-Ready/settings/pages`
2. Under **Source**, select **GitHub Actions**
3. Save

The workflow `.github/workflows/deploy.yml` handles the rest. Every push to `main` auto-deploys to:
```
https://antenehproduction.github.io/Premit-Ready
```

---

## Branching strategy

```
main          ← production, always working version
dev           ← active development (create this)
fix/api-v14   ← isolated fix branches
```

Create a fix branch:
```bash
git checkout -b fix/api-v14
```

After Claude Code fixes the issue:
```bash
git add index.html
git commit -m "Fix: restore working probeConnection from v13"
git push -u origin fix/api-v14
```

Then open a Pull Request on GitHub to merge into `main`.

---

## Prompting tips for this project

**Be specific about the file structure:**
> "In the `<script>` block of index.html, inside `runPhase_zone()`, raise the callJSON token limit from 1500 to 2000."

**Reference CLAUDE.md rules:**
> "Fix the ADU rear setback overflow bug (GEOM-2 in CLAUDE.md). Do not change any other geometry."

**Test after changes:**
> "After making the change, show me the exact modified lines and tell me what regression risks I should test manually."

**Prevent scope creep:**
> "Only change what is necessary. Do not refactor, rename, or restructure anything else."

---

## Common mistakes to avoid

| Don't | Do instead |
|-------|-----------|
| "Improve the code" | "Fix the specific bug described in GEOM-2 in CLAUDE.md" |
| Accept all diffs immediately | Read each diff carefully before pressing y |
| Commit without testing | Open index.html in browser, run through testing checklist first |
| Push to main directly | Use a branch, test, then PR |
| Let Claude add AbortController | Explicitly say "do not use AbortController" |
| Let Claude split into multiple files | Explicitly say "keep everything in index.html" |

---

## Troubleshooting Claude Code

**"command not found: claude"**
```bash
npm install -g @anthropic-ai/claude-code
# or if permissions error:
sudo npm install -g @anthropic-ai/claude-code
```

**"API key not set"**
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Claude Code reading wrong files**
Make sure you're in the `Premit-Ready` directory when you run `claude`.

**Changes not showing in browser**
Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows).

---

## Cost estimate

Claude Code uses your Anthropic API key directly.

| Task | Approx. cost |
|------|-------------|
| Short edit (< 50 lines) | $0.01–0.05 |
| Medium task (find + fix a bug) | $0.05–0.20 |
| Large refactor | $0.20–0.80 |
| Full session (1–2 hours) | $0.50–3.00 |

claude-sonnet-4-5 is the default model for Claude Code — fast and cost-effective for code edits.

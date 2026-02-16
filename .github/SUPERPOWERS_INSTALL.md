# Installing Superpowers for GitHub Copilot

## Prerequisites

- GitHub Copilot installed and configured
- Git installed

## Installation Steps

### 1. Clone Superpowers

Clone the superpowers repository to your local configuration directory:

```bash
git clone https://github.com/obra/superpowers.git ~/.github/copilot/superpowers
```

### 2. Create Copilot Instructions File

Create or edit your Copilot instructions file in this repository:

```bash
# Create .github directory if it doesn't exist
mkdir -p .github

# Create or edit copilot-instructions.md
cat > .github/copilot-instructions.md << 'EOF'
# Superpowers Skills System

Before starting any significant work, check if a relevant skill applies from the superpowers library.
Skills location: ~/.github/copilot/superpowers/skills/

## Core Skills to Consider

- **using-superpowers**: Read first – explains how skills work
- **brainstorming**: Use before any creative work (features, components, modifications)
- **test-driven-development**: Use when implementing any feature or bugfix
- **systematic-debugging**: Use when encountering any bug or unexpected behavior
- **writing-plans**: Use when you have specs for multi-step tasks
- **verification-before-completion**: Use before claiming work is complete

When a skill might apply (even 1% chance), read the SKILL.md file and follow it. Skills are NOT optional. If a skill applies, use it.

## Available Skills

Check ~/.github/copilot/superpowers/skills/ for the full list of available skills.
Each skill directory contains a SKILL.md file with detailed instructions.
EOF
```

### 3. Symlink Skills (Optional)

For easier access, you can create a symlink to the skills directory:

```bash
mkdir -p ~/.github/copilot/skills
rm -rf ~/.github/copilot/skills/superpowers
ln -s ~/.github/copilot/superpowers/skills ~/.github/copilot/skills/superpowers
```

### 4. Restart GitHub Copilot

Restart your editor or IDE to reload GitHub Copilot with the new instructions.

Verify by asking Copilot: "do you have superpowers?"

## Usage

### Finding Skills

List available skills:

```bash
ls ~/.github/copilot/superpowers/skills/
```

### Using a Skill

Reference skills in your conversations with Copilot:

```
Load and follow the superpowers/brainstorming skill for this feature
```

or

```
Apply the test-driven-development skill to this implementation
```

### Project Skills

Create project-specific skills in `.github/skills/` within your project:

```bash
mkdir -p .github/skills/my-skill
```

Create `.github/skills/my-skill/SKILL.md`:

```markdown
---
name: my-skill
description: Use when [condition] - [what it does]
---

# My Skill

[Your skill content here]
```

**Skill Priority:** Project skills > Personal skills > Superpowers skills

## Updating

Update the superpowers repository:

```bash
cd ~/.github/copilot/superpowers
git pull
```

## Troubleshooting

### Skills not being recognized

1. Verify the superpowers clone location:
   ```bash
   ls ~/.github/copilot/superpowers/skills/
   ```

2. Check that copilot-instructions.md exists in your project:
   ```bash
   cat .github/copilot-instructions.md
   ```

3. Restart your editor/IDE to reload Copilot configuration

### Copilot not following skills

1. Make sure to explicitly mention the skill in your prompt
2. Reference the skill path when asking for help
3. Ensure the SKILL.md file is properly formatted with frontmatter

### Integration with GitHub Copilot Chat

When using GitHub Copilot Chat:
- Skills are automatically available through the instructions file
- Reference skills by name in your chat prompts
- Copilot will read and follow the skill's instructions

## Getting Help

- Report issues: https://github.com/obra/superpowers/issues
- Full documentation: https://github.com/obra/superpowers
- For GitHub Copilot support: https://github.com/github/copilot-docs

## Notes

- These instructions adapt the superpowers workflow for GitHub Copilot
- The original superpowers framework was designed for Claude Code but works with any AI coding assistant
- Skills are markdown files that guide the development workflow

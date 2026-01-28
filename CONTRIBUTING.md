# Contributing to This Portfolio

Thank you for your interest in this product delivery portfolio! This document explains how this repository is structured and maintained.

## 📝 Purpose

This is a **personal portfolio** showcasing product development methodology and technical architecture skills. It is not an active open-source project seeking contributions, but rather a demonstration of professional work.

## 🎯 What This Repository Contains

- **Product architecture documentation**: Detailed designs for example products
- **Design decision rationale**: Explanations of technical and product choices
- **Code examples**: Clean-room implementations demonstrating capability
- **Process documentation**: How AI-assisted development is used effectively

## ⚠️ Important Guidelines

### What This Repository MUST NOT Contain

1. **No Proprietary Code**: Never commit code from past employers or clients
2. **No Secrets**: No API keys, passwords, tokens, or credentials
3. **No Personal Information**: No real customer data or PII
4. **No Copyrighted Content**: No proprietary algorithms or business logic from other companies

### What This Repository SHOULD Contain

1. **Clean-room implementations**: Built from scratch for demonstration
2. **Generic patterns**: Publicly available design patterns and practices
3. **Original writing**: Personal insights and architectural decisions
4. **Synthetic data**: Fictional examples for demonstration purposes

## 🔍 Verification Before Committing

Before committing any changes, verify:

```bash
# Check for secrets or sensitive data
git diff | grep -i "secret\|password\|api_key\|token\|credential"

# Check for proprietary references
git diff | grep -i "proprietary\|confidential\|internal"

# Review all changes
git diff
```

## 📋 Content Standards

### Architecture Documents

Each `architecture.md` should include:
- ✅ Problem statement and user research
- ✅ System architecture and design decisions
- ✅ Data models with clear rationale
- ✅ Technology choices with alternatives considered
- ✅ Tradeoffs and decision-making process
- ✅ Clear distinction between AI and human contributions

### Code Examples

Code in `/demo` directories should:
- ✅ Be written from scratch for this portfolio
- ✅ Demonstrate best practices and patterns
- ✅ Include clear comments explaining decisions
- ✅ Show both business logic and error handling
- ✅ Be incomplete/simplified if needed for clarity
- ✅ Include comments marking AI vs human contributions

### README Files

- ✅ Clear explanation of what's being demonstrated
- ✅ Honest about limitations and scope
- ✅ Links to relevant architecture documentation
- ✅ Setup instructions if code is runnable

## 🤖 AI-Assisted Development

This portfolio documents use of AI tools:

### What AI Can Do
- Generate boilerplate code
- Create initial documentation drafts
- Format and structure content
- Suggest patterns and approaches

### What Humans Must Do
- Make all architectural decisions
- Design data models and business logic
- Review and validate all AI-generated content
- Ensure no proprietary code is included
- Maintain quality and accuracy

### Documenting AI Contributions
Always mark AI contributions in code comments:
```typescript
// AI-generated boilerplate, human-reviewed
// Human-designed business logic
// Human decision: [explain reasoning]
```

## 🚀 Adding New Products

To add a new product example:

1. Create directory: `products/<product-name>/`
2. Write `architecture.md` following existing template
3. Optionally add `demo/` directory with code examples
4. Update root `README.md` to reference new product
5. Verify no proprietary code before committing

## ✅ Pre-Commit Checklist

- [ ] No proprietary code or business logic
- [ ] No secrets, credentials, or API keys
- [ ] No real customer data or PII
- [ ] Architecture decisions are clearly explained
- [ ] AI contributions are marked
- [ ] Code is clean-room implementation
- [ ] Documentation is clear and honest about scope
- [ ] Files follow existing structure and patterns

## 📫 Questions or Feedback

This portfolio is maintained by the repository owner as a professional showcase. While not actively seeking contributions, feedback on:
- Clarity of documentation
- Interesting architecture patterns to demonstrate
- Gaps in the portfolio

...is always welcome via GitHub issues.

## 📜 License

This portfolio is shared publicly for demonstration purposes. The architecture documentation and code examples are original work and may be referenced, but please do not copy large portions verbatim.

---

*Remember: This portfolio demonstrates thinking and process, not production code. The goal is to show how problems are approached, not to provide copy-paste solutions.*

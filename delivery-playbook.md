# Delivery Playbook

This playbook explains how I move from problem discovery to production delivery while keeping quality and clarity high.

## 1) Discovery & Scope
- Define the business problem and user pain points.
- Identify success metrics and constraints (budget, timeline, compliance).
- Capture assumptions and risks early.

## 2) Product Definition
- Write a crisp problem statement and target user profiles.
- Align on MVP scope (what is in/out).
- Draft workflows and acceptance criteria.

## 3) Architecture & Data Design
- Design system boundaries and component responsibilities.
- Model core entities and relationships.
- Choose technologies based on constraints and team capability.

## 4) Delivery Plan
- Break work into thin vertical slices.
- Establish testing strategy and quality gates.
- Define a rollout plan and monitoring needs.

## 4.1) Project Management Artifacts
- Feature plans with scope, risks, and acceptance criteria.
- Implementation checklists and validation steps.
- Release templates with rollback plans and post-release monitoring.
- Documentation index and naming conventions for traceability.

## 5) AI-Assisted Build
AI accelerates execution but never replaces accountability.

**AI is used for**
- Boilerplate scaffolding
- Refactoring and pattern consistency
- Draft documentation and diagrams
- Test template generation

**Human decisions remain for**
- Product prioritization and tradeoffs
- Architecture and data model decisions
- Security, privacy, and compliance
- Final code review and release readiness

## 6) Validation & Release
- Validate against success metrics.
- Conduct usability review with real workflows.
- Stage → production rollout with rollback plan.

## 6.1) Quality Gates
- Static analysis clean or within agreed thresholds.
- Unit + integration tests pass.
- Manual smoke tests for critical flows.
- Release notes + deployment checklist completed.

## 7) Post-Launch
- Monitor metrics and error rates.
- Collect user feedback.
- Iterate with targeted improvements.

---

*This playbook applies to clean-room portfolio work and production delivery alike.*

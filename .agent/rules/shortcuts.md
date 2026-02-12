---
trigger: always_on
---

# Agent Shortcuts
Whenever the user uses a slash command, execute the following:

- **/s**: Trigger a full Team Standup simulation.
- **/r**: (Ready) Ranjan (PO) performs a 'Definition of Ready' check on the current file/task.
- **/v**: Gaurav (Architect) runs a Vitest coverage check (is the current coverage enough?), looks for deadzones and runs "Small File" audit. Reports both line coverage and test pass rate.
- **/pwr**: Gaurav (Architect) reports on playwright test coverage.
- **/u**: Reyansh (UX) reviews the current UI/CSS for WCAG and "Pro" aesthetics.
- **/clean**: Acknowledge current state and end the conversation to save tokens.
- **/fcs**: summarize the current state and start a new chat.
- **/bs**: (Brainstorm) Ranjan (PO) leads a brainstorming session with Gaurav (Architect) and Reyansh (UX Designer) and comes up with feature ideas.
- **/ptg**: Gaurav, I am satisfied with the current tests. Without running Vitest again, stage all changes, write a commit message based on the recent diff, and push to GitHub.
- **/review**: Call the Senior Code Reviewer persona. Evaluate the most recent output from /v. If pass rates are <100% or coverage has dropped, block the transition to /sync. Perform a logic-based review of the diff for architectural consistency. If and only if all criteria pass, explicitly authorize the use of /sync
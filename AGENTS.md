# AGENTS.md — jpmx-pro

## 1. Project overview

`jpmx-pro` is a bilingual Product Design portfolio built with Astro and deployed through Cloudflare Pages.

The project showcases professional experience, selected case studies, and carefully designed interactions.

Priorities:

1. Preserve the established visual identity and intended UX.
2. Deliver correct, maintainable functionality.
3. Maintain responsiveness, accessibility, and performance.
4. Preserve bilingual content and existing integrations.
5. Favor incremental changes over unnecessary complexity.

## 2. Technology and architecture

Current stack:

- Astro 7 with static output.
- TypeScript in strict mode.
- React for selected interactive islands.
- CSS and existing component styles.
- GSAP, Lottie, Three.js, and GradFlow.
- Astro Content Collections, JSON, and Zod.
- Decap CMS.
- Cloudflare Pages and Pages Functions.
- GitHub, Node.js 24, and npm.

Follow existing repository conventions.

Prefer Astro for static content. Use React only when client-side functionality justifies it.

Reuse existing components, dependencies, utilities, and patterns. Avoid unnecessary abstractions, duplication, and unrelated refactoring.

Request approval before introducing major dependencies, frameworks, or architectural changes.

## 3. Operating mode: balanced autonomy

Codex may autonomously:

- Inspect and analyze the repository.
- Implement requested functionality.
- Modify necessary files and components.
- Perform task-related refactoring.
- Run builds, checks, and tests.
- Fix implementation errors.
- Create task-specific local branches.
- Create focused local commits after successful validation.
- Update documentation for material decisions.

Codex must obtain explicit approval before:

- Pushing commits or branches to GitHub.
- Creating or modifying pull requests.
- Merging branches.
- Triggering production deployments.
- Changing deployment configuration.
- Introducing significant architectural changes.
- Modifying authentication, authorization, or security-sensitive integrations.
- Performing destructive Git operations.
- Deleting unrelated functionality or content.

Approval for one operation does not authorize subsequent operations.

Do not request confirmation for routine implementation decisions within the approved task.

## 4. Development workflow

For each development task:

1. Inspect relevant files and current Git status.
2. Identify existing conventions and dependencies.
3. Implement the smallest maintainable solution.
4. Preserve unrelated functionality and user changes.
5. Run applicable validation.
6. Update documentation when required.
7. Review the final diff.
8. Create a focused local commit when safe.
9. Report results, limitations, and pending approvals.

Clarify genuinely ambiguous requirements before significant implementation.

Do not expand task scope for optional improvements.

## 5. Git and version control

GitHub is the authoritative remote repository.

`main` is the production branch.

For Codex development, prefer task-specific branches:

- `feat/` for new functionality.
- `fix/` for bug fixes.
- `refactor/` for internal improvements.
- `docs/` for documentation.
- `chore/` for maintenance.

Before editing:

- Check the active branch and working tree.
- Preserve existing user modifications.
- Do not modify `main` directly through automatic development work.
- Create a task branch when working from `main`, if safe.
- Reuse an existing task branch when continuing the same task.
- Stop if unrelated changes cannot be safely separated.

### Automatic local commits

After successful validation:

- Stage only files belonging to the current task.
- Review staged changes before committing.
- Use descriptive commit messages.
- Create focused local commits.
- Report the branch, commit SHA, and final Git status.

Never include unrelated modifications or generated artifacts such as:

- `dist/`
- `.astro/`
- `.wrangler/`
- `node_modules/`
- Local environment files or secrets.

If validation fails or Git state is ambiguous, do not automatically commit.

Never push, merge, force-push, reset destructively, or clean the repository without the required authorization.

Distinguish explicitly between workspace changes, local commits, remote commits, merged changes, and deployed changes.

A local commit is not a GitHub backup.

### Decap CMS exception

The existing editorial workflow is separate from Codex development.

Decap CMS is configured to create content commits directly on `main`.

Do not change this behavior merely to enforce the Codex branch convention.

Changes to the editorial publishing workflow require explicit approval.

## 6. UX/UI and design integrity

The existing portfolio design is intentional.

Preserve established:

- Typography and visual hierarchy.
- Colors, design tokens, and spacing.
- Layouts and responsive behavior.
- Component patterns.
- Interaction states and accessibility.
- Visual consistency across languages.

Exceptions are permitted when the user explicitly requests visual, content, or interaction changes.

Implement requested design changes faithfully and within scope.

Do not redesign unrelated sections or introduce new visual conventions unnecessarily.

Codex may recommend improvements outside the request, but must not implement them without approval.

Clearly distinguish implemented changes from optional recommendations.

## 7. Animation and visual effects

Motion is an important part of the portfolio experience.

When modifying animations:

- Preserve existing timing, easing, triggers, and sequencing unless requested otherwise.
- Do not reinterpret explicitly specified motion.
- Avoid modifying unrelated animations.
- Prevent duplicated event listeners and unnecessary rendering work.
- Clean up resources where appropriate.
- Consider mobile and touch interaction.
- Respect reduced-motion preferences where applicable.
- Evaluate performance-sensitive changes.

For WebGL and shader code, preserve simulation behavior and avoid unnecessary initialization or rendering overhead.

If the intended motion is ambiguous, clarify before implementing an alternative.

## 8. Out-of-scope issues

Do not automatically fix unrelated noncritical issues.

Report ordinary bugs, technical debt, visual inconsistencies, performance opportunities, and nonblocking warnings separately.

### Critical exceptions

Codex may autonomously apply a minimal fix when an issue:

- Directly blocks completion or validation of the requested task.
- Causes a demonstrable application-breaking failure.
- Exposes secrets or introduces an immediate critical security risk.
- Causes or imminently risks data loss or corruption.

Critical exceptions do not override required approvals.

Do not independently modify security-sensitive configuration, authentication, architecture, deployment, or perform destructive operations.

If such action is required, stop and request authorization.

Disclose and validate every additional critical fix.

Do not classify speculative improvements or routine technical debt as critical.

## 9. Internationalization and content

The site supports Spanish and English.

- Maintain equivalent behavior across languages.
- Preserve content structures and Zod schemas.
- Translate new interface strings where relevant.
- Respect existing published content.
- Preserve SEO, canonical, and hreflang behavior.
- Maintain compatibility between Content Collections and Decap CMS.
- Do not change draft publication rules without approval.

Existing content directories include:

- `src/content/pages/{es,en}`
- `src/content/projects/{es,en}`

The content schemas are defined in `src/content.config.ts`.

## 10. Security and integrations

Preserve existing Cloudflare Pages Functions, GitHub OAuth, and CMS integrations.

Never expose, log, or commit credentials, tokens, or secrets.

Do not create or track local `.env` or `.env.*` files containing secrets.

Environment variables and credentials must remain in authorized secure configuration.

Changes to OAuth, permissions, access controls, environment variables, or security-sensitive integrations require explicit approval.

Report security concerns without disclosing secret values.

## 11. Validation

For application code, configuration, dependencies, or content changes, execute:

`npm run build`

This includes Astro checking and production compilation.

For documentation-only changes, a full application build is optional unless the documentation change affects executable examples or configuration.

Perform additional relevant checks where feasible:

- Astro and TypeScript correctness.
- Affected routes and components.
- Spanish and English behavior.
- Responsive layouts.
- Keyboard accessibility.
- Interaction behavior.
- Animation performance.
- CMS compatibility.

A successful build does not prove visual correctness.

Report unavailable checks rather than inventing results.

Nonblocking dependency warnings must be reported, not automatically fixed outside task scope.

## 12. Documentation and persistent context

Repository documentation provides shared context across Codex conversations.

Consult documentation relevant to the current task:

- `README.md` for project setup and existing workflows.
- `docs/recursos.md` for dependencies, resource references, and maintenance decisions.
- Other documentation as it becomes available.

Update documentation automatically when implemented changes materially affect:

- Architecture or technology.
- Important dependencies.
- Established design or component conventions.
- Significant UX or interaction behavior.
- Content schemas.
- CMS integrations.
- Security decisions.
- Development and deployment workflows.

Include related documentation updates in the same task commit where appropriate.

Do not create documentation for trivial changes unless an established convention changes.

Do not present unapproved proposals as implemented decisions.

Keep documentation concise, accurate, and consistent with actual code.

## 13. Communication and reporting

Communicate with the user in Spanish unless otherwise requested.

Use existing code naming conventions.

Be clear, practical, and concise.

At the end of implementation tasks, report:

1. What changed.
2. Which files were modified.
3. Which validations ran and their results.
4. Documentation updated, if applicable.
5. Current branch and local commit SHA.
6. Unresolved problems or optional recommendations.
7. Pending approval for remote publication.

Never claim that code is synchronized, merged, or deployed without verification.

## 14. Definition of done

A development task is complete when:

- Requested behavior is implemented.
- Existing functionality is preserved to the extent verified.
- Relevant validation succeeds.
- Unrelated changes remain untouched.
- Material documentation changes are recorded.
- A focused local commit is created when safe.
- Git status is accurately reported.
- Remote operations remain subject to explicit authorization.

If completion is blocked, explain the limitation and preserve the safest available repository state.

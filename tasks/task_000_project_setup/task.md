# Task 000: Project Setup & Configuration

## Overview
Set up the React Native project with Expo, configure TypeScript, ESLint, Prettier, and all necessary development tools following the established architecture and guidelines.

## Description
Initialize the Salonnz UserApp React Native project with all foundational configurations, dependencies, and tooling required for development. This includes setting up the folder structure, configuration files, and base dependencies defined in ARCHITECTURE.md.

## Acceptance Criteria
- [ ] Expo project initialized with TypeScript template
- [ ] TypeScript configuration with strict mode enabled
- [ ] ESLint configured with React Native Community + TypeScript rules
- [ ] Prettier configured with project standards
- [ ] Project folder structure created (features/, shared/, services/, store/, validation/)
- [ ] Path aliases configured (@/* pointing to src/*)
- [ ] Base dependencies installed (React, React Native, Redux Toolkit, TanStack Query, Zod, etc.)
- [ ] Metro configuration updated for path aliases
- [ ] Development scripts added to package.json (lint, type-check, test)
- [ ] Git hooks configured for pre-commit linting
- [ ] Documentation files created (README, ARCHITECTURE reference)
- [ ] Environment configuration files (.env.example, .env.local)
- [ ] Expo Development Build configured
- [ ] EAS Build configuration created (eas.json)

## Dependencies
**Prerequisites:** None - this is the foundational task

**Blocked Tasks:** All other tasks depend on this setup

## Component Requirements
### New Components Created
None - setup/configuration only

### Updated Components
None

## API Requirements
None - no API calls in this task

## Validation Requirements
- Validate all configuration files against TypeScript schemas
- Ensure all path aliases resolve correctly
- Validate package.json dependencies against ARCHITECTURE.md

## Complexity Estimate
**L (Large)** - 2-3 weeks effort

This involves multiple configuration files, dependency management, and ensuring all tools work together properly.

## Priority Level
**P0 (Critical)** - This is the absolute prerequisite for all development

## Estimated Effort
120-160 hours

## Testing Requirements
- Verify TypeScript compilation succeeds
- Verify ESLint passes with no errors
- Verify Prettier formatting works correctly
- Test path aliases resolve in both TypeScript and Metro
- Verify all npm scripts execute successfully
- Test that development server starts without errors
- Verify EAS Build configuration is valid

## File Changes
### New Files Created
- `app.json` - Expo configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `metro.config.js` - Metro bundler configuration
- `eas.json` - EAS Build configuration
- `.gitignore` - Git ignore rules
- `package.json` - Dependencies and scripts

### Directory Structure Created
```
src/
├── features/           # Feature modules (domain-driven)
├── shared/             # Reusable components & utilities
├── services/           # External integrations
├── store/              # Global state management
└── validation/         # Zod schemas (to be populated)

```

### Configuration Files
All configuration files must follow the standards defined in DEVELOPMENT_GUIDELINES.md

## Notes
- Use Expo SDK version as specified in ARCHITECTURE.md
- Ensure compatibility with iOS 13+ and Android API Level 21+
- Use exact dependency versions from the approved architecture
- Reference DEVELOPMENT_GUIDELINES.md for all configuration standards

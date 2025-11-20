# Task 008: Logout & Session Management

## Overview
Implement logout functionality, session management, and device tracking.

## Acceptance Criteria
- [ ] Logout functionality
- [ ] Clear all stored auth data
- [ ] Session termination on server
- [ ] Multiple device logout option
- [ ] Confirm logout dialog
- [ ] Graceful logout handling
- [ ] Redirect to login after logout

## Components
- LogoutButton.tsx
- SessionManager.tsx
- ConfirmLogoutDialog.tsx

## API
- POST /auth/logout
- GET /auth/devices
- DELETE /auth/devices/:id

## Priority
P1 (High)

## Effort
30-40 hours

## Dependencies
task_007: Authentication State Management

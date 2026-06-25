# M7 — Human Agent Management

**Status:** TODO

## Goal
Admins invite human support agents (staff) to their workspace. Invited agents log in with the existing auth flow and handle escalated conversations via the Inbox API.

## Context
Currently `register` always creates an ADMIN user. There is no way to add AGENT-role users to a workspace. This milestone closes that gap.

## Flow
```
Admin → POST /api/staff/invite { email, name }
  → system creates User (role=AGENT, workspace=admin's workspace, enabled=true)
  → returns temp password (shown once, never stored plain)
  → agent logs in via existing POST /api/auth/login
  → admin can list, deactivate staff
```

## New Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/staff/invite` | Create AGENT-role user in workspace |
| GET | `/api/staff` | List all human agents in workspace |
| DELETE | `/api/staff/{id}` | Deactivate human agent (set enabled=false) |

## Files to Create / Modify
- `user/dto/StaffInviteRequest.java` — `@Email String email`, `@NotBlank String name`
- `user/dto/StaffResponse.java` — id, name, email, role, enabled
- `user/service/StaffService.java` — invite (check duplicate email in workspace), list, deactivate
- `user/controller/StaffController.java` — ADMIN only via `@PreAuthorize("hasRole('ADMIN')")`
- `user/entity/User.java` — add `boolean enabled = true` column
- `security/SecurityConfig.java` — add `@EnableMethodSecurity`
- `security/JwtAuthFilter.java` or `UserDetailsService` — reject disabled users on token validation

## Key Rules
- Inviting duplicate email in same workspace → `ConflictException`
- Admin cannot deactivate themselves
- Deactivated user's existing JWT tokens are rejected at filter time (check `user.enabled` during `loadUserByUsername`)
- Temp password: random 12-char alphanumeric — returned once in invite response, never stored plain (BCrypt-hashed in DB)
- All endpoints `@PreAuthorize("hasRole('ADMIN')")` — agents cannot manage other agents

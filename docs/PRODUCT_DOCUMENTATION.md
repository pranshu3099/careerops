# CareerOps Frontend Product Documentation

## Overview

CareerOps is a job application management dashboard for candidates who want a structured way to track applications, follow-ups, interviews, outcomes, and job search progress. The frontend provides the user-facing workspace for the CareerOps platform and connects to the backend API for authentication, application data, follow-up scheduling, interview workflows, settings, and account information.

The application is built with Next.js, React, Tailwind CSS, Recharts, Lucide icons, and React Hot Toast. It uses a dashboard-first layout with a persistent sidebar, top navigation bar, compact workspace pages, reusable modals, and API-backed hooks.

## Product Purpose

Job searching often becomes difficult when opportunities are spread across portals, referrals, recruiter messages, and company career pages. CareerOps gives users one organized interface to manage the full job application lifecycle. The frontend is designed to reduce manual tracking, surface timely follow-up actions, and give users a clear view of where each application stands.

The product focuses on practical job-search operations rather than generic note-taking. Users can quickly add applications, move them through valid statuses, manage interview rounds, review follow-up tasks, and understand their pipeline from dashboard summaries and analytics.

## Target Users

CareerOps is built for:

- Job seekers applying to multiple companies.
- Candidates managing several interview processes at the same time.
- Professionals who want reminders for follow-ups.
- Users who want visibility into offers, rejections, interviews, and stale applications.
- Candidates who prefer a dashboard workflow over spreadsheets.

## Frontend Architecture

The frontend uses the Next.js Pages Router and organizes the product into dashboard pages, reusable components, hooks, API helper modules, and shared context.

Primary technologies:

- Next.js 13 for routing and application rendering.
- React 18 for component state and UI composition.
- Tailwind CSS for styling.
- Recharts for dashboard analytics.
- Lucide React for icons.
- React Hot Toast for user feedback.

Core frontend layers:

- `src/pages`: Route-level pages.
- `src/components`: Dashboard UI, modals, auth screens, layout, and reusable controls.
- `src/hooks`: Data-fetching and state helpers.
- `src/lib`: API clients and auth utilities.
- `src/context`: Shared application data context.

## Navigation Structure

CareerOps uses a dashboard shell with a sidebar and navbar.

Main routes:

| Route | Purpose |
| --- | --- |
| `/` | Authentication entry point. |
| `/verify-email` | Email verification result page. |
| `/dashboard` | Main dashboard overview. |
| `/dashboard/application` | Full applications management workspace. |
| `/dashboard/application/interview` | Interview management workspace. |
| `/dashboard/followups` | Follow-up review workspace. |
| `/dashboard/settings` | User settings for follow-up alerts. |
| `/dashboard/profile` | Read-only profile and account logout page. |

The sidebar exposes Dashboard, Applications, Interviews, Follow-ups, Analytics, and Settings navigation. The navbar provides quick add-application access, notification affordance, profile menu, settings link, and logout.

## Authentication Experience

CareerOps supports local email/password login and Google OAuth login through the backend.

Frontend responsibilities:

- Render login and signup forms.
- Validate login and signup fields before API submission.
- Support Enter-to-submit for login and signup forms.
- Store access tokens in memory after successful login.
- Attempt access token refresh on app initialization.
- Fetch the current user through `/auth/me`.
- Show loading states while authentication is being initialized.
- Provide logout actions from both navbar and profile page.

Local signup validates:

- Name is required and must match the configured name rules.
- Email is required and must be valid.
- Password is required and must satisfy password rules.
- Confirm password is required and must match the password.

Local login validates:

- Email is required.
- Email format must be valid.
- Password is required.

## Dashboard Overview

The dashboard gives users a compact view of their job search state.

Dashboard sections:

- Summary cards.
- Due-soon follow-up alerts.
- Recent applications table.
- Upcoming follow-ups panel.
- Analytics overview.

The summary cards use live data for:

- Total applications.
- Scheduled interviews.
- Offers received.
- Accepted applications.
- Declined offers.
- Rejections.

The recent applications table shows a compact list of applications with status controls, interview actions, view/edit/delete actions, and frontend pagination.

## Application Management

Applications are the core entity of the product. Users can create, view, edit, delete, search, filter, sort, and update application statuses.

Application fields include:

- Company.
- Role.
- Location.
- Source/platform.
- Applied date.
- HR contact name.
- HR contact email.
- Status.
- Latest follow-up.

Supported statuses:

- Applied.
- Shortlisted.
- Interviewing.
- Offered.
- Accepted.
- Offer Declined.
- Rejected.
- Ghosted.

The full applications workspace at `/dashboard/application` includes:

- Page header and subtitle.
- Summary cards for application status counts.
- Search by company, role, or location.
- Status filter.
- Sort controls.
- Full-width applications table.
- Status transition controls.
- View details modal.
- Edit application modal.
- Delete confirmation modal.
- Cancelled follow-ups alert modal after deletion.

Application deletion is confirmed through a modal before the delete request is sent. On successful deletion, the frontend refetches applications and follow-ups, shows a success toast, and displays a follow-up cancellation alert when relevant.

## Status Transition Flow

CareerOps restricts application status movement to valid next steps.

Current frontend transition rules:

- Applied can move to Shortlisted or Rejected.
- Shortlisted can move to Interviewing.
- Interviewing can move to Offered or Rejected.
- Offered can move to Accepted or Offer Declined.

Accepted, Offer Declined, Rejected, and Ghosted are treated as closed statuses in the UI. Closed applications keep their historical details visible, but active status movement, follow-up actions, interview creation, interview editing, interview cancellation, and interview result updates are hidden.

The status transition UI is compact and appears near status badges. The frontend refetches applications, upcoming follow-ups, due-soon follow-ups, and application stats after status updates so dashboard data remains current.

For interviewing applications, the generic status transition control is replaced by interview-specific actions. This keeps the interview flow clear and avoids mixing application-level movement with interview round actions.

When an Offered application is marked Accepted or Offer Declined, the backend cancels pending follow-ups. The frontend shows a small success toast and refetches dependent data. If the backend rejects a transition, such as with `Invalid status transition`, the frontend displays that message and leaves the UI unchanged.

## Follow-Up Management

Follow-ups help users track pending recruiter or application actions.

The follow-up workspace at `/dashboard/followups` uses the `/followups` API and shows all follow-ups regardless of status.

Supported follow-up statuses:

- Pending.
- Sent.
- Failed.
- Cancelled.

The page provides:

- Summary cards for total, pending, sent, failed, cancelled, and due-soon follow-ups.
- Search by company or role.
- Status filter.
- Type filter.
- Sort controls.
- Grouped list layout.

Follow-ups are grouped into:

- Due soon.
- Upcoming.
- Completed / Cancelled.

Each follow-up item shows:

- Company and role.
- Location.
- Follow-up type.
- Scheduled date/time.
- Executed date/time when available.
- Message.
- Follow-up status.
- Sequence number.
- Related application status.
- View Application action.
- Update Status action when the related application has a valid next status.

Cancel and ignore backend actions are intentionally not exposed until backend support is available.

## Due-Soon Follow-Up Alerts

The dashboard includes a compact alert section for due-soon follow-ups. It calls `/followups/due-soon` on dashboard load and renders nothing when no alerts exist.

Each alert shows:

- Company.
- Role.
- Location.
- Scheduled date/time.
- Follow-up message.
- Current application status.
- Update Status action.
- View Application action.
- Optional local dismiss action.

Update Status opens the application status flow. After a successful update, due-soon follow-ups and upcoming follow-ups are refetched.

## Interview Management

CareerOps supports multi-round interview tracking for applications in the Interviewing status.

The interview workspace is available at:

`/dashboard/application/interview`

Interview capabilities:

- Fetch interviews across applications.
- Search by company or role.
- Sort interview groups.
- Show applications with no interview rounds but currently in Interviewing status.
- Create interview rounds.
- Edit scheduled interview details.
- Update interview results.
- Continue after passed rounds with next-round, offered, or rejected actions.

Interview fields:

- Round number, computed by the backend and shown as read-only history.
- Round name.
- Interview type.
- Interviewer.
- Scheduled date/time.
- Status.
- Result.
- Feedback.

Supported interview types:

- DSA.
- Technical.
- System Design.
- HR.
- Managerial.
- Behavioral.
- Take Home.
- Other.

Supported interview statuses:

- Scheduled.
- Completed.
- Cancelled.

Supported interview results:

- Passed.
- Failed.
- Pending.

Interview behavior:

- Users can create interviews only for applications already in Interviewing status.
- Creating an interview always creates a Scheduled interview on the backend.
- The frontend does not send round, status, or result when creating an interview.
- The frontend does not send round, status, or result when editing interview details.
- If no interview exists for an interviewing application, the UI shows Add Round 1.
- If the latest effective round was Cancelled, the UI shows Add Round for the same round number.
- If the latest effective round was Completed and Passed, the UI shows Add Round for the next round number and Proceed further actions.
- After a round exists, the UI shows an Update Result action when the result can still be updated.
- Passed results keep the application in Interviewing and show Proceed further actions.
- Failed results rely on backend behavior to move the application to Rejected, then the frontend refetches application and interview data.
- Pending results keep the application in Interviewing and keep result update available where appropriate.
- Cancel is shown only for Scheduled interviews and uses the dedicated cancel endpoint.
- Accepted and Offer Declined applications show interview history only. Add round, edit, cancel, and result update actions are hidden.

Interview API behavior:

- `POST /interviews` creates a scheduled interview using application ID, round name, type, interviewer, and scheduled date/time.
- `PATCH /interviews/:id` updates editable interview details such as round name, type, interviewer, scheduled date/time, and feedback.
- `PATCH /interviews/:id/cancel` cancels a scheduled interview.
- `PATCH /interviews/:id/result` updates the interview result and optional feedback.
- Allowed result values are Passed, Failed, and Pending.

## Modals and User Actions

CareerOps uses modals for focused actions that should not navigate away from the dashboard context.

Important modals:

- Add application modal.
- Edit application modal.
- Application details modal.
- Delete application confirmation modal.
- Cancelled follow-ups modal.
- Rescheduled follow-ups alert modal.
- Interview form modal.
- Interview result modal.
- Due-soon follow-up modal.

Modals use smooth open/close transitions and fixed full-screen backdrops. Form modals validate required fields and show loading states during API calls.

## Settings

The settings page at `/dashboard/settings` currently supports follow-up alert settings.

Settings available:

- Show follow-up alerts.
- Alert timing.

Alert timing options:

- Same day.
- 1 day before.
- 2 days before.

The page calls:

- `GET /settings/followup-alerts` on load.
- `PATCH /settings/followup-alerts` when settings change.

The UI shows loading, saving, success, and error states. When alerts are disabled, the timing control is visually de-emphasized and disabled.

## Profile

The profile page at `/dashboard/profile` is intentionally simple and read-only.

It shows:

- User initials.
- User name.
- User email.
- Personal information section.
- Account section with logout.

Profile editing is not exposed until backend support exists.

## Analytics

The dashboard analytics card uses real application data from context.

Current analytics:

- Applications per week for the latest six weeks.
- Status distribution across the user's applications.

The weekly chart groups applications by applied date. Each week starts on Monday and ends before the next Monday. The status chart counts applications by current status.

The analytics component handles:

- Loading state.
- Error state.
- Empty state when no applications exist.

## State Management and Data Fetching

The frontend uses a lightweight state approach based on React context and custom hooks.

Important state/data modules:

- `ApplicationsProvider`: Loads and shares application data across dashboard pages.
- `useCurrentUser`: Loads current user details from in-memory auth state and `/auth/me`.
- `useApplicationStats`: Loads application status counts.
- `useUpcomingFollowups`: Loads upcoming follow-ups.
- `useDueSoonFollowups`: Loads due-soon alert follow-ups.
- `useUserFollowups`: Loads all follow-ups.
- `useInterviews`: Loads interviews for one application.
- `useAllApplicationInterviews`: Loads and groups interviews across applications.

Hooks use mounted-state guards where needed to avoid setting state after a component unmounts.

## API Integration

The frontend communicates with the backend through helper modules in `src/lib`.

Primary API helpers:

- `api.js`: Token state, authenticated fetch wrapper, refresh token flow, and current user sync.
- `auth.js`: Login, signup, and logout helpers.
- `applications.js`: Application, stats, follow-up, due-soon, status update, edit, and delete helpers.
- `interviews.js`: Interview list, create, update, and result helpers.
- `settings.js`: Follow-up alert settings helpers.

Authenticated API requests use `apiFetch`, which adds the bearer token when available and includes cookies with requests. When a request returns unauthorized, the helper attempts to refresh the access token once and retries the original request if refresh succeeds.

## User Feedback and Error Handling

CareerOps uses a combination of inline validation, local loading states, disabled buttons, and toast messages.

Examples:

- Login and signup forms show field-level validation errors.
- Create, edit, delete, status update, interview, and settings flows show loading states.
- Successful actions show toast or inline success feedback.
- Failed API actions show readable error messages.
- Delete and destructive actions require confirmation.

## Responsive Design

The frontend is designed for desktop-first dashboard work while remaining usable on mobile.

Responsive behavior:

- Sidebar collapses on desktop and becomes a slide-in drawer on mobile.
- Navbar includes a mobile menu button.
- Controls stack vertically on small screens.
- Tables support horizontal scrolling.
- List/card layouts remain readable on mobile.
- Modals are centered and constrained for smaller screens.

## Design Principles

The interface is intentionally practical and compact.

Design goals:

- Keep dashboard pages dense but readable.
- Avoid marketing-style layouts inside the product.
- Use cards for summaries, modals, and repeated items.
- Use badges for statuses and compact action controls.
- Keep destructive actions explicit.
- Keep user-facing labels clear and short.
- Avoid exposing controls when backend behavior does not exist yet.

## Current Limitations

Current frontend limitations:

- Profile editing is not implemented.
- Email reminder settings are not exposed.
- Follow-up cancel and ignore actions are not exposed.
- Analytics are currently dashboard-level and derived from loaded application data.
- The sidebar includes an Analytics item, but analytics currently appears inside the main dashboard overview.
- Some auth behavior depends on backend cookie and OAuth redirect configuration.

## Future Opportunities

Possible frontend improvements:

- Dedicated analytics page.
- Profile editing.
- Account security settings.
- Email reminder preferences.
- Follow-up cancellation when backend support is available.
- Application activity timeline.
- Ghosting insights UI.
- Advanced analytics by source, company, role, and response time.
- Export applications to CSV.
- Global search across applications, follow-ups, and interviews.
- Notification center for due-soon alerts and interview reminders.

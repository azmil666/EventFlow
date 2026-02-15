/**
 * Dashboard component prop types
 * @typedef {Object} DashboardProps
 * @property {string} userId - User identifier
 @property {'admin'|'participant'|'mentor'|'judge'} role - User role

 */

/**
 * Widget component prop types
 * @typedef {Object} WidgetProps
 * @property {string} title - Widget title
 * @property {React.ReactNode} children - Widget content
 */

export const DashboardRoles = {
  ADMIN: 'admin',
  PARTICIPANT: 'participant',
  MENTOR: 'mentor',
  JUDGE: 'judge'
};

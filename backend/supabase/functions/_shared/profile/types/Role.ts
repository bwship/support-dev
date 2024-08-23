export const Role = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
  FAMILY_MEMBER: 'FAMILY_MEMBER',
  HELPER: 'HELPER',
  TEAM_ADMIN: 'TEAM_ADMIN',
  TEAM_OWNER: 'TEAM_OWNER',
} as const;

export type RoleType = typeof Role[keyof typeof Role];

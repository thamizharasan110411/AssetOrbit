export const ROLES = ['Admin', 'Asset Manager', 'Employee'];

export const ASSET_STATUSES = [
  'Available',
  'Assigned',
  'Under Maintenance',
  'Retired'
];

export const MAINTENANCE_STATUSES = ['Scheduled', 'In Progress', 'Completed'];

export function canManageAssets(user) {
  return ['Admin', 'Asset Manager'].includes(user?.role);
}

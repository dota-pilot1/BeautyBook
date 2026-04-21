export type PermissionSummary = {
  id: number;
  code: string;
  name: string;
  category: string;
};

export type Permission = PermissionSummary & {
  description?: string | null;
  createdAt: string;
};

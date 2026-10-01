// frontend\src\admin\typesAdmin\adminPanel.types.ts
export interface AdminStaffMember {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  role: "STAFF";
  createdAt?: string;
  updatedAt?: string;
}
export interface Employee {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  mobilePhone?: string;
  isActive?: boolean;
  storeId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  birthday?: string;
}

export interface EmployeeOrder {
  id: string;
  userId: string;
  employeeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
  targetHours?: number;
  color?: string;
  order?: number;
}

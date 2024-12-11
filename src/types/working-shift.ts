export interface WorkingShift {
  id: string;
  title: string;
  workHours: number;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftId: string;
  storeId: string;
  organizationId: string;
  color?: string;
  excludeFromCalculations?: boolean;
  createdAt: string;
  updatedAt: string;
}

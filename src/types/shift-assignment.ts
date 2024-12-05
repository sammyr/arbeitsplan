import { Employee } from './employee';
import { WorkingShift } from '.';

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  date: string;
  storeId: string;
  workHours: number;
  employee?: Employee;
  shift?: WorkingShift;
  createdAt: string;
  updatedAt: string;
}

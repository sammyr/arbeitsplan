import { Employee } from './employee';
import { WorkingShift } from './index';

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  date: string;
  storeId: string;
  employee?: Employee;
  shift?: WorkingShift;
}

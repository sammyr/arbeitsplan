'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dbService } from '@/lib/db';
import { Store } from '@/types/store';
import { Employee } from '@/types/employee';
import { WorkingShift } from '@/types/working-shift';
import { ShiftAssignment } from '@/types/shift-assignment';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<WorkingShift[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date('2024-12-09T21:25:47+01:00'); // Using the provided current time
    const date = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    return date;
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || authLoading) return;

      try {
        setIsLoading(true);
        console.log('Loading dashboard data for user:', user.uid);
        
        // Fetch all data for the organization
        const [storesData, employeesData, shiftsData, assignmentsData] = await Promise.all([
          dbService.getStores(user.uid),
          dbService.getEmployeesByOrganization(user.uid),
          dbService.getWorkingShiftsByOrganization(user.uid),
          dbService.getAllAssignmentsByOrganization(user.uid)
        ]);

        console.log('Dashboard data loaded:', {
          stores: storesData.length,
          employees: employeesData.length,
          shifts: shiftsData.length,
          assignments: assignmentsData.length
        });

        setStores(storesData);
        setEmployees(employeesData);
        setShifts(shiftsData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, authLoading]);

  // Filter assignments for current month
  const currentMonthAssignments = assignments.filter(assignment => {
    try {
      // Parse the date string in yyyy-MM-dd format
      const assignmentDate = new Date(assignment.date);
      const currentMonth = selectedDate.getMonth();
      const currentYear = selectedDate.getFullYear();
      
      return (
        assignmentDate.getMonth() === currentMonth &&
        assignmentDate.getFullYear() === currentYear
      );
    } catch (error) {
      console.error('Error parsing date:', assignment.date, error);
      return false;
    }
  });

  console.log('Dashboard state:', {
    selectedDate: selectedDate.toISOString(),
    totalAssignments: assignments.length,
    filteredAssignments: currentMonthAssignments.length,
    sampleDates: assignments.slice(0, 3).map(a => ({
      original: a.date,
      parsed: new Date(a.date).toISOString()
    }))
  });

  console.log('Current month assignments:', currentMonthAssignments);

  // Calculate statistics for current month
  const totalEmployees = employees.length;
  const totalStores = stores.length;
  const totalShifts = shifts.length;
  const totalAssignments = currentMonthAssignments.length;

  // Calculate assignments per store for current month
  const assignmentsPerStore = stores.map(store => ({
    name: store.name,
    count: currentMonthAssignments.filter(a => a.storeId === store.id).length
  })).filter(store => store.count > 0);

  // Calculate shifts per employee for current month
  const shiftsPerEmployee = employees.map(employee => ({
    name: `${employee.firstName} ${employee.lastName}`,
    count: currentMonthAssignments.filter(a => a.employeeId === employee.id).length
  })).filter(employee => employee.count > 0);

  // Chart data for assignments per store
  const storeChartData = {
    labels: assignmentsPerStore.map(store => store.name),
    datasets: [{
      label: 'Schichten pro Filiale',
      data: assignmentsPerStore.map(store => store.count),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
    }]
  };

  // Chart data for shifts per employee
  const employeeChartData = {
    labels: shiftsPerEmployee.map(emp => emp.name),
    datasets: [{
      label: 'Schichten pro Mitarbeiter',
      data: shiftsPerEmployee.map(emp => emp.count),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }]
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Ladeanimation entfernt, Container beibehalten */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="w-full lg:w-11/12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedDate(date => {
                  const newDate = new Date(date);
                  newDate.setMonth(date.getMonth() - 1);
                  return newDate;
                })}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-lg text-slate-600">
                {format(selectedDate, 'MMMM yyyy', { locale: de })}
              </div>
              <button
                onClick={() => setSelectedDate(date => {
                  const newDate = new Date(date);
                  newDate.setMonth(date.getMonth() + 1);
                  return newDate;
                })}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700">Filialen</h3>
              <p className="text-3xl font-bold text-emerald-600">{totalStores}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700">Mitarbeiter</h3>
              <p className="text-3xl font-bold text-emerald-600">{totalEmployees}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700">Schichten</h3>
              <p className="text-3xl font-bold text-emerald-600">{totalShifts}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700">Zuweisungen</h3>
              <p className="text-3xl font-bold text-emerald-600">{totalAssignments}</p>
              <p className="text-sm text-slate-500">im {format(selectedDate, 'MMMM', { locale: de })}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Assignments per Store Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Schichten pro Filiale</h3>
              <div className="h-[300px]">
                {assignmentsPerStore.length > 0 ? (
                  <Pie data={storeChartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    Keine Zuweisungen im ausgewählten Monat
                  </div>
                )}
              </div>
            </div>

            {/* Assignments per Employee Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Schichten pro Mitarbeiter</h3>
              <div className="h-[300px]">
                {shiftsPerEmployee.length > 0 ? (
                  <Bar data={employeeChartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    Keine Zuweisungen im ausgewählten Monat
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

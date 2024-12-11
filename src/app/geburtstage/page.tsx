'use client';

import { useState, useEffect } from 'react';
import { format, parse, addMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { useEmployees } from '@/hooks/useEmployees';
import PageTitle from '@/components/PageTitle';
import { Spinner } from '@/components/Spinner';

interface Employee {
  id: string;
  firstName: string;
  lastName?: string;
  birthday?: string;
}

interface GroupedBirthdays {
  [key: string]: Employee[];
}

export default function BirthdaysPage() {
  const { employees, loading, error } = useEmployees();
  const [groupedBirthdays, setGroupedBirthdays] = useState<GroupedBirthdays>({
    currentMonth: [],
    nextMonth: [],
    nextNextMonth: [],
    other: [],
  });

  useEffect(() => {
    const currentDate = new Date();
    const nextMonth = addMonths(currentDate, 1);
    const nextNextMonth = addMonths(currentDate, 2);

    const grouped = employees.reduce((acc: GroupedBirthdays, employee: Employee) => {
      if (!employee.birthday) return acc;

      const birthdayDate = parse(employee.birthday, 'yyyy-MM-dd', new Date());
      const birthdayMonth = birthdayDate.getMonth();
      const currentMonth = currentDate.getMonth();

      if (birthdayMonth === currentMonth) {
        acc.currentMonth.push(employee);
      } else if (birthdayMonth === nextMonth.getMonth()) {
        acc.nextMonth.push(employee);
      } else if (birthdayMonth === nextNextMonth.getMonth()) {
        acc.nextNextMonth.push(employee);
      } else {
        acc.other.push(employee);
      }

      return acc;
    }, {
      currentMonth: [],
      nextMonth: [],
      nextNextMonth: [],
      other: [],
    });

    // Sort employees within each group by day of month
    const sortByDay = (a: Employee, b: Employee) => {
      if (!a.birthday || !b.birthday) return 0;
      const dayA = parse(a.birthday, 'yyyy-MM-dd', new Date()).getDate();
      const dayB = parse(b.birthday, 'yyyy-MM-dd', new Date()).getDate();
      return dayA - dayB;
    };

    grouped.currentMonth.sort(sortByDay);
    grouped.nextMonth.sort(sortByDay);
    grouped.nextNextMonth.sort(sortByDay);
    grouped.other.sort((a, b) => {
      if (!a.birthday || !b.birthday) return 0;
      const dateA = parse(a.birthday, 'yyyy-MM-dd', new Date());
      const dateB = parse(b.birthday, 'yyyy-MM-dd', new Date());
      return dateA.getTime() - dateB.getTime();
    });

    setGroupedBirthdays(grouped);
  }, [employees]);

  const formatBirthday = (birthday: string) => {
    const date = parse(birthday, 'yyyy-MM-dd', new Date());
    return format(date, 'dd.MM.yyyy', { locale: de });
  };

  const renderBirthdaySection = (title: string, employees: Employee[]) => {
    if (employees.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">{title}</h2>
        <div className="space-y-4">
          {employees.map((employee) => (
            <div key={employee.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="text-slate-700">
                {employee.firstName} {employee.lastName}
              </div>
              <div className="text-slate-500">
                {employee.birthday && formatBirthday(employee.birthday)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title="Geburtstage" />
      
      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Ein Fehler ist aufgetreten beim Laden der Geburtstage.
          </div>
        ) : (
          <>
            {renderBirthdaySection('Geburtstage diesen Monat', groupedBirthdays.currentMonth)}
            {renderBirthdaySection('Geburtstage nächsten Monat', groupedBirthdays.nextMonth)}
            {renderBirthdaySection('Geburtstage übernächsten Monat', groupedBirthdays.nextNextMonth)}
            {renderBirthdaySection('Weitere Geburtstage', groupedBirthdays.other)}
          </>
        )}
      </div>
    </div>
  );
}

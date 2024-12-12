'use client';

import { useState, useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import PageTitle from '@/components/PageTitle';
import { Spinner } from '@/components/Spinner';

interface Employee {
  id: string;
  firstName: string;
  lastName?: string;
  birthday?: string;
  isActive?: boolean;
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
    console.log('Current employees:', employees);
    const currentDate = new Date();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    const nextNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2);

    // Nur aktive Mitarbeiter filtern und gruppieren
    const grouped = employees
      .filter((employee: Employee) => {
        console.log('Checking employee:', employee);
        return employee.isActive !== false;
      })
      .reduce((acc: GroupedBirthdays, employee: Employee) => {
        console.log('Processing employee:', employee);
        if (!employee.birthday) {
          console.log('No birthday for employee:', employee.firstName);
          return acc;
        }

        try {
          let birthdayDate;
          const birthday = employee.birthday;
          console.log('Processing birthday:', birthday);

          // Konvertiere das Datum in ein Date-Objekt
          if (birthday.includes('-')) {
            // Format: YYYY-MM-DD
            birthdayDate = new Date(birthday + 'T00:00:00');
            console.log('Parsed YYYY-MM-DD date:', birthdayDate);
          } else if (birthday.includes('.')) {
            // Format: DD.MM.YYYY
            const [day, month, year] = birthday.split('.');
            birthdayDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            console.log('Parsed DD.MM.YYYY date:', birthdayDate);
          } else {
            console.error('Invalid date format:', birthday);
            return acc;
          }

          if (isNaN(birthdayDate.getTime())) {
            console.error('Invalid date:', birthdayDate);
            return acc;
          }

          // Aktuelles Jahr für den Vergleich verwenden
          const thisYearBirthday = new Date(
            currentDate.getFullYear(),
            birthdayDate.getMonth(),
            birthdayDate.getDate()
          );

          console.log('This year birthday:', thisYearBirthday);
          console.log('Current month:', currentDate.getMonth());
          console.log('Birthday month:', birthdayDate.getMonth());

          // Gruppiere basierend auf dem Monat
          if (birthdayDate.getMonth() === currentDate.getMonth()) {
            console.log('Adding to current month:', employee.firstName);
            acc.currentMonth.push(employee);
          } else if (birthdayDate.getMonth() === nextMonth.getMonth()) {
            console.log('Adding to next month:', employee.firstName);
            acc.nextMonth.push(employee);
          } else if (birthdayDate.getMonth() === nextNextMonth.getMonth()) {
            console.log('Adding to next next month:', employee.firstName);
            acc.nextNextMonth.push(employee);
          } else {
            console.log('Adding to other:', employee.firstName);
            acc.other.push(employee);
          }
        } catch (error) {
          console.error('Error processing birthday for:', employee.firstName, error);
        }

        return acc;
      }, {
        currentMonth: [],
        nextMonth: [],
        nextNextMonth: [],
        other: [],
      });

    console.log('Grouped birthdays:', grouped);

    // Sortiere die Mitarbeiter nach Tag innerhalb jedes Monats
    const sortByDay = (a: Employee, b: Employee) => {
      if (!a.birthday || !b.birthday) return 0;

      try {
        const getDayFromDate = (birthday: string): number => {
          if (birthday.includes('-')) {
            return new Date(birthday + 'T00:00:00').getDate();
          } else {
            const [day] = birthday.split('.');
            return parseInt(day);
          }
        };

        const dayA = getDayFromDate(a.birthday);
        const dayB = getDayFromDate(b.birthday);

        console.log('Comparing days:', dayA, dayB);
        return dayA - dayB;
      } catch (error) {
        console.error('Error sorting by day:', error);
        return 0;
      }
    };

    grouped.currentMonth.sort(sortByDay);
    grouped.nextMonth.sort(sortByDay);
    grouped.nextNextMonth.sort(sortByDay);
    grouped.other.sort((a, b) => {
      if (!a.birthday || !b.birthday) return 0;

      try {
        const getDateFromBirthday = (birthday: string): Date => {
          if (birthday.includes('-')) {
            return new Date(birthday + 'T00:00:00');
          } else {
            const [day, month, year] = birthday.split('.');
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
        };

        const dateA = getDateFromBirthday(a.birthday);
        const dateB = getDateFromBirthday(b.birthday);

        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.error('Invalid date comparison:', dateA, dateB);
          return 0;
        }

        console.log('Comparing dates:', dateA, dateB);
        return dateA.getTime() - dateB.getTime();
      } catch (error) {
        console.error('Error sorting other birthdays:', error);
        return 0;
      }
    });

    console.log('Final grouped birthdays:', grouped);
    setGroupedBirthdays(grouped);
  }, [employees]);

  const formatBirthday = (birthday: string) => {
    if (!birthday) return '-';
    
    try {
      if (birthday.includes('-')) {
        // Format: YYYY-MM-DD
        const date = new Date(birthday + 'T00:00:00');
        if (isNaN(date.getTime())) {
          console.error('Invalid date in formatBirthday:', birthday);
          return birthday;
        }
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
      }
      return birthday; // Bereits im Format DD.MM.YYYY
    } catch (error) {
      console.error('Error formatting birthday:', error);
      return birthday;
    }
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

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Employee } from '@/types/employee';
import { Store } from '@/types/store';
import { Shift } from '@/types/shift';
import { LogEntry } from '@/types/log';

interface DbData {
  employees: Employee[];
  stores: Store[];
  shifts: Shift[];
  logs: LogEntry[];
}

const dbPath = path.join(process.cwd(), 'data/db.json');

export async function GET() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Initialize logs array if it doesn't exist
    if (!jsonData.logs) {
      jsonData.logs = [];
    }
    
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Error reading database:', error);
    return NextResponse.json(
      { error: 'Failed to read database' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data: DbData = await request.json();
    
    // Ensure logs array exists
    if (!data.logs) {
      data.logs = [];
    }
    
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing to database:', error);
    return NextResponse.json(
      { error: 'Failed to write to database' },
      { status: 500 }
    );
  }
}

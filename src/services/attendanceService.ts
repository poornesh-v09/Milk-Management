import type { AttendanceRecord, AttendanceSheet, AttendanceEntry } from '../types';

const API_BASE = 'http://localhost:5000/api';

// Get attendance sheet template for a specific date
export async function getAttendanceSheet(
    deliveryPersonId: string,
    date: string
): Promise<AttendanceSheet> {
    const response = await fetch(`${API_BASE}/attendance/sheet/${deliveryPersonId}/${date}`);
    if (!response.ok) {
        throw new Error('Failed to fetch attendance sheet');
    }
    return response.json();
}

// Check if attendance already exists for a date
export async function checkAttendanceExists(
    deliveryPersonId: string,
    date: string
): Promise<{ exists: boolean; attendance: AttendanceRecord | null }> {
    const response = await fetch(`${API_BASE}/attendance/check/${deliveryPersonId}/${date}`);
    if (!response.ok) {
        throw new Error('Failed to check attendance');
    }
    return response.json();
}

// Submit attendance for a date
export async function submitAttendance(
    date: string,
    deliveryPersonId: string,
    deliveryPersonName: string,
    entries: AttendanceEntry[]
): Promise<{ message: string; attendance: AttendanceRecord }> {
    const response = await fetch(`${API_BASE}/attendance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            date,
            deliveryPersonId,
            deliveryPersonName,
            entries,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit attendance');
    }

    return response.json();
}

// Get delivery person's attendance history
export async function getAttendanceHistory(
    deliveryPersonId: string,
    filters?: {
        date?: string;
        month?: string;
        year?: string;
        startDate?: string;
        endDate?: string;
        customerName?: string;
    }
): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.month) params.append('month', filters.month);
    if (filters?.year) params.append('year', filters.year);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = `${API_BASE}/attendance/history/${deliveryPersonId}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch attendance history');
    }
    return response.json();
}

// Get all attendance records (Admin view)
export async function getAdminAttendance(filters?: {
    date?: string;
    month?: string;
    year?: string;
    deliveryPersonId?: string;
    startDate?: string;
    endDate?: string;
    customerName?: string;
}): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.month) params.append('month', filters.month);
    if (filters?.year) params.append('year', filters.year);
    if (filters?.deliveryPersonId) params.append('deliveryPersonId', filters.deliveryPersonId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = `${API_BASE}/attendance/admin${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
    }
    return response.json();
}

// Get single attendance record by ID
export async function getAttendanceById(id: string): Promise<AttendanceRecord> {
    const response = await fetch(`${API_BASE}/attendance/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch attendance record');
    }
    return response.json();
}

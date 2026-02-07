import type { Customer, DeliveryMember, DeliveryRecord, ProductPrice as Price } from '../types';

const API_URL = 'http://localhost:5000/api';

// Helper to handle response
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || 'API request failed');
    }
    return response.json();
}

// Customers
export const fetchCustomers = async (): Promise<Customer[]> => {
    const res = await fetch(`${API_URL}/customers`);
    return handleResponse<Customer[]>(res);
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    const res = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
    });
    return handleResponse<Customer>(res);
};

export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    const res = await fetch(`${API_URL}/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return handleResponse<Customer>(res);
};

// Delivery Members
export const fetchDeliveryMembers = async (): Promise<DeliveryMember[]> => {
    const res = await fetch(`${API_URL}/members`);
    return handleResponse<DeliveryMember[]>(res);
};

export const createDeliveryMember = async (member: Omit<DeliveryMember, 'id'>): Promise<DeliveryMember> => {
    const res = await fetch(`${API_URL}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
    });
    return handleResponse<DeliveryMember>(res);
};

export const updateDeliveryMember = async (id: string, updates: Partial<DeliveryMember>): Promise<DeliveryMember> => {
    const res = await fetch(`${API_URL}/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return handleResponse<DeliveryMember>(res);
};

// Prices
export const fetchPrices = async (): Promise<Price[]> => {
    const res = await fetch(`${API_URL}/prices`);
    return handleResponse<Price[]>(res);
};

export const updatePrices = async (prices: Price[]): Promise<Price[]> => {
    const res = await fetch(`${API_URL}/prices/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prices),
    });
    return handleResponse<Price[]>(res);
};

// Delivery Records
export const fetchDeliveryRecords = async (date?: string, customerId?: string): Promise<DeliveryRecord[]> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (customerId) params.append('customerId', customerId);

    const res = await fetch(`${API_URL}/deliveries?${params.toString()}`);
    return handleResponse<DeliveryRecord[]>(res);
};

export const saveDeliveryRecord = async (record: DeliveryRecord): Promise<DeliveryRecord> => {
    const res = await fetch(`${API_URL}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
    });
    return handleResponse<DeliveryRecord>(res);
};

export const saveDeliveryRecordsBulk = async (records: DeliveryRecord[]): Promise<void> => {
    await fetch(`${API_URL}/deliveries/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records),
    });
};

export const fetchDashboardStats = async (): Promise<any> => {
    const res = await fetch(`${API_URL}/stats/dashboard`);
    return handleResponse(res);
};




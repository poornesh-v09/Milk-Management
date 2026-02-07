import type { Customer, DeliveryRecord, DeliveryMember, MonthlyReportItem, DeliveryItem, ProductType } from '../types';

const CUSTOMER_KEY = 'milk_app_customers';
const DELIVERY_KEY = 'milk_app_deliveries';
const MEMBERS_KEY = 'milk_app_members';
const MESSAGE_LOGS_KEY = 'milk_app_message_logs';
const PRICES_KEY = 'milk_app_prices';

// Initial dummy members
const initialMembers: DeliveryMember[] = [
    { id: 'm1', name: 'Ramesh (Route A)', mobile: '9800011122', route: 'North Extension', isActive: true },
    { id: 'm2', name: 'Suresh (Route B)', mobile: '9800033344', route: 'South Garden', isActive: true }
];

const defaultPrices: Record<ProductType, number> = {
    'Milk': 58,
    'Curd': 60,
    'Ghee': 650,
    'Paneer': 450,
    'ButterMilk': 20
};

// Initial dummy data with subscriptions
const initialCustomers: Customer[] = [
    {
        id: '1',
        name: 'Rajesh Kumar',
        address: '123, Gandhi Nagar, 2nd Cross',
        mobile: '9876543210',
        subscriptions: [
            { product: 'Milk', quantity: 2 },
            { product: 'Curd', quantity: 1 }
        ],
        joinDate: '2025-12-01',
        isActive: true,
        assignedTo: 'm1'
    },
    {
        id: '2',
        name: 'Priya Sharma',
        address: 'Flat 402, Sunshine Apts',
        mobile: '9123456780',
        subscriptions: [
            { product: 'Milk', quantity: 1 }
        ],
        joinDate: '2026-01-05',
        isActive: true,
        assignedTo: 'm2'
    },
];

export const getCustomers = (): Customer[] => {
    const stored = localStorage.getItem(CUSTOMER_KEY);
    if (!stored) {
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(initialCustomers));
        return initialCustomers;
    }
    return JSON.parse(stored);
};

export const addCustomer = (customer: Omit<Customer, 'id' | 'joinDate' | 'isActive'>): Customer => {
    const current = getCustomers();
    const newCustomer: Customer = {
        ...customer,
        id: Date.now().toString(),
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true,
    };

    const updated = [...current, newCustomer];
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(updated));
    return newCustomer;
};

export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | null => {
    const current = getCustomers();
    const index = current.findIndex(c => c.id === id);

    if (index === -1) {
        return null; // Customer not found
    }

    // Preserve ID and joinDate, update everything else
    const updatedCustomer: Customer = {
        ...current[index],
        ...updates,
        id: current[index].id, // Preserve original ID
        joinDate: current[index].joinDate // Preserve original join date
    };

    current[index] = updatedCustomer;
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(current));
    return updatedCustomer;
};

// Delivery Record Methods

export const getDeliveryRecords = (date: string): DeliveryRecord[] => {
    const stored = localStorage.getItem(DELIVERY_KEY);
    const allRecords: DeliveryRecord[] = stored ? JSON.parse(stored) : [];
    return allRecords.filter(r => r.date === date);
};

export const saveDeliveryRecord = (record: DeliveryRecord): void => {
    const stored = localStorage.getItem(DELIVERY_KEY);
    let allRecords: DeliveryRecord[] = stored ? JSON.parse(stored) : [];

    const existingIndex = allRecords.findIndex(r => r.id === record.id);
    if (existingIndex >= 0) {
        allRecords[existingIndex] = record;
    } else {
        allRecords.push(record);
    }

    localStorage.setItem(DELIVERY_KEY, JSON.stringify(allRecords));
};

export const bulkSaveDeliveryRecords = (records: DeliveryRecord[]): void => {
    const stored = localStorage.getItem(DELIVERY_KEY);
    let allRecords: DeliveryRecord[] = stored ? JSON.parse(stored) : [];

    // Create a map for faster lookup of existing records in the database
    const dbRecordMap = new Map(allRecords.map(r => [r.id, r]));

    records.forEach(record => {
        dbRecordMap.set(record.id, record);
    });

    localStorage.setItem(DELIVERY_KEY, JSON.stringify(Array.from(dbRecordMap.values())));
};

export const ensureDeliveryRecordsForDate = (date: string, customers: Customer[]): Record<string, DeliveryRecord> => {
    const existing = getDeliveryRecords(date);
    const map: Record<string, DeliveryRecord> = {};

    existing.forEach(r => map[r.customerId] = r);

    customers.forEach(c => {
        if (!map[c.id]) {
            // Handle both id locations if customer object passed or just flattened. 
            // Logic in component maps customer.id.
            const customerId = c.id;
            if (!map[customerId]) {
                const items: DeliveryItem[] = c.subscriptions.map(sub => {
                    const price = getProductPrices()[sub.product] || 0;
                    return {
                        product: sub.product,
                        quantity: sub.quantity,
                        status: 'Delivered',
                        priceCheck: price
                    };
                });

                map[customerId] = {
                    id: `${date}-${customerId}`,
                    date: date,
                    customerId: customerId,
                    items: items
                };
            }
        }
    });
    return map;
}

export const getMonthlyReport = (month: number, year: number): MonthlyReportItem[] => {
    const customers = getCustomers();
    const stored = localStorage.getItem(DELIVERY_KEY);
    const allRecords: DeliveryRecord[] = stored ? JSON.parse(stored) : [];

    const reportMap: Record<string, MonthlyReportItem> = {};

    // Initialize report for all customers who were active or have records
    customers.forEach(c => {
        reportMap[c.id] = {
            customerId: c.id,
            customerName: c.name,
            products: {},
            totalAmount: 0,
            totalLiters: 0
        };
    });

    // Filter records for the month
    const monthRecords = allRecords.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === month && d.getFullYear() === year;
    });

    monthRecords.forEach(record => {
        const reportItem = reportMap[record.customerId];
        if (!reportItem) return;

        record.items.forEach(item => {
            if (item.status === 'Delivered') {
                if (!reportItem.products[item.product]) {
                    reportItem.products[item.product] = { quantity: 0, cost: 0 };
                }

                let price = item.priceCheck || 0;
                if (!price) {
                    // Fallback lookup
                    const customer = customers.find(c => c.id === record.customerId);
                    const sub = customer?.subscriptions.find(s => s.product === item.product);
                    const product = sub?.product || item.product;
                    price = getProductPrices()[product as ProductType] || 0;
                }

                reportItem.products[item.product].quantity += item.quantity;
                const cost = item.quantity * price;
                reportItem.products[item.product].cost += cost;
                reportItem.totalAmount += cost;

                if (item.product === 'Milk') {
                    reportItem.totalLiters += item.quantity;
                }
            }
        });
    });
    return Object.values(reportMap);
};

// Price Management

export const getProductPrices = (): Record<ProductType, number> => {
    const stored = localStorage.getItem(PRICES_KEY);
    if (!stored) {
        localStorage.setItem(PRICES_KEY, JSON.stringify(defaultPrices));
        return defaultPrices;
    }
    return JSON.parse(stored);
};

export const updateProductPrices = (prices: Record<ProductType, number>): void => {
    localStorage.setItem(PRICES_KEY, JSON.stringify(prices));
};

export const calculateProductPrice = (product: string, quantity: number, _basePrice?: number): number => {
    const prices = getProductPrices();
    const rate = prices[product as ProductType] || 0;
    return quantity * rate;
};

export const getCustomerHistory = (customerId: string, month: number, year: number): { records: DeliveryRecord[], customer: Customer | null } => {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === customerId) || null;

    const stored = localStorage.getItem(DELIVERY_KEY);
    const allRecords: DeliveryRecord[] = stored ? JSON.parse(stored) : [];

    const records = allRecords.filter(r => {
        const d = new Date(r.date);
        return r.customerId === customerId && d.getMonth() === month && d.getFullYear() === year;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { records, customer };
};

// Message Logging Methods

export const saveMessageLog = (log: Omit<import('../types').MessageLog, 'id' | 'timestamp'>): void => {
    const stored = localStorage.getItem(MESSAGE_LOGS_KEY);
    const logs: import('../types').MessageLog[] = stored ? JSON.parse(stored) : [];

    const newLog: import('../types').MessageLog = {
        ...log,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
    };

    logs.push(newLog);
    localStorage.setItem(MESSAGE_LOGS_KEY, JSON.stringify(logs));
};

export const getMessageLogs = (month: number, year: number): import('../types').MessageLog[] => {
    const stored = localStorage.getItem(MESSAGE_LOGS_KEY);
    const allLogs: import('../types').MessageLog[] = stored ? JSON.parse(stored) : [];
    return allLogs.filter(l => l.month === month && l.year === year);
};

// Delivery Member Methods

export const getDeliveryMembers = (): DeliveryMember[] => {
    const stored = localStorage.getItem(MEMBERS_KEY);
    if (!stored) {
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(initialMembers));
        return initialMembers;
    }
    return JSON.parse(stored);
};

export const addDeliveryMember = (member: Omit<DeliveryMember, 'id'>): DeliveryMember => {
    const current = getDeliveryMembers();
    const newMember = { ...member, id: Date.now().toString() };
    const updated = [...current, newMember];
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(updated));
    return newMember;
};

export const updateDeliveryMember = (id: string, updates: Partial<DeliveryMember>) => {
    const current = getDeliveryMembers();
    const updated = current.map(m => m.id === id ? { ...m, ...updates } : m);
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(updated));
};

// Dashboard Stats

export interface DashboardStats {
    totalCustomers: number;
    activeCustomers: number;
    totalProducts: number;
    totalMembers: number;
    monthlyRevenue: number;
}

export const getDashboardStats = (): DashboardStats => {
    const customers = getCustomers();
    const members = getDeliveryMembers();
    const reports = getMonthlyReport(new Date().getMonth(), new Date().getFullYear());

    // Revenue
    const revenue = reports.reduce((sum, item) => sum + item.totalAmount, 0);

    return {
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c.isActive).length,
        totalProducts: 5, // Milk, Curd, Ghee, Paneer, ButterMilk
        totalMembers: members.length,
        monthlyRevenue: revenue
    };
};

// HELPER FUNCTIONS FOR DETAIL VIEWS

export interface CustomersByMember {
    member: DeliveryMember;
    customers: Customer[];
}

export const getCustomersByDeliveryPerson = (): CustomersByMember[] => {
    const customers = getCustomers();
    const members = getDeliveryMembers();

    return members.map(member => ({
        member,
        customers: customers.filter(c => c.assignedTo === member.id && c.isActive)
    }));
};

export interface TeamMemberStats {
    member: DeliveryMember;
    assignedCustomers: number;
    dailyDelivered: number;
    dailyPending: number;
    monthlyDelivered: number;
}

export const getTeamStatistics = (date?: string): TeamMemberStats[] => {
    const customers = getCustomers();
    const members = getDeliveryMembers();
    const todayStr = date || new Date().toISOString().split('T')[0];
    const todayRecords = getDeliveryRecords(todayStr);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const stored = localStorage.getItem(DELIVERY_KEY);
    const allRecords: DeliveryRecord[] = stored ? JSON.parse(stored) : [];

    return members.map(member => {
        const memberCustomers = customers.filter(c => c.assignedTo === member.id && c.isActive);

        // Today's stats
        const dailyDelivered = todayRecords.filter(r => {
            const customer = customers.find(c => c.id === r.customerId);
            return customer?.assignedTo === member.id;
        }).length;

        const dailyPending = memberCustomers.length - dailyDelivered;

        // Monthly stats
        const monthlyRecords = allRecords.filter(r => {
            const d = new Date(r.date);
            const customer = customers.find(c => c.id === r.customerId);
            return d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear &&
                customer?.assignedTo === member.id;
        });

        return {
            member,
            assignedCustomers: memberCustomers.length,
            dailyDelivered,
            dailyPending,
            monthlyDelivered: monthlyRecords.length
        };
    });
};

export interface ProductStats {
    product: ProductType;
    dailyQuantity: number;
    monthlyQuantity: number;
    monthlyRevenue: number;
}

export const getProductStatistics = (month?: number, year?: number): ProductStats[] => {
    const customers = getCustomers();
    const currentMonth = month ?? new Date().getMonth();
    const currentYear = year ?? new Date().getFullYear();
    const reports = getMonthlyReport(currentMonth, currentYear);

    const products: ProductType[] = ['Milk', 'Curd', 'Ghee', 'Paneer'];

    return products.map(product => {
        // Daily quantity (sum of all active subscriptions)
        const dailyQty = customers
            .filter(c => c.isActive)
            .reduce((sum, c) => {
                const sub = c.subscriptions.find(s => s.product === product);
                return sum + (sub?.quantity || 0);
            }, 0);

        // Monthly stats from reports
        let monthlyQty = 0;
        let monthlyRev = 0;

        reports.forEach(report => {
            if (report.products[product]) {
                monthlyQty += report.products[product].quantity;
                monthlyRev += report.products[product].cost;
            }
        });

        return {
            product,
            dailyQuantity: dailyQty,
            monthlyQuantity: monthlyQty,
            monthlyRevenue: monthlyRev
        };
    });
};

export interface RevenueBreakdown {
    totalRevenue: number;
    byCustomer: { name: string; amount: number }[];
    byMember: { name: string; amount: number }[];
    byProduct: { product: ProductType; amount: number }[];
}

export const getRevenueBreakdown = (month: number, year: number): RevenueBreakdown => {
    const customers = getCustomers();
    const members = getDeliveryMembers();
    const reports = getMonthlyReport(month, year);

    // Total revenue
    const totalRevenue = reports.reduce((sum, r) => sum + r.totalAmount, 0);

    // By customer
    const byCustomer = reports.map(r => ({
        name: r.customerName,
        amount: r.totalAmount
    })).filter(c => c.amount > 0);

    // By member
    const memberRevenueMap: Record<string, number> = {};
    reports.forEach(report => {
        const customer = customers.find(c => c.id === report.customerId);
        if (customer?.assignedTo) {
            memberRevenueMap[customer.assignedTo] =
                (memberRevenueMap[customer.assignedTo] || 0) + report.totalAmount;
        }
    });

    const byMember = members.map(m => ({
        name: m.name,
        amount: memberRevenueMap[m.id] || 0
    }));

    // By product
    const productRevenueMap: Record<string, number> = {};
    reports.forEach(report => {
        Object.entries(report.products).forEach(([product, data]) => {
            productRevenueMap[product] = (productRevenueMap[product] || 0) + data.cost;
        });
    });

    const byProduct = Object.entries(productRevenueMap).map(([product, amount]) => ({
        product: product as ProductType,
        amount
    }));

    return {
        totalRevenue,
        byCustomer,
        byMember,
        byProduct
    };
};

export type Role = 'ADMIN' | 'DELIVERY';

export interface User {
  id: string;
  name: string;
  role: Role;
  mobile?: string;
}

export interface DeliveryMember {
  id: string;
  name: string;
  mobile: string;
  route?: string;
  shift: 'Morning' | 'Evening' | 'Both';
  isActive: boolean;
}

export type ProductType = string;

export interface ProductSubscription {
  product: ProductType;
  quantity: number; // e.g., liters or kg
  // pricePerUnit removed - now centralized
}

export interface ProductPrice {
  product: ProductType;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  mobile: string;
  subscriptions: ProductSubscription[];
  joinDate: string;
  isActive: boolean;
  assignedTo?: string; // ID of the Delivery Member
  deliveryShift?: string[]; // Morning, Evening, or both
}

export type DeliveryStatus = 'Delivered' | 'Absent';

export interface DeliveryItem {
  product: ProductType;
  quantity: number;
  status: DeliveryStatus;
  priceCheck?: number; // Snapshot of price at delivery per unit
}

export interface DeliveryRecord {
  id: string;
  date: string; // YYYY-MM-DD
  customerId: string;
  items: DeliveryItem[];
}

export interface MonthlyReportItem {
  customerId: string;
  customerName: string;
  products: Record<string, { quantity: number, cost: number }>;
  totalAmount: number;
  totalLiters: number;
}

export type MessageChannel = 'SMS' | 'WhatsApp';
export type MessageStatus = 'Pending' | 'Sent' | 'Failed';

export interface MessageLog {
  id: string;
  customerId: string;
  month: number;
  year: number;
  channel: MessageChannel;
  status: MessageStatus;
  timestamp: string;
}

// Attendance Types
export interface AttendanceEntry {
  customerId: string;
  customerName: string;
  fixedQuantity: number;
  deliveredQuantity: number;
  status: 'Delivered' | 'Absent';
  pricePerLiter: number;
  deliveryShift?: string[];
}

export interface AttendanceRecord {
  _id?: string;
  id?: string;
  date: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  entries: AttendanceEntry[];
  submittedAt: string;
}

export interface AttendanceSheet {
  date: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  entries: AttendanceEntry[];
  pricePerLiter: number;
}


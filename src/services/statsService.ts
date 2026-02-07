import type { ProductType } from '../types';

export interface ProductStats {
    product: ProductType;
    dailyQuantity: number;
    monthlyQuantity: number;
    monthlyRevenue: number;
}

const API_BASE = 'http://localhost:5000/api';

/**
 * Fetches product-wise statistics for a given month and year.
 * @param month 0-indexed month (0 = Jan, 11 = Dec)
 * @param year full year (e.g., 2026)
 */
export async function getProductStatistics(month: number, year: number): Promise<ProductStats[]> {
    try {
        const response = await fetch(`${API_BASE}/stats/products?month=${month}&year=${year}`);
        if (!response.ok) {
            throw new Error('Failed to fetch product statistics');
        }
        return response.json();
    } catch (error) {
        console.error('Error in getProductStatistics service:', error);
        throw error;
    }
}

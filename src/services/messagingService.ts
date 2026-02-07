import type { MessageChannel } from '../types';

export const generateBillMessage = (customerName: string, monthYear: string, liters: number, amount: number): string => {
    return `Hello ${customerName},
Milk Bill for ${monthYear}

Total Milk: ${liters.toFixed(2)} L
Amount: ₹${amount.toFixed(2)}

Thank you,
Agaram Milk`;
};

export const sendMockMessage = async (customerId: string, channel: MessageChannel, message: string): Promise<boolean> => {
    console.log(`Sending ${channel} to ${customerId}:`, message);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate successful send
    return true;
};

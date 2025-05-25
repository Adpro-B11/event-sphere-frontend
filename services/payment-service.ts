import { FilterTransactionsParams, PurchaseRequest, TopUpRequest, Transaction } from "@/types/payment";
import paymentApiClient from "@/lib/paymentApi";

const PaymentService = {
  // Top up balance
  topUpBalance: async (request: TopUpRequest): Promise<Transaction> => {
    const response = await paymentApiClient.post<Transaction>("/api/transactions/topup", request);
    return response.data;
  },

  // Purchase ticket
  purchaseTicket: async (request: PurchaseRequest): Promise<Transaction> => {
    const response = await paymentApiClient.post<Transaction>("/api/transactions/purchase", request);
    return response.data;
  },

  // Get transaction by ID - FIX: Menangani response yang berbeda
  getTransactionById: async (transactionId: string): Promise<Transaction> => {
    const response = await paymentApiClient.get(`/api/transactions/${transactionId}`);
    
    // Handle different response structures
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Filter transactions - FIX: Menangani query params dan response
  filterTransactions: async (params: FilterTransactionsParams): Promise<Transaction[]> => {
    const queryParams = new URLSearchParams();
    
    // Add all non-null/undefined params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await paymentApiClient.get(`/api/transactions?${queryParams.toString()}`);
    
    // Handle different response structures
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data || [];
  },

  // Delete transaction (admin only)
  deleteTransaction: async (transactionId: string): Promise<void> => {
    await paymentApiClient.delete(`/api/transactions/${transactionId}`);
  },

  // Helper functions
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  },

  formatTransactionStatus: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'Success';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  },

  getStatusBadgeColor: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  formatTransactionType: (type: string): string => {
    switch (type) {
      case 'TOPUP_BALANCE':
        return 'Top Up Balance';
      case 'TICKET_PURCHASE':
        return 'Ticket Purchase';
      default:
        return type;
    }
  },

  formatPaymentMethod: (method: string): string => {
    switch (method) {
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'CREDIT_CARD':
        return 'Credit Card';
      case 'IN_APP_BALANCE':
        return 'In-App Balance';
      default:
        return method;
    }
  }
};

export default PaymentService;
export interface TopUpRequest {
  userId: string;
  amount: number;
  method: string;
  paymentData: { [key: string]: string };
}

export interface PurchaseRequest {
  userId: string;
  eventId: string;
  amount: number;
  quantity: number;
  ticketId: string;
}

export interface Transaction {
  transactionId: string;
  userId: string;
  eventId?: string;
  type: string;
  status: string;
  amount: number;
  createdAt: string;
  updatedAt?: string;
  method?: string;
  data?: { [key: string]: string };
}

export interface FilterTransactionsParams {
  currentUserId: string;
  isAdmin?: boolean;
  status?: string;
  type?: string;
  method?: string;
  createdAfter?: string;
  createdBefore?: string;
}
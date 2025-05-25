"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  Hash, 
  User, 
  Building,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import PaymentService from "@/services/payment-service";
import { Transaction } from "@/types/payment";
import ProtectedRoute from "@/components/protected-route";

export default function TransactionDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const transactionId = params.id as string;

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) return;

      setIsLoading(true);
      setError("");

      try {
        const data = await PaymentService.getTransactionById(transactionId);
        setTransaction(data);
      } catch (err: any) {
        console.error("Error fetching transaction:", err);
        if (err.response?.status === 404) {
          setError("Transaction not found");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to view this transaction");
        } else {
          setError(err.response?.data?.message || "Failed to load transaction details");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'pending':
        return <Clock className="h-8 w-8 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return "This transaction has been completed successfully.";
      case 'pending':
        return "This transaction is being processed. Please wait for confirmation.";
      case 'failed':
        return "This transaction has failed. Please contact support if you need assistance.";
      default:
        return "Transaction status is unknown.";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading transaction details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !transaction) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mb-6">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Unable to Load Transaction
              </h1>
              <p className="text-red-700 mb-6">{error}</p>
            </div>
            <Link href="/transactions">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Transactions
              </Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Transaction not found
  if (!transaction) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Transaction Not Found
            </h1>
            <Link href="/transactions">
              <Button>Back to Transactions</Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/transactions">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transactions
            </Button>
          </Link>
        </div>

        {/* Transaction Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Transaction Details
              </h1>
              <p className="text-gray-600">
                {PaymentService.formatTransactionType(transaction.type)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(transaction.status)}
              <Badge className={PaymentService.getStatusBadgeColor(transaction.status)} variant="secondary">
                {PaymentService.formatTransactionStatus(transaction.status)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Status Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(transaction.status)}
                  Transaction Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  {getStatusMessage(transaction.status)}
                </p>
                {transaction.status.toLowerCase() === 'pending' && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <Clock className="h-4 w-4" />
                    <AlertDescription className="text-yellow-700">
                      Your transaction is being processed. This may take a few minutes to several business days depending on the payment method.
                    </AlertDescription>
                  </Alert>
                )}
                {transaction.status.toLowerCase() === 'failed' && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-700">
                      Your transaction has failed. If you believe this is an error, please contact our support team.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Transaction Data */}
            {transaction.data && Object.keys(transaction.data).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Data</CardTitle>
                  <CardDescription>
                    Additional information about this transaction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(transaction.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </span>
                        <span className="text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Transaction Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Transaction ID */}
                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Transaction ID</p>
                      <p className="text-sm text-gray-600 font-mono break-all">
                        {transaction.transactionId}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Amount */}
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        {PaymentService.formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Type */}
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Transaction Type</p>
                      <p className="text-gray-600">
                        {PaymentService.formatTransactionType(transaction.type)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  {transaction.method && (
                    <>
                      <div className="flex items-start gap-3">
                        {transaction.method === 'CREDIT_CARD' ? (
                          <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                        ) : (
                          <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium">Payment Method</p>
                          <p className="text-gray-600">
                            {PaymentService.formatPaymentMethod(transaction.method)}
                          </p>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Created Date */}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Created Date</p>
                      <p className="text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Updated Date */}
                  {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Last Updated</p>
                          <p className="text-gray-600">
                            {formatDate(transaction.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Event ID (for ticket purchases) */}
                  {transaction.eventId && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Hash className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Event ID</p>
                          <p className="text-sm text-gray-600 font-mono">
                            {transaction.eventId}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Help Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <p className="text-gray-600">
                      If you have any questions about this transaction or need assistance, please contact our support team.
                    </p>
                    <div className="space-y-2">
                      <Link href="/reports/create" className="block">
                        <Button variant="outline" className="w-full">
                          Create Support Ticket
                        </Button>
                      </Link>
                      <Link href="/transactions" className="block">
                        <Button variant="outline" className="w-full">
                          View All Transactions
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
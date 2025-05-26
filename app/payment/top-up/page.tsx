"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Building, ArrowLeft } from "lucide-react";
import PaymentService from "@/services/payment-service";
import { TopUpRequest } from "@/types/payment";
import ProtectedRoute from "@/components/protected-route";
import Link from "next/link";

export default function TopUpPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to top up balance");
      return;
    }

    // Validation
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    if (!accountNumber.trim()) {
      setError("Please enter account number");
      return;
    }

    if (paymentMethod === "BANK_TRANSFER" && !bankName.trim()) {
      setError("Please enter bank name");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const paymentData: { [key: string]: string } = {
        accountNumber: accountNumber.trim()
      };

      if (paymentMethod === "BANK_TRANSFER") {
        paymentData.bankName = bankName.trim();
      }

      const request: TopUpRequest = {
        userId: user.id,
        amount: amountNum,
        method: paymentMethod,
        paymentData
      };

      const transaction = await PaymentService.topUpBalance(request);
      setSuccess(`Top up request created successfully! Transaction ID: ${transaction.transactionId}`);
      
      // Reset form
      setAmount("");
      setPaymentMethod("");
      setBankName("");
      setAccountNumber("");

      // Redirect to transaction history after 3 seconds
      setTimeout(() => {
        router.push("/transactions");
      }, 3000);

    } catch (err: any) {
      console.error("Top up error:", err);
      setError(err.response?.data?.message || "Failed to process top up request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    return PaymentService.formatCurrency(num);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Top Up Balance</h1>
          <p className="text-gray-600">Add funds to your account balance</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Up Details</CardTitle>
                <CardDescription>
                  Enter the amount and payment method to add funds to your balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Amount */}
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount (IDR)"
                      className="mt-1"
                      disabled={isLoading}
                      min="1000"
                      step="1000"
                    />
                    {amount && (
                      <p className="text-sm text-gray-500 mt-1">
                        Amount: {formatCurrency(amount)}
                      </p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BANK_TRANSFER">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Bank Transfer
                          </div>
                        </SelectItem>
                        <SelectItem value="CREDIT_CARD">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Credit Card
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bank Name (only for bank transfer) */}
                  {paymentMethod === "BANK_TRANSFER" && (
                    <div>
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g., Bank BCA, Bank Mandiri"
                        className="mt-1"
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  {/* Account Number */}
                  <div>
                    <Label htmlFor="accountNumber">
                      {paymentMethod === "CREDIT_CARD" ? "Card Number *" : "Account Number *"}
                    </Label>
                    <Input
                      id="accountNumber"
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={
                        paymentMethod === "CREDIT_CARD" 
                          ? "1234567812345678" 
                          : "1234567890"
                      }
                      className="mt-1"
                      disabled={isLoading}
                      maxLength={paymentMethod === "CREDIT_CARD" ? 16 : 12}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {paymentMethod === "CREDIT_CARD" 
                        ? "Enter 16-digit card number" 
                        : "Enter 10-digit account number"
                      }
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !amount || !paymentMethod || !accountNumber}
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Top Up ${amount ? formatCurrency(amount) : "Balance"}`
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Current Balance */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {PaymentService.formatCurrency(user?.balance || 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Available Balance</p>
                </div>
              </CardContent>
            </Card>

            {/* Information */}
            <Card>
              <CardHeader>
                <CardTitle>Important Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Processing Time:</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Bank Transfer: 1-3 business days</li>
                    <li>• Credit Card: Instant</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Minimum Amount:</h4>
                  <p className="text-gray-600">IDR 1,000</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Security:</h4>
                  <p className="text-gray-600">
                    All transactions are encrypted and secure. We never store your full payment details.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
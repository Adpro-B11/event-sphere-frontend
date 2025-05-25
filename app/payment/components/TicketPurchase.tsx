"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  CreditCard, 
  Wallet, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Minus,
  Plus
} from "lucide-react";

import PaymentService from "@/services/payment-service";
import { PurchaseRequest } from "@/types/payment";


interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  available: boolean;
  maxQuantity?: number;
}

interface TicketPurchaseProps {
  eventId: string;
  eventTitle: string;
  ticketTypes: TicketType[];
  onPurchaseSuccess?: (transactionId: string) => void;
}

export default function TicketPurchase({ 
  eventId, 
  eventTitle, 
  ticketTypes, 
  onPurchaseSuccess 
}: TicketPurchaseProps) {
  const { user } = useAuth();
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateTicketQuantity = (ticketId: string, quantity: number) => {
    const ticketType = ticketTypes.find(t => t.id === ticketId);
    const maxQty = ticketType?.maxQuantity || 10;
    
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: Math.max(0, Math.min(quantity, maxQty))
    }));
  };

  const getTotalAmount = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticketType = ticketTypes.find(t => t.id === ticketId);
      return total + (ticketType?.price || 0) * quantity;
    }, 0);
  };

  const getTotalQuantity = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const getSelectedTicketSummary = () => {
    return Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticketType = ticketTypes.find(t => t.id === ticketId);
        return {
          id: ticketId,
          name: ticketType?.name || ticketId,
          quantity,
          price: ticketType?.price || 0,
          total: (ticketType?.price || 0) * quantity
        };
      });
  };

  const handlePurchase = async () => {
    if (!user) {
      setError("Please login to purchase tickets");
      return;
    }

    const selectedSummary = getSelectedTicketSummary();
    if (selectedSummary.length === 0) {
      setError("Please select at least one ticket");
      return;
    }

    const totalAmount = getTotalAmount();
    if (totalAmount > (user.balance || 0)) {
      setError("Insufficient balance. Please top up your account first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // For simplicity, we'll create one transaction per ticket type
      // In a real implementation, you might want to create a single transaction with multiple items
      const firstSelectedTicket = selectedSummary[0];
      
      const request: PurchaseRequest = {
        userId: user.id,
        eventId: eventId,
        amount: totalAmount,
        quantity: getTotalQuantity(),
        ticketId: firstSelectedTicket.id
      };

      const transaction = await PaymentService.purchaseTicket(request);
      
      setSuccess(
        `Ticket purchase successful! Transaction ID: ${transaction.transactionId}`
      );
      
      // Reset form
      setSelectedTickets({});
      
      // Call success callback
      if (onPurchaseSuccess) {
        onPurchaseSuccess(transaction.transactionId);
      }

    } catch (err: any) {
      console.error("Purchase error:", err);
      if (err.response?.status === 400) {
        setError("Invalid purchase request. Please check your selection and try again.");
      } else if (err.response?.status === 402) {
        setError("Insufficient balance. Please top up your account first.");
      } else {
        setError(err.response?.data?.message || "Failed to process ticket purchase. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasInsufficientBalance = getTotalAmount() > (user?.balance || 0);

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Tickets
          </CardTitle>
          <CardDescription>
            Select tickets for: <strong>{eventTitle}</strong>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Current Balance */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Your Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                {PaymentService.formatCurrency(user.balance || 0)}
              </span>
              {hasInsufficientBalance && getTotalAmount() > 0 && (
                <Badge variant="destructive">Insufficient Balance</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ticket Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Available Tickets</CardTitle>
          <CardDescription>
            Select the number of tickets you want to purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticketTypes.map((ticketType) => (
            <div key={ticketType.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">{ticketType.name}</h4>
                  {ticketType.description && (
                    <p className="text-sm text-gray-600">{ticketType.description}</p>
                  )}
                  <p className="text-lg font-bold text-green-600">
                    {PaymentService.formatCurrency(ticketType.price)}
                  </p>
                </div>
                <Badge variant={ticketType.available ? "default" : "secondary"}>
                  {ticketType.available ? "Available" : "Sold Out"}
                </Badge>
              </div>
              
              {ticketType.available && (
                <div className="flex items-center gap-3">
                  <Label htmlFor={`quantity-${ticketType.id}`}>Quantity:</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => 
                        updateTicketQuantity(
                          ticketType.id, 
                          (selectedTickets[ticketType.id] || 0) - 1
                        )
                      }
                      disabled={!selectedTickets[ticketType.id] || selectedTickets[ticketType.id] <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id={`quantity-${ticketType.id}`}
                      type="number"
                      min="0"
                      max={ticketType.maxQuantity || 10}
                      value={selectedTickets[ticketType.id] || 0}
                      onChange={(e) => 
                        updateTicketQuantity(ticketType.id, parseInt(e.target.value) || 0)
                      }
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => 
                        updateTicketQuantity(
                          ticketType.id, 
                          (selectedTickets[ticketType.id] || 0) + 1
                        )
                      }
                      disabled={
                        (selectedTickets[ticketType.id] || 0) >= (ticketType.maxQuantity || 10)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedTickets[ticketType.id] > 0 && (
                    <div className="text-sm text-gray-600">
                      Subtotal: {PaymentService.formatCurrency(
                        ticketType.price * selectedTickets[ticketType.id]
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Order Summary */}
      {getTotalQuantity() > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getSelectedTicketSummary().map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">
                    {PaymentService.formatCurrency(item.total)}
                  </span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total ({getTotalQuantity()} tickets)</span>
                <span className="text-green-600">
                  {PaymentService.formatCurrency(getTotalAmount())}
                </span>
              </div>

              {hasInsufficientBalance && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-yellow-700">
                    You need {PaymentService.formatCurrency(getTotalAmount() - (user?.balance || 0))} more to complete this purchase.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {hasInsufficientBalance && getTotalAmount() > 0 ? (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1"
                >
                  <a href="/top-up">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Top Up Balance
                  </a>
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={true}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Insufficient Balance
                </Button>
              </div>
            ) : (
              <Button
                onClick={handlePurchase}
                disabled={isLoading || getTotalQuantity() === 0 || !user}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Purchase...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase Tickets - {PaymentService.formatCurrency(getTotalAmount())}
                  </>
                )}
              </Button>
            )}
          </div>

          {!user && (
            <div className="mt-4 text-center">
              <p className="text-gray-600 mb-3">Please login to purchase tickets</p>
              <Button asChild variant="outline">
                <a href="/login">Login to Purchase</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
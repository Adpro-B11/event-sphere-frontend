"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Search, Filter, Plus, Eye, Loader2, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import PaymentService from "@/services/payment-service";
import { Transaction } from "@/types/payment";
import { FilterTransactionsParams } from "@/types/payment";
import ProtectedRoute from "@/components/protected-route";
import { Role } from "@/types/auth";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, searchQuery, statusFilter, typeFilter, methodFilter, sortOrder]);

  const fetchTransactions = async () => {
    if (!user) return;

    setIsLoading(true);
    setError("");

    try {
      const params: FilterTransactionsParams = {
        currentUserId: user.id,
        isAdmin: user.role === Role.ADMIN
      };

      const data = await PaymentService.filterTransactions(params);
      setTransactions(data);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (tx) =>
          tx.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tx.eventId && tx.eventId.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((tx) => tx.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === typeFilter);
    }

    // Method filter
    if (methodFilter !== "all") {
      filtered = filtered.filter((tx) => tx.method === methodFilter);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTransactionsByStatus = (status: string) => {
    if (status === "all") return filteredTransactions;
    return filteredTransactions.filter(tx => tx.status.toLowerCase() === status.toLowerCase());
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const TransactionTable = ({ transactions }: { transactions: Transaction[] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.transactionId}>
                <TableCell className="font-mono text-sm">
                  {transaction.transactionId.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {PaymentService.formatTransactionType(transaction.type)}
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  {PaymentService.formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <Badge className={PaymentService.getStatusBadgeColor(transaction.status)}>
                    {PaymentService.formatTransactionStatus(transaction.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {transaction.method ? PaymentService.formatPaymentMethod(transaction.method) : "-"}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(transaction.createdAt)}
                </TableCell>
                <TableCell>
                  <Link href={`/transactions/${transaction.transactionId}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading transactions...</span>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-gray-600 mt-1">View and manage your transactions</p>
          </div>
          <Link href="/top-up">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Top Up Balance
            </Button>
          </Link>
        </div>

        {/* Current Balance Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Your available account balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center sm:text-left">
              <p className="text-4xl font-bold text-green-600">
                {PaymentService.formatCurrency(user?.balance || 0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Available for transactions</p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 p-4 text-center text-red-700 bg-red-100 rounded-lg border border-red-300">
            <p>Error: {error}</p>
            <Button variant="outline" className="mt-2" onClick={fetchTransactions}>
              Try Again
            </Button>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="TOPUP_BALANCE">Top Up</SelectItem>
                  <SelectItem value="TICKET_PURCHASE">Ticket Purchase</SelectItem>
                </SelectContent>
              </Select>

              {/* Method Filter */}
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="IN_APP_BALANCE">In-App Balance</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order */}
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">
                    <div className="flex items-center">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Newest First
                    </div>
                  </SelectItem>
                  <SelectItem value="asc">
                    <div className="flex items-center">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Oldest First
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All ({filteredTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="success">
              Success ({getTransactionsByStatus("success").length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({getTransactionsByStatus("pending").length})
            </TabsTrigger>
            <TabsTrigger value="failed">
              Failed ({getTransactionsByStatus("failed").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  {filteredTransactions.length} transactions found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable transactions={currentTransactions} />
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="success">
            <Card>
              <CardHeader>
                <CardTitle>Successful Transactions</CardTitle>
                <CardDescription>
                  {getTransactionsByStatus("success").length} successful transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable transactions={getTransactionsByStatus("success")} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Transactions</CardTitle>
                <CardDescription>
                  {getTransactionsByStatus("pending").length} pending transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable transactions={getTransactionsByStatus("pending")} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="failed">
            <Card>
              <CardHeader>
                <CardTitle>Failed Transactions</CardTitle>
                <CardDescription>
                  {getTransactionsByStatus("failed").length} failed transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable transactions={getTransactionsByStatus("failed")} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
                  
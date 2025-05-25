"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Role } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, Plus, History, CreditCard, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import PaymentService from "@/services/payment-service";

export default function BalanceDisplay() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // ⭐ ROLE RESTRICTION: Only show for USER role
  if (!user || user.role !== Role.USER) return null;

  const balance = user.balance || 0;
  const formattedBalance = PaymentService.formatCurrency(balance);

  return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 h-9">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">
            {formattedBalance}
          </span>
            <Badge
                variant="secondary"
                className="hidden sm:inline-flex bg-green-100 text-green-800 hover:bg-green-100"
            >
              Balance
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex items-center justify-between">
              <span>Account Balance</span>
              <Wallet className="h-4 w-4 text-gray-500" />
            </div>
          </DropdownMenuLabel>

          {/* Balance Display */}
          <div className="px-2 py-3 border-b">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 mb-1">
                {formattedBalance}
              </p>
              <p className="text-sm text-gray-500">Available Balance</p>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Quick Actions */}
          <div className="p-2">
            <p className="text-sm font-medium text-gray-700 mb-2 px-2">Quick Actions</p>

            <DropdownMenuItem asChild>
              <Link
                  href="/top-up"
                  className="flex items-center w-full p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-md mr-3">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Top Up Balance</p>
                  <p className="text-sm text-gray-500">Add funds to your account</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                  href="/transactions"
                  className="flex items-center w-full p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-md mr-3">
                  <History className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Transaction History</p>
                  <p className="text-sm text-gray-500">View all transactions</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </Link>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          {/* Balance Status */}
          <div className="p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Balance Status:</span>
              <Badge
                  variant="outline"
                  className={
                    balance > 100000
                        ? "text-green-700 border-green-200 bg-green-50"
                        : balance > 50000
                            ? "text-yellow-700 border-yellow-200 bg-yellow-50"
                            : "text-red-700 border-red-200 bg-red-50"
                  }
              >
                {balance > 100000 ? "Good" : balance > 50000 ? "Low" : "Very Low"}
              </Badge>
            </div>

            {balance < 50000 && (
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-xs text-orange-700">
                    💡 Consider topping up your balance for seamless transactions
                  </p>
                </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}

// Komponen sederhana untuk mobile view
export function MobileBalanceDisplay() {
  const { user } = useAuth();

  // ⭐ ROLE RESTRICTION: Only show for USER role
  if (!user || user.role !== Role.USER) return null;

  const balance = user.balance || 0;
  const formattedBalance = PaymentService.formatCurrency(balance);

  return (
      <div className="sm:hidden mb-2">
        <Link href="/transactions">
          <div className="flex items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
            <Wallet className="h-4 w-4 text-white" />
            <div>
              <p className="text-sm font-medium text-white">{formattedBalance}</p>
              <p className="text-xs text-gray-300">Available Balance</p>
            </div>
          </div>
        </Link>
      </div>
  );
}

// Update untuk navbar component:
/*
// File: components/navbar.tsx
// Tambahkan import dan gunakan komponen BalanceDisplay

import BalanceDisplay, { MobileBalanceDisplay } from "@/components/balance-display";

// Di dalam navbar component, tambahkan sebelum user menu:
{isAuthenticated && (
  <>
    <BalanceDisplay />
    <MobileBalanceDisplay />
  </>
)}
*/
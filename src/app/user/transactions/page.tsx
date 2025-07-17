'use client';

import React from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import DataTable from '@/components/shared/DataTable';
import { Transaction as TransactionType } from '@/types';

export default function TransactionPage() {
  const { data: transactions, isLoading, error } = useTransactions(); // This will fetch all transactions, need to filter by user_id later

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error loading your transactions: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Transactions</h1>
      <p className="text-gray-600">View your financial transaction history.</p>

      <DataTable
        data={transactions || []}
        columns={[
          {
            key: 'id',
            header: 'Transaction ID',
          },
          {
            key: 'amount',
            header: 'Amount',
            render: (value) => `$${value.toFixed(2)}`,
          },
          {
            key: 'type',
            header: 'Type',
            render: (value) => (
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                value === 'deposit'
                  ? 'bg-green-100 text-green-800'
                  : value === 'payment'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {value}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (value) => (
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                value === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : value === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : value === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {value}
              </span>
            ),
          },
          {
            key: 'created_at',
            header: 'Date',
            render: (value) => new Date(value).toLocaleDateString(),
          },
        ]}
      />
    </div>
  );
}
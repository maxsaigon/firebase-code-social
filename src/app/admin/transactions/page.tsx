'use client';

import React, { useState } from 'react';
import { Plus, DollarSign, Edit, Trash } from 'lucide-react';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import DataTable from '@/components/shared/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TransactionForm } from '@/components/TransactionForm';
import { Transaction as TransactionType, CreateTransactionData } from '@/types';

export default function TransactionManagementPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 300);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionType | null>(null);

  const { data: transactions, isLoading, error } = useTransactions({
    search: debouncedSearch,
    type: typeFilter,
    status: statusFilter,
  });

  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  const handleCreateTransaction = async (data: CreateTransactionData) => {
    await createTransactionMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleEditTransaction = (transaction: TransactionType) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = async (data: CreateTransactionData) => {
    if (selectedTransaction) {
      await updateTransactionMutation.mutateAsync({ id: selectedTransaction.id, updates: data });
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransactionMutation.mutateAsync(transactionId);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error loading transactions: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">View and manage all financial transactions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="withdrawal">Withdrawal</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
            <SelectItem value="commission">Commission</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction Table */}
      <DataTable
        data={transactions || []}
        columns={[
          {
            key: 'id',
            header: 'Transaction ID',
          },
          {
            key: 'user_id',
            header: 'User ID',
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
          {
            key: 'actions',
            header: 'Actions',
            render: (_, transaction) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTransaction(transaction);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTransaction(transaction.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Create Transaction Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Transaction</DialogTitle>
            <DialogDescription>Fill in the details to create a new transaction.</DialogDescription>
          </DialogHeader>
          <TransactionForm onSubmit={handleCreateTransaction} isSubmitting={createTransactionMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update the transaction details.</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionForm
              transaction={selectedTransaction}
              onSubmit={handleUpdateTransaction}
              isSubmitting={updateTransactionMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
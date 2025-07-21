import { Metadata } from 'next';
import AddFundsForm from './AddFundsForm';

export const metadata: Metadata = {
  title: 'Add Funds | User Dashboard',
  description: 'Add funds to your account via Stripe or cryptocurrency'
};

export default function AddFundsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Funds</h1>
          <p className="text-gray-600 mt-2">
            Top up your account balance using credit card or cryptocurrency
          </p>
        </div>

        <AddFundsForm />
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import PaymentSettingsForm from './PaymentSettingsForm';

export const metadata: Metadata = {
  title: 'Payment Settings | Admin Dashboard',
  description: 'Configure payment providers and settings'
};

export default function PaymentSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure payment providers, API keys, and wallet addresses
          </p>
        </div>

        <PaymentSettingsForm />
      </div>
    </div>
  );
}

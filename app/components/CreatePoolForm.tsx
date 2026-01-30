'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Select } from './ui';
import { createPool } from '@/app/lib/supabase';
import { X, Loader2 } from 'lucide-react';

interface CreatePoolFormProps {
  onClose: () => void;
  onSuccess: () => void;
  userAddress: string;
}

export function CreatePoolForm({ onClose, onSuccess, userAddress }: CreatePoolFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deposit_token: 'USDC',
    voting_period_days: 3,
    quorum_percent: 50,
    approval_threshold_percent: 60,
    guardian_threshold_percent: 20,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pool = await createPool({
        ...formData,
        admin_address: userAddress,
      });

      if (pool) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating pool:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create New Pool</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pool Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Pool Name</label>
              <Input
                placeholder="e.g., Alpha Friends Circle"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                placeholder="What's this pool for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Deposit Token */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Deposit Token</label>
              <Select
                value={formData.deposit_token}
                onValueChange={(value) => setFormData({ ...formData, deposit_token: value })}
              >
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
              </Select>
            </div>

            {/* Voting Period */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Voting Period (days)</label>
              <Input
                type="number"
                min={1}
                max={14}
                value={formData.voting_period_days}
                onChange={(e) => setFormData({ ...formData, voting_period_days: parseInt(e.target.value) })}
              />
            </div>

            {/* Quorum */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quorum (%)</label>
              <Input
                type="number"
                min={10}
                max={100}
                value={formData.quorum_percent}
                onChange={(e) => setFormData({ ...formData, quorum_percent: parseInt(e.target.value) })}
              />
              <p className="text-xs text-[hsl(240,5%,64.9%)]">Minimum participation required for vote to be valid</p>
            </div>

            {/* Approval Threshold */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Approval Threshold (%)</label>
              <Input
                type="number"
                min={50}
                max={100}
                value={formData.approval_threshold_percent}
                onChange={(e) => setFormData({ ...formData, approval_threshold_percent: parseInt(e.target.value) })}
              />
              <p className="text-xs text-[hsl(240,5%,64.9%)]">YES votes needed to pass</p>
            </div>

            {/* Guardian Threshold */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Guardian Threshold (%)</label>
              <Input
                type="number"
                min={10}
                max={50}
                value={formData.guardian_threshold_percent}
                onChange={(e) => setFormData({ ...formData, guardian_threshold_percent: parseInt(e.target.value) })}
              />
              <p className="text-xs text-[hsl(240,5%,64.9%)]">Requests above this % of pool need guardian approval</p>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading || !formData.name}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Pool'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

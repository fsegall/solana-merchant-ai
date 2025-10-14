import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SettlementSummary {
  totalPayments: number;
  totalVolumeBRL: number;
  holdingCrypto: number;
  settledCount: number;
  cryptoBalanceBRL: number;
  settledTotal: number;
  totalFees: number;
  settlementSuccessRate: number;
  avgConfirmSeconds: number;
  avgSettlementSeconds: number;
}

export interface SettlementRequest {
  paymentId: string;
  provider: 'circle' | 'wise';
  currency: string;
  amount: number;
  recipientId: string;
}

export function useSettlements() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSummary = useCallback(async (): Promise<SettlementSummary | null> => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar RPC get_my_settlement_summary quando estiver disponível
      // Por enquanto, retorna dados vazios
      console.warn('⚠️ get_my_settlement_summary RPC não implementado ainda');
      
      return {
        totalPayments: 0,
        totalVolumeBRL: 0,
        holdingCrypto: 0,
        settledCount: 0,
        cryptoBalanceBRL: 0,
        settledTotal: 0,
        totalFees: 0,
        settlementSuccessRate: 0,
        avgConfirmSeconds: 0,
        avgSettlementSeconds: 0,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch summary';
      setError(message);
      console.error('Error fetching settlement summary:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestSettlement = useCallback(async (
    request: SettlementRequest
  ): Promise<{ success: boolean; settlementId?: string; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      console.log('💰 Requesting settlement:', request);

      // First, get the invoice ref from the payment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('invoice:invoices(ref)')
        .eq('id', request.paymentId)
        .single();

      if (paymentError || !payment?.invoice?.ref) {
        throw new Error('Could not find invoice reference for payment');
      }

      const invoiceRef = payment.invoice.ref;
      console.log('📄 Found invoice ref:', invoiceRef);

      // Call appropriate Edge Function based on provider
      const functionName = request.provider === 'circle' ? 'circle-payout' : 'wise-payout';
      
      const { data, error: invokeError } = await supabase.functions.invoke(functionName, {
        body: {
          invoiceRef: invoiceRef,
          amount: request.amount,
          currency: request.currency,
          recipientId: request.recipientId,
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Settlement request failed');
      }

      console.log('✅ Settlement requested:', data);

      return {
        success: true,
        settlementId: data.transferId || data.payoutId,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request settlement';
      setError(message);
      console.error('Error requesting settlement:', err);
      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getSummary,
    requestSettlement,
  };
}


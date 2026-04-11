export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          username: string | null;
          avatar_url: string | null;
          role: 'tester' | 'admin' | 'super_admin';
          locale: string | null;
          created_at: string;
        };
      };
      wallet_accounts: {
        Row: {
          id: string;
          user_id: string;
          currency: string;
          starting_balance: number;
          available_balance: number;
          realized_pnl: number;
          updated_at: string;
        };
      };
      markets: {
        Row: {
          id: string;
          slug: string;
          question: string;
          description: string | null;
          category: string;
          status: 'draft' | 'open' | 'paused' | 'closed' | 'resolved' | 'settled' | 'void';
          close_time: string;
          resolution_time: string | null;
          source_primary: string;
          source_fallback: string | null;
          void_rule: string;
          b_liquidity: number;
          fee_bps: number;
          yes_label: string;
          no_label: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      market_state: {
        Row: {
          market_id: string;
          q_yes: number;
          q_no: number;
          yes_price: number;
          no_price: number;
          last_trade_at: string | null;
          volume_total: number;
          open_interest: number;
          participants_count: number;
          updated_at: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      profile_role: 'tester' | 'admin' | 'super_admin';
      market_status: 'draft' | 'open' | 'paused' | 'closed' | 'resolved' | 'settled' | 'void';
      entry_type: 'seed' | 'trade_buy' | 'trade_sell' | 'settlement' | 'void_refund' | 'manual_adjustment';
      trade_side: 'yes' | 'no';
      trade_action: 'buy' | 'sell';
      resolution_outcome: 'yes' | 'no' | 'void';
    };
    CompositeTypes: Record<string, never>;
  };
};

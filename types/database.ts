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
          event_id: string | null;
          outcome_key: string | null;
          outcome_label: string | null;
          event_display_order: number | null;
          is_event_child: boolean;
          hide_no_on_event_surface: boolean;
          parent_lifecycle_locked: boolean;
          child_resolution_policy: 'standalone' | 'child_independent' | 'parent_only';
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
          virtual_q_yes: number;
          virtual_q_no: number;
          user_q_yes: number;
          user_q_no: number;
          initial_probability: number | null;
          state_version: number;
          state_hash: string | null;
          updated_at: string;
        };
      };
      market_events: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          category: string;
          tags: string[];
          event_type: 'grouped_binary';
          outcome_structure:
            | 'independent_cluster'
            | 'mutually_exclusive_non_exhaustive'
            | 'mutually_exclusive_exhaustive'
            | 'exactly_k_of_n';
          resolution_mode: 'child_independent' | 'single_winner_parent' | 'exactly_k_parent';
          status:
            | 'draft'
            | 'review'
            | 'approved'
            | 'open'
            | 'paused'
            | 'closed'
            | 'under_review'
            | 'resolved'
            | 'settled'
            | 'void'
            | 'archived';
          close_time: string;
          determination_time: string | null;
          determination_window: string | null;
          source_primary: string;
          source_fallback: string | null;
          source_notes: string | null;
          resolution_rule: string;
          void_rule: string;
          is_mutually_exclusive: boolean;
          is_exhaustive: boolean;
          requires_other_outcome: boolean;
          outcome_edit_policy: 'editable_until_open' | 'frozen_after_open' | 'frozen_after_first_trade';
          price_display_policy: 'show_child_yes_prices' | 'show_child_yes_prices_with_multiple_yes_explanation';
          event_loss_budget: number;
          max_child_count: number;
          max_user_event_exposure: number;
          max_trade_amount: number;
          target_yes_count: number | null;
          created_by: string | null;
          approved_by: string | null;
          published_by: string | null;
          created_at: string;
          updated_at: string;
          approved_at: string | null;
          published_at: string | null;
          closed_at: string | null;
          resolved_at: string | null;
          settled_at: string | null;
        };
      };
      market_event_localizations: {
        Row: {
          id: string;
          event_id: string;
          locale: 'en' | 'el';
          title: string;
          subtitle: string | null;
          description: string | null;
          source_primary: string;
          source_fallback: string | null;
          source_notes: string | null;
          resolution_rule: string;
          void_rule: string;
          education_copy: string;
          created_at: string;
          updated_at: string;
        };
      };
      market_event_outcomes: {
        Row: {
          id: string;
          event_id: string;
          child_market_id: string | null;
          outcome_key: string;
          outcome_label: string;
          outcome_short_label: string | null;
          outcome_description: string | null;
          display_order: number;
          is_active: boolean;
          initial_probability: number;
          child_loss_budget: number | null;
          source_primary_override: string | null;
          source_fallback_override: string | null;
          resolution_rule_override: string | null;
          void_rule_override: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      market_event_outcome_localizations: {
        Row: {
          id: string;
          outcome_id: string;
          locale: 'en' | 'el';
          outcome_label: string;
          outcome_short_label: string | null;
          outcome_description: string | null;
          child_question: string;
          source_primary_override: string | null;
          source_fallback_override: string | null;
          resolution_rule_override: string | null;
          void_rule_override: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      event_resolution_batches: {
        Row: {
          id: string;
          event_id: string;
          batch_type: 'child_results' | 'void_all';
          status: 'proposed' | 'approved' | 'applied' | 'settled' | 'rejected' | 'reversed';
          source_used: string;
          evidence_url: string | null;
          evidence_summary: string;
          admin_notes: string | null;
          proposed_by: string;
          approved_by: string | null;
          proposed_at: string;
          approved_at: string | null;
          applied_at: string | null;
          settled_at: string | null;
        };
      };
      event_resolution_batch_children: {
        Row: {
          id: string;
          batch_id: string;
          event_id: string;
          child_market_id: string;
          outcome_key: string;
          child_resolution_outcome: 'yes' | 'no' | 'void';
          child_evidence_url: string | null;
          child_evidence_summary: string | null;
          child_resolution_id: string | null;
          settlement_status: 'pending' | 'resolved' | 'settled' | 'failed';
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      event_risk_snapshots: {
        Row: {
          id: string;
          event_id: string;
          snapshot_at: string;
          active_child_count: number;
          expected_yes_count: number;
          avg_yes_price: number;
          min_yes_price: number;
          max_yes_price: number;
          sum_child_volume: number;
          total_event_open_interest: number;
          worst_case_gross_payout: number;
          worst_case_net_exposure: number;
          largest_child_gross_payout: number;
          largest_user_event_exposure: number;
          metadata_json: Json;
        };
      };
      resolutions: {
        Row: {
          id: string;
          market_id: string;
          outcome: 'yes' | 'no' | 'void';
          evidence_summary: string;
          evidence_url: string | null;
          resolved_by: string;
          approved_by: string | null;
          created_at: string;
        };
      };
      market_settlements: {
        Row: {
          id: string;
          market_id: string;
          resolution_id: string;
          settled_by: string;
          outcome: 'yes' | 'no' | 'void';
          affected_accounts: number;
          total_payout: number;
          total_refund: number;
          total_realized_pnl: number;
          created_at: string;
        };
      };
      market_settlement_entries: {
        Row: {
          id: string;
          settlement_id: string;
          market_id: string;
          user_id: string;
          wallet_account_id: string;
          ledger_entry_id: string | null;
          payout_amount: number;
          refund_amount: number;
          realized_delta: number;
          yes_shares_closed: number;
          no_shares_closed: number;
          yes_cost_basis_closed: number;
          no_cost_basis_closed: number;
          created_at: string;
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

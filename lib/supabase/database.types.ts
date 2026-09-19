export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          created_at: string
          dedupe_key: string
          id: string
          is_read: boolean
          next_action: string | null
          observed_at: string | null
          purchase_id: string | null
          read_at: string | null
          severity: string
          source: string | null
          source_url: string | null
          subscription_id: string | null
          summary: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          dedupe_key: string
          id?: string
          is_read?: boolean
          next_action?: string | null
          observed_at?: string | null
          purchase_id?: string | null
          read_at?: string | null
          severity?: string
          source?: string | null
          source_url?: string | null
          subscription_id?: string | null
          summary: string
          title: string
          user_id?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          dedupe_key?: string
          id?: string
          is_read?: boolean
          next_action?: string | null
          observed_at?: string | null
          purchase_id?: string | null
          read_at?: string | null
          severity?: string
          source?: string | null
          source_url?: string | null
          subscription_id?: string | null
          summary?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      api_rate_limits: {
        Row: {
          key_hash: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          key_hash: string
          request_count: number
          updated_at?: string
          window_start: string
        }
        Update: {
          key_hash?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      baselines: {
        Row: {
          baseline_type: string
          billing_interval: string | null
          captured_at: string
          created_at: string
          currency: string
          display_name: string
          entity_id: string
          id: string
          original_amount_cents: number
          plan_name: string | null
          renewal_at: string | null
          source_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          baseline_type: string
          billing_interval?: string | null
          captured_at: string
          created_at?: string
          currency?: string
          display_name: string
          entity_id: string
          id?: string
          original_amount_cents: number
          plan_name?: string | null
          renewal_at?: string | null
          source_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          baseline_type?: string
          billing_interval?: string | null
          captured_at?: string
          created_at?: string
          currency?: string
          display_name?: string
          entity_id?: string
          id?: string
          original_amount_cents?: number
          plan_name?: string | null
          renewal_at?: string | null
          source_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "baselines_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_customers: {
        Row: {
          created_at: string
          stripe_customer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          stripe_customer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          stripe_customer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          ended_at: string | null
          id: string
          payment_state: string
          plan_key: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          ended_at?: string | null
          id?: string
          payment_state?: string
          plan_key: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          ended_at?: string | null
          id?: string
          payment_state?: string
          plan_key?: string
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          stripe_subscription_id?: string
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      catalog_product_aliases: {
        Row: {
          alias: string
          catalog_product_id: string
          created_at: string
          id: string
          normalized_alias: string | null
        }
        Insert: {
          alias: string
          catalog_product_id: string
          created_at?: string
          id?: string
          normalized_alias?: string | null
        }
        Update: {
          alias?: string
          catalog_product_id?: string
          created_at?: string
          id?: string
          normalized_alias?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_product_aliases_catalog_product_id_fkey"
            columns: ["catalog_product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_product_identifiers: {
        Row: {
          catalog_product_id: string
          created_at: string
          id: string
          identifier_type: string
          identifier_value: string
          normalized_identifier: string | null
          provider: string
          provider_product_id: string | null
        }
        Insert: {
          catalog_product_id: string
          created_at?: string
          id?: string
          identifier_type: string
          identifier_value: string
          normalized_identifier?: string | null
          provider: string
          provider_product_id?: string | null
        }
        Update: {
          catalog_product_id?: string
          created_at?: string
          id?: string
          identifier_type?: string
          identifier_value?: string
          normalized_identifier?: string | null
          provider?: string
          provider_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_product_identifiers_catalog_product_id_fkey"
            columns: ["catalog_product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_product_popularity: {
        Row: {
          catalog_product_id: string
          purchase_count: number
          recent_additions_30d: number
          recent_additions_90d: number
          tracking_user_count: number
          updated_at: string
        }
        Insert: {
          catalog_product_id: string
          purchase_count?: number
          recent_additions_30d?: number
          recent_additions_90d?: number
          tracking_user_count?: number
          updated_at?: string
        }
        Update: {
          catalog_product_id?: string
          purchase_count?: number
          recent_additions_30d?: number
          recent_additions_90d?: number
          tracking_user_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_product_popularity_catalog_product_id_fkey"
            columns: ["catalog_product_id"]
            isOneToOne: true
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_products: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          featured_rank: number | null
          id: string
          identity_key: string | null
          image_url: string | null
          is_featured: boolean
          last_enriched_at: string | null
          manufacturer_part_number: string | null
          model_number: string | null
          name: string
          updated_at: string
          variant_data: Json
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          featured_rank?: number | null
          id?: string
          identity_key?: string | null
          image_url?: string | null
          is_featured?: boolean
          last_enriched_at?: string | null
          manufacturer_part_number?: string | null
          model_number?: string | null
          name: string
          updated_at?: string
          variant_data?: Json
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          featured_rank?: number | null
          id?: string
          identity_key?: string | null
          image_url?: string | null
          is_featured?: boolean
          last_enriched_at?: string | null
          manufacturer_part_number?: string | null
          model_number?: string | null
          name?: string
          updated_at?: string
          variant_data?: Json
        }
        Relationships: []
      }
      catalog_services: {
        Row: {
          category: string
          created_at: string
          id: string
          logo_url: string | null
          manage_url: string | null
          name: string
          normalized_name: string | null
          supported_capabilities: Json
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          logo_url?: string | null
          manage_url?: string | null
          name: string
          normalized_name?: string | null
          supported_capabilities?: Json
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          manage_url?: string | null
          name?: string
          normalized_name?: string | null
          supported_capabilities?: Json
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      catalog_subscription_plans: {
        Row: {
          cadence: string | null
          created_at: string
          currency: string | null
          feature_data: Json
          id: string
          name: string
          normalized_name: string | null
          observed_at: string | null
          price_cents: number | null
          service_id: string
          source: string | null
          source_url: string | null
          updated_at: string
        }
        Insert: {
          cadence?: string | null
          created_at?: string
          currency?: string | null
          feature_data?: Json
          id?: string
          name: string
          normalized_name?: string | null
          observed_at?: string | null
          price_cents?: number | null
          service_id: string
          source?: string | null
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          cadence?: string | null
          created_at?: string
          currency?: string | null
          feature_data?: Json
          id?: string
          name?: string
          normalized_name?: string | null
          observed_at?: string | null
          price_cents?: number | null
          service_id?: string
          source?: string | null
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_subscription_plans_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "catalog_services"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          display_name: string
          entity_type: string
          external_id: string
          id: string
          metadata: Json
          provider: string
          size_label: string | null
          source_url: string | null
          updated_at: string
          variant: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          display_name: string
          entity_type: string
          external_id: string
          id?: string
          metadata?: Json
          provider: string
          size_label?: string | null
          source_url?: string | null
          updated_at?: string
          variant?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          display_name?: string
          entity_type?: string
          external_id?: string
          id?: string
          metadata?: Json
          provider?: string
          size_label?: string | null
          source_url?: string | null
          updated_at?: string
          variant?: string | null
        }
        Relationships: []
      }
      ingestion_runs: {
        Row: {
          completed_at: string | null
          error_summary: string | null
          id: string
          records_processed: number
          source_name: string
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          error_summary?: string | null
          id?: string
          records_processed?: number
          source_name: string
          started_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          error_summary?: string | null
          id?: string
          records_processed?: number
          source_name?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      observations: {
        Row: {
          amount_cents: number | null
          billing_interval: string | null
          created_at: string
          currency: string | null
          entity_id: string
          id: string
          metadata: Json
          observation_type: string
          observed_at: string
          origin: string
          plan_name: string | null
          renewal_at: string | null
          source_name: string
          source_url: string | null
        }
        Insert: {
          amount_cents?: number | null
          billing_interval?: string | null
          created_at?: string
          currency?: string | null
          entity_id: string
          id?: string
          metadata?: Json
          observation_type: string
          observed_at: string
          origin: string
          plan_name?: string | null
          renewal_at?: string | null
          source_name: string
          source_url?: string | null
        }
        Update: {
          amount_cents?: number | null
          billing_interval?: string | null
          created_at?: string
          currency?: string | null
          entity_id?: string
          id?: string
          metadata?: Json
          observation_type?: string
          observed_at?: string
          origin?: string
          plan_name?: string | null
          renewal_at?: string | null
          source_name?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observations_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_checkouts: {
        Row: {
          cancel_at_period_end: boolean
          checkout_payment_status: string
          checkout_session_id: string | null
          claim_token_hash: string
          claimed_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          email: string
          ended_at: string | null
          expires_at: string
          id: string
          payment_state: string
          plan_key: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string
          stripe_subscription_id: string | null
          stripe_subscription_status: string | null
          trial_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean
          checkout_payment_status?: string
          checkout_session_id?: string | null
          claim_token_hash: string
          claimed_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email: string
          ended_at?: string | null
          expires_at: string
          id: string
          payment_state?: string
          plan_key: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id: string
          stripe_subscription_id?: string | null
          stripe_subscription_status?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean
          checkout_payment_status?: string
          checkout_session_id?: string | null
          claim_token_hash?: string
          claimed_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          payment_state?: string
          plan_key?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string
          stripe_subscription_id?: string | null
          stripe_subscription_status?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      price_observations: {
        Row: {
          availability: string | null
          catalog_product_id: string
          created_at: string
          currency: string
          id: string
          metadata: Json
          observed_at: string
          observed_price_cents: number
          product_source_id: string
          source_reference: string | null
          source_url: string | null
        }
        Insert: {
          availability?: string | null
          catalog_product_id: string
          created_at?: string
          currency: string
          id?: string
          metadata?: Json
          observed_at: string
          observed_price_cents: number
          product_source_id: string
          source_reference?: string | null
          source_url?: string | null
        }
        Update: {
          availability?: string | null
          catalog_product_id?: string
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          observed_at?: string
          observed_price_cents?: number
          product_source_id?: string
          source_reference?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_observations_catalog_product_id_fkey"
            columns: ["catalog_product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_observations_product_source_id_fkey"
            columns: ["product_source_id"]
            isOneToOne: false
            referencedRelation: "product_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sources: {
        Row: {
          catalog_product_id: string
          created_at: string
          id: string
          is_active: boolean
          last_error_at: string | null
          last_error_metadata: Json | null
          last_successful_check: string | null
          listing_identifier: string
          provider: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          catalog_product_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_error_at?: string | null
          last_error_metadata?: Json | null
          last_successful_check?: string | null
          listing_identifier: string
          provider: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          catalog_product_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_error_at?: string | null
          last_error_metadata?: Json | null
          last_successful_check?: string | null
          listing_identifier?: string
          provider?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sources_catalog_product_id_fkey"
            columns: ["catalog_product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          catalog_product_id: string | null
          created_at: string
          currency: string
          custom_product_name: string | null
          id: string
          monitoring_status: string
          paid_amount_cents: number
          purchase_date: string
          purchase_url: string | null
          retailer_name: string
          return_deadline: string | null
          return_deadline_source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          catalog_product_id?: string | null
          created_at?: string
          currency?: string
          custom_product_name?: string | null
          id?: string
          monitoring_status?: string
          paid_amount_cents: number
          purchase_date: string
          purchase_url?: string | null
          retailer_name: string
          return_deadline?: string | null
          return_deadline_source?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          catalog_product_id?: string | null
          created_at?: string
          currency?: string
          custom_product_name?: string | null
          id?: string
          monitoring_status?: string
          paid_amount_cents?: number
          purchase_date?: string
          purchase_url?: string | null
          retailer_name?: string
          return_deadline?: string | null
          return_deadline_source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_catalog_product_id_fkey"
            columns: ["catalog_product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          attempted_at: string
          event_id: string
          event_type: string
          last_error: string | null
          processed_at: string | null
          status: string
        }
        Insert: {
          attempted_at?: string
          event_id: string
          event_type: string
          last_error?: string | null
          processed_at?: string | null
          status?: string
        }
        Update: {
          attempted_at?: string
          event_id?: string
          event_type?: string
          last_error?: string | null
          processed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      subscription_plan_observations: {
        Row: {
          cadence: string | null
          catalog_plan_id: string | null
          catalog_service_id: string
          created_at: string
          currency: string | null
          feature_data: Json
          id: string
          observed_at: string
          price_cents: number | null
          source: string
          source_url: string | null
        }
        Insert: {
          cadence?: string | null
          catalog_plan_id?: string | null
          catalog_service_id: string
          created_at?: string
          currency?: string | null
          feature_data?: Json
          id?: string
          observed_at: string
          price_cents?: number | null
          source: string
          source_url?: string | null
        }
        Update: {
          cadence?: string | null
          catalog_plan_id?: string | null
          catalog_service_id?: string
          created_at?: string
          currency?: string | null
          feature_data?: Json
          id?: string
          observed_at?: string
          price_cents?: number | null
          source?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plan_observations_catalog_plan_id_fkey"
            columns: ["catalog_plan_id"]
            isOneToOne: false
            referencedRelation: "catalog_subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_plan_observations_catalog_service_id_fkey"
            columns: ["catalog_service_id"]
            isOneToOne: false
            referencedRelation: "catalog_services"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_usage_events: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          occurred_at: string
          quantity: number | null
          source: string
          subscription_id: string
          usage_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          occurred_at: string
          quantity?: number | null
          source?: string
          subscription_id: string
          usage_type: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          quantity?: number | null
          source?: string
          subscription_id?: string
          usage_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_cents: number
          billing_cadence: string
          catalog_plan_id: string | null
          catalog_service_id: string | null
          created_at: string
          currency: string
          custom_service_name: string | null
          id: string
          manage_url: string | null
          monitoring_status: string
          promo_end: string | null
          renewal_date: string | null
          start_date: string
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          billing_cadence: string
          catalog_plan_id?: string | null
          catalog_service_id?: string | null
          created_at?: string
          currency?: string
          custom_service_name?: string | null
          id?: string
          manage_url?: string | null
          monitoring_status?: string
          promo_end?: string | null
          renewal_date?: string | null
          start_date: string
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount_cents?: number
          billing_cadence?: string
          catalog_plan_id?: string | null
          catalog_service_id?: string | null
          created_at?: string
          currency?: string
          custom_service_name?: string | null
          id?: string
          manage_url?: string | null
          monitoring_status?: string
          promo_end?: string | null
          renewal_date?: string | null
          start_date?: string
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_catalog_plan_id_fkey"
            columns: ["catalog_plan_id"]
            isOneToOne: false
            referencedRelation: "catalog_subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_catalog_service_id_fkey"
            columns: ["catalog_service_id"]
            isOneToOne: false
            referencedRelation: "catalog_services"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          default_currency: string
          default_return_window_days: number | null
          notify_plan_changes: boolean
          notify_price_drops: boolean
          notify_renewals: boolean
          notify_weekly_summary: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_currency?: string
          default_return_window_days?: number | null
          notify_plan_changes?: boolean
          notify_price_drops?: boolean
          notify_renewals?: boolean
          notify_weekly_summary?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          default_currency?: string
          default_return_window_days?: number | null
          notify_plan_changes?: boolean
          notify_price_drops?: boolean
          notify_renewals?: boolean
          notify_weekly_summary?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_pending_checkout: {
        Args: {
          p_checkout_session_id: string
          p_claim_token_hash: string
          p_email: string
          p_user_id: string
        }
        Returns: {
          cancel_at_period_end: boolean
          checkout_payment_status: string
          checkout_session_id: string | null
          claim_token_hash: string
          claimed_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          email: string
          ended_at: string | null
          expires_at: string
          id: string
          payment_state: string
          plan_key: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string
          stripe_subscription_id: string | null
          stripe_subscription_status: string | null
          trial_end: string | null
          updated_at: string
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "pending_checkouts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      consume_rate_limit: {
        Args: { p_key_hash: string; p_limit: number; p_window_seconds: number }
        Returns: {
          allowed: boolean
          request_count: number
          retry_after_seconds: number
        }[]
      }
      normalize_catalog_text: { Args: { value: string }; Returns: string }
      refresh_catalog_product_popularity: {
        Args: { target_product_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

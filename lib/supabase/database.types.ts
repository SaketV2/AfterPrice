export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; created_at: string; updated_at: string }
        Insert: { id: string; display_name?: string | null }
        Update: { display_name?: string | null; updated_at?: string }
        Relationships: []
      }
      user_preferences: {
        Row: { user_id: string; theme: 'light' | 'dark' | 'system'; notify_price_drops: boolean; notify_plan_changes: boolean; notify_renewals: boolean; notify_weekly_summary: boolean; default_currency: string; default_return_window_days: number | null; created_at: string; updated_at: string }
        Insert: { user_id?: string; theme?: 'light' | 'dark' | 'system'; notify_price_drops?: boolean; notify_plan_changes?: boolean; notify_renewals?: boolean; notify_weekly_summary?: boolean; default_currency?: string; default_return_window_days?: number | null }
        Update: Partial<Database['public']['Tables']['user_preferences']['Insert']> & { updated_at?: string }
        Relationships: []
      }
      catalog_product_popularity: {
        Row: { catalog_product_id: string; purchase_count: number; tracking_user_count: number; recent_additions_30d: number; recent_additions_90d: number; updated_at: string }
        Insert: { catalog_product_id: string; purchase_count?: number; tracking_user_count?: number; recent_additions_30d?: number; recent_additions_90d?: number; updated_at?: string }
        Update: Partial<Database['public']['Tables']['catalog_product_popularity']['Insert']>
        Relationships: [{ foreignKeyName: 'catalog_product_popularity_catalog_product_id_fkey'; columns: ['catalog_product_id']; isOneToOne: true; referencedRelation: 'catalog_products'; referencedColumns: ['id'] }]
      }
      catalog_products: {
        Row: { id: string; brand: string | null; name: string; model_number: string | null; manufacturer_part_number: string | null; category: string | null; image_url: string | null; variant_data: Json; identity_key: string; is_featured: boolean; featured_rank: number | null; created_at: string; updated_at: string; last_enriched_at: string | null }
        Insert: { id?: string; brand?: string | null; name: string; model_number?: string | null; manufacturer_part_number?: string | null; category?: string | null; image_url?: string | null; variant_data?: Json; is_featured?: boolean; featured_rank?: number | null; last_enriched_at?: string | null }
        Update: Partial<Database['public']['Tables']['catalog_products']['Insert']>
        Relationships: []
      }
      catalog_product_aliases: {
        Row: { id: string; catalog_product_id: string; alias: string; normalized_alias: string; created_at: string }
        Insert: { id?: string; catalog_product_id: string; alias: string }
        Update: Partial<Database['public']['Tables']['catalog_product_aliases']['Insert']>
        Relationships: [{ foreignKeyName: 'catalog_product_aliases_catalog_product_id_fkey'; columns: ['catalog_product_id']; isOneToOne: false; referencedRelation: 'catalog_products'; referencedColumns: ['id'] }]
      }
      catalog_product_identifiers: {
        Row: { id: string; catalog_product_id: string; identifier_type: 'gtin' | 'ean' | 'upc' | 'mpn' | 'ebay_epid' | 'retailer_sku'; identifier_value: string; normalized_identifier: string; provider: string; provider_product_id: string | null; created_at: string }
        Insert: { id?: string; catalog_product_id: string; identifier_type: 'gtin' | 'ean' | 'upc' | 'mpn' | 'ebay_epid' | 'retailer_sku'; identifier_value: string; provider: string; provider_product_id?: string | null }
        Update: Partial<Database['public']['Tables']['catalog_product_identifiers']['Insert']>
        Relationships: [{ foreignKeyName: 'catalog_product_identifiers_catalog_product_id_fkey'; columns: ['catalog_product_id']; isOneToOne: false; referencedRelation: 'catalog_products'; referencedColumns: ['id'] }]
      }
      catalog_services: {
        Row: { id: string; name: string; normalized_name: string; category: string; website_url: string | null; manage_url: string | null; logo_url: string | null; supported_capabilities: Json; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; category: string; website_url?: string | null; manage_url?: string | null; logo_url?: string | null; supported_capabilities?: Json }
        Update: Partial<Database['public']['Tables']['catalog_services']['Insert']>
        Relationships: []
      }
      catalog_subscription_plans: {
        Row: { id: string; service_id: string; name: string; normalized_name: string; price_cents: number | null; currency: string | null; cadence: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one_off' | null; feature_data: Json; observed_at: string | null; source: string | null; source_url: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; service_id: string; name: string; price_cents?: number | null; currency?: string | null; cadence?: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one_off' | null; feature_data?: Json; observed_at?: string | null; source?: string | null; source_url?: string | null }
        Update: Partial<Database['public']['Tables']['catalog_subscription_plans']['Insert']>
        Relationships: [{ foreignKeyName: 'catalog_subscription_plans_service_id_fkey'; columns: ['service_id']; isOneToOne: false; referencedRelation: 'catalog_services'; referencedColumns: ['id'] }]
      }
      purchases: {
        Row: { id: string; user_id: string; catalog_product_id: string | null; custom_product_name: string | null; retailer_name: string; paid_amount_cents: number; currency: string; purchase_date: string; return_deadline: string | null; return_deadline_source: 'user_confirmed' | 'estimated' | 'retailer_policy' | 'unknown'; purchase_url: string | null; monitoring_status: 'monitoring' | 'limited' | 'manual_only' | 'paused' | 'source_unavailable' | 'resolved'; created_at: string; updated_at: string }
        Insert: { id?: string; user_id?: string; catalog_product_id?: string | null; custom_product_name?: string | null; retailer_name: string; paid_amount_cents: number; currency?: string; purchase_date: string; return_deadline?: string | null; return_deadline_source?: 'user_confirmed' | 'estimated' | 'retailer_policy' | 'unknown'; purchase_url?: string | null; monitoring_status?: 'monitoring' | 'limited' | 'manual_only' | 'paused' | 'source_unavailable' | 'resolved' }
        Update: Partial<Database['public']['Tables']['purchases']['Insert']>
        Relationships: [{ foreignKeyName: 'purchases_catalog_product_id_fkey'; columns: ['catalog_product_id']; isOneToOne: false; referencedRelation: 'catalog_products'; referencedColumns: ['id'] }]
      }
      subscriptions: {
        Row: { id: string; user_id: string; catalog_service_id: string | null; catalog_plan_id: string | null; custom_service_name: string | null; amount_cents: number; currency: string; billing_cadence: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one_off'; start_date: string; renewal_date: string | null; trial_end: string | null; promo_end: string | null; monitoring_status: 'monitoring' | 'limited' | 'manual_only' | 'paused' | 'source_unavailable' | 'cancelled'; manage_url: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id?: string; catalog_service_id?: string | null; catalog_plan_id?: string | null; custom_service_name?: string | null; amount_cents: number; currency?: string; billing_cadence: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one_off'; start_date: string; renewal_date?: string | null; trial_end?: string | null; promo_end?: string | null; monitoring_status?: 'monitoring' | 'limited' | 'manual_only' | 'paused' | 'source_unavailable' | 'cancelled'; manage_url?: string | null }
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
        Relationships: [{ foreignKeyName: 'subscriptions_catalog_service_id_fkey'; columns: ['catalog_service_id']; isOneToOne: false; referencedRelation: 'catalog_services'; referencedColumns: ['id'] }, { foreignKeyName: 'subscriptions_catalog_plan_id_fkey'; columns: ['catalog_plan_id']; isOneToOne: false; referencedRelation: 'catalog_subscription_plans'; referencedColumns: ['id'] }]
      }
      subscription_usage_events: {
        Row: { id: string; user_id: string; subscription_id: string; usage_type: string; quantity: number | null; occurred_at: string; source: string; metadata: Json; created_at: string }
        Insert: { id?: string; user_id?: string; subscription_id: string; usage_type: string; quantity?: number | null; occurred_at: string; source?: string; metadata?: Json }
        Update: Partial<Database['public']['Tables']['subscription_usage_events']['Insert']>
        Relationships: [{ foreignKeyName: 'subscription_usage_events_subscription_id_fkey'; columns: ['subscription_id']; isOneToOne: false; referencedRelation: 'subscriptions'; referencedColumns: ['id'] }]
      }
      alerts: {
        Row: { id: string; user_id: string; purchase_id: string | null; subscription_id: string | null; alert_type: 'price_drop' | 'return_window_closing' | 'price_change' | 'source_unavailable' | 'renewal_approaching' | 'trial_ending' | 'promo_ending' | 'plan_change' | 'cheaper_plan' | 'low_usage'; severity: 'info' | 'low' | 'medium' | 'high' | 'urgent'; title: string; summary: string; source: string | null; source_url: string | null; observed_at: string | null; next_action: string | null; dedupe_key: string; is_read: boolean; read_at: string | null; created_at: string }
        Insert: { id?: string; user_id?: string; purchase_id?: string | null; subscription_id?: string | null; alert_type: 'price_drop' | 'return_window_closing' | 'price_change' | 'source_unavailable' | 'renewal_approaching' | 'trial_ending' | 'promo_ending' | 'plan_change' | 'cheaper_plan' | 'low_usage'; severity?: 'info' | 'low' | 'medium' | 'high' | 'urgent'; title: string; summary: string; source?: string | null; source_url?: string | null; observed_at?: string | null; next_action?: string | null; dedupe_key: string; is_read?: boolean; read_at?: string | null }
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>
        Relationships: [{ foreignKeyName: 'alerts_purchase_id_fkey'; columns: ['purchase_id']; isOneToOne: false; referencedRelation: 'purchases'; referencedColumns: ['id'] }, { foreignKeyName: 'alerts_subscription_id_fkey'; columns: ['subscription_id']; isOneToOne: false; referencedRelation: 'subscriptions'; referencedColumns: ['id'] }]
      }
      product_sources: {
        Row: { id: string; catalog_product_id: string; provider: string; listing_identifier: string; source_url: string | null; is_active: boolean; last_successful_check: string | null; last_error_at: string | null; last_error_metadata: Json | null; created_at: string; updated_at: string }
        Insert: { id?: string; catalog_product_id: string; provider: string; listing_identifier: string; source_url?: string | null; is_active?: boolean; last_successful_check?: string | null; last_error_at?: string | null; last_error_metadata?: Json | null }
        Update: Partial<Database['public']['Tables']['product_sources']['Insert']>
        Relationships: [{ foreignKeyName: 'product_sources_catalog_product_id_fkey'; columns: ['catalog_product_id']; isOneToOne: false; referencedRelation: 'catalog_products'; referencedColumns: ['id'] }]
      }
      price_observations: {
        Row: { id: string; catalog_product_id: string; product_source_id: string; observed_price_cents: number; currency: string; availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'unknown' | null; observed_at: string; source_url: string | null; source_reference: string | null; metadata: Json; created_at: string }
        Insert: { id?: string; catalog_product_id: string; product_source_id: string; observed_price_cents: number; currency: string; availability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'unknown' | null; observed_at: string; source_url?: string | null; source_reference?: string | null; metadata?: Json }
        Update: Partial<Database['public']['Tables']['price_observations']['Insert']>
        Relationships: [{ foreignKeyName: 'price_observations_catalog_product_id_fkey'; columns: ['catalog_product_id']; isOneToOne: false; referencedRelation: 'catalog_products'; referencedColumns: ['id'] }, { foreignKeyName: 'price_observations_product_source_id_fkey'; columns: ['product_source_id']; isOneToOne: false; referencedRelation: 'product_sources'; referencedColumns: ['id'] }]
      }
      subscription_plan_observations: {
        Row: { id: string; catalog_service_id: string; catalog_plan_id: string | null; price_cents: number | null; currency: string | null; cadence: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one_off' | null; feature_data: Json; source: string; source_url: string | null; observed_at: string; created_at: string }
        Insert: { id?: string; catalog_service_id: string; catalog_plan_id?: string | null; price_cents?: number | null; currency?: string | null; cadence?: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one_off' | null; feature_data?: Json; source: string; source_url?: string | null; observed_at: string }
        Update: Partial<Database['public']['Tables']['subscription_plan_observations']['Insert']>
        Relationships: [{ foreignKeyName: 'subscription_plan_observations_catalog_service_id_fkey'; columns: ['catalog_service_id']; isOneToOne: false; referencedRelation: 'catalog_services'; referencedColumns: ['id'] }, { foreignKeyName: 'subscription_plan_observations_catalog_plan_id_fkey'; columns: ['catalog_plan_id']; isOneToOne: false; referencedRelation: 'catalog_subscription_plans'; referencedColumns: ['id'] }]
      }
      entities: { Row: { id: string; entity_type: 'retail_product' | 'subscription'; provider: string; external_id: string; display_name: string; brand: string | null; variant: string | null; size_label: string | null; category: string | null; source_url: string | null; metadata: Json; created_at: string; updated_at: string }; Insert: { id?: string; entity_type: 'retail_product' | 'subscription'; provider: string; external_id: string; display_name: string; brand?: string | null; variant?: string | null; size_label?: string | null; category?: string | null; source_url?: string | null; metadata?: Json }; Update: never; Relationships: [] }
      observations: { Row: { id: string; entity_id: string; observation_type: 'price' | 'plan' | 'renewal'; amount_cents: number | null; currency: string | null; plan_name: string | null; billing_interval: string | null; renewal_at: string | null; source_name: string; source_url: string | null; observed_at: string; origin: 'seed' | 'manual' | 'authorised_feed'; metadata: Json; created_at: string }; Insert: never; Update: never; Relationships: [{ foreignKeyName: 'observations_entity_id_fkey'; columns: ['entity_id']; isOneToOne: false; referencedRelation: 'entities'; referencedColumns: ['id'] }] }
      baselines: { Row: { id: string; user_id: string; entity_id: string; baseline_type: 'purchase' | 'subscription'; display_name: string; original_amount_cents: number; currency: string; plan_name: string | null; billing_interval: string | null; renewal_at: string | null; captured_at: string; source_url: string | null; created_at: string; updated_at: string }; Insert: { id?: string; user_id: string; entity_id: string; baseline_type: 'purchase' | 'subscription'; display_name: string; original_amount_cents: number; currency?: string; plan_name?: string | null; billing_interval?: string | null; renewal_at?: string | null; captured_at: string; source_url?: string | null }; Update: Partial<Database['public']['Tables']['baselines']['Insert']>; Relationships: [{ foreignKeyName: 'baselines_entity_id_fkey'; columns: ['entity_id']; isOneToOne: false; referencedRelation: 'entities'; referencedColumns: ['id'] }] }
      ingestion_runs: { Row: { id: string; source_name: string; started_at: string; completed_at: string | null; status: string; records_processed: number; error_summary: string | null }; Insert: never; Update: never; Relationships: [] }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

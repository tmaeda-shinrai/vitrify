export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string | null;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          ip_hash: string | null;
          metadata: Json | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          ip_hash?: string | null;
          metadata?: Json | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          ip_hash?: string | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      brands: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          vitrine_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          vitrine_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          vitrine_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "brands_vitrine_id_fkey";
            columns: ["vitrine_id"];
            isOneToOne: false;
            referencedRelation: "vitrines";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string | null;
          display_order: number | null;
          id: string;
          name: string;
          vitrine_id: string;
        };
        Insert: {
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          name: string;
          vitrine_id: string;
        };
        Update: {
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          name?: string;
          vitrine_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_vitrine_id_fkey";
            columns: ["vitrine_id"];
            isOneToOne: false;
            referencedRelation: "vitrines";
            referencedColumns: ["id"];
          },
        ];
      };
      coupon_redemptions: {
        Row: {
          coupon_id: string;
          created_at: string | null;
          id: string;
          invoice_id: string | null;
          owner_id: string;
          redeemed_at: string | null;
          subscription_id: string | null;
        };
        Insert: {
          coupon_id: string;
          created_at?: string | null;
          id?: string;
          invoice_id?: string | null;
          owner_id: string;
          redeemed_at?: string | null;
          subscription_id?: string | null;
        };
        Update: {
          coupon_id?: string;
          created_at?: string | null;
          id?: string;
          invoice_id?: string | null;
          owner_id?: string;
          redeemed_at?: string | null;
          subscription_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coupon_redemptions_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coupon_redemptions_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coupon_redemptions_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          applies_to_plan: Database["public"]["Enums"]["subscription_plan"] | null;
          code: string;
          created_at: string | null;
          description: string | null;
          discount_type: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value: number;
          id: string;
          is_active: boolean;
          max_redemptions: number | null;
          redemptions_count: number;
          updated_at: string | null;
          valid_from: string | null;
          valid_until: string | null;
        };
        Insert: {
          applies_to_plan?: Database["public"]["Enums"]["subscription_plan"] | null;
          code: string;
          created_at?: string | null;
          description?: string | null;
          discount_type: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value: number;
          id?: string;
          is_active?: boolean;
          max_redemptions?: number | null;
          redemptions_count?: number;
          updated_at?: string | null;
          valid_from?: string | null;
          valid_until?: string | null;
        };
        Update: {
          applies_to_plan?: Database["public"]["Enums"]["subscription_plan"] | null;
          code?: string;
          created_at?: string | null;
          description?: string | null;
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value?: number;
          id?: string;
          is_active?: boolean;
          max_redemptions?: number | null;
          redemptions_count?: number;
          updated_at?: string | null;
          valid_from?: string | null;
          valid_until?: string | null;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          amount_cents: number;
          asaas_payment_id: string;
          created_at: string | null;
          due_date: string;
          id: string;
          invoice_url: string | null;
          paid_at: string | null;
          payment_method: string | null;
          status: string;
          subscription_id: string;
        };
        Insert: {
          amount_cents: number;
          asaas_payment_id: string;
          created_at?: string | null;
          due_date: string;
          id?: string;
          invoice_url?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          status: string;
          subscription_id: string;
        };
        Update: {
          amount_cents?: number;
          asaas_payment_id?: string;
          created_at?: string | null;
          due_date?: string;
          id?: string;
          invoice_url?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          status?: string;
          subscription_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      order_intents: {
        Row: {
          created_at: string | null;
          id: string;
          ip_hash: string | null;
          product_id: string | null;
          source: string | null;
          user_agent_short: string | null;
          vitrine_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          ip_hash?: string | null;
          product_id?: string | null;
          source?: string | null;
          user_agent_short?: string | null;
          vitrine_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          ip_hash?: string | null;
          product_id?: string | null;
          source?: string | null;
          user_agent_short?: string | null;
          vitrine_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_intents_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_intents_vitrine_id_fkey";
            columns: ["vitrine_id"];
            isOneToOne: false;
            referencedRelation: "vitrines";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_webhook_events: {
        Row: {
          event_id: string;
          event_type: string | null;
          id: string;
          payment_id: string | null;
          received_at: string;
        };
        Insert: {
          event_id: string;
          event_type?: string | null;
          id?: string;
          payment_id?: string | null;
          received_at?: string;
        };
        Update: {
          event_id?: string;
          event_type?: string | null;
          id?: string;
          payment_id?: string | null;
          received_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          alt_text: string | null;
          created_at: string | null;
          display_order: number | null;
          height: number | null;
          id: string;
          product_id: string;
          size_bytes: number | null;
          url: string;
          width: number | null;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          height?: number | null;
          id?: string;
          product_id: string;
          size_bytes?: number | null;
          url: string;
          width?: number | null;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          height?: number | null;
          id?: string;
          product_id?: string;
          size_bytes?: number | null;
          url?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          brand_id: string | null;
          category_id: string | null;
          created_at: string | null;
          description: string | null;
          display_order: number | null;
          id: string;
          intents_count: number | null;
          is_active: boolean | null;
          is_available: boolean | null;
          name: string;
          price_cents: number;
          promo_price_cents: number | null;
          search_text: unknown;
          updated_at: string | null;
          views_count: number | null;
          vitrine_id: string;
        };
        Insert: {
          brand_id?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          intents_count?: number | null;
          is_active?: boolean | null;
          is_available?: boolean | null;
          name: string;
          price_cents: number;
          promo_price_cents?: number | null;
          search_text?: unknown;
          updated_at?: string | null;
          views_count?: number | null;
          vitrine_id: string;
        };
        Update: {
          brand_id?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          intents_count?: number | null;
          is_active?: boolean | null;
          is_available?: boolean | null;
          name?: string;
          price_cents?: number;
          promo_price_cents?: number | null;
          search_text?: unknown;
          updated_at?: string | null;
          views_count?: number | null;
          vitrine_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_vitrine_id_fkey";
            columns: ["vitrine_id"];
            isOneToOne: false;
            referencedRelation: "vitrines";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          deletion_requested_at: string | null;
          full_name: string;
          id: string;
          onboarding_completed_at: string | null;
          updated_at: string | null;
          whatsapp: string | null;
          whatsapp_verified_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          deletion_requested_at?: string | null;
          full_name: string;
          id: string;
          onboarding_completed_at?: string | null;
          updated_at?: string | null;
          whatsapp?: string | null;
          whatsapp_verified_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          deletion_requested_at?: string | null;
          full_name?: string;
          id?: string;
          onboarding_completed_at?: string | null;
          updated_at?: string | null;
          whatsapp?: string | null;
          whatsapp_verified_at?: string | null;
        };
        Relationships: [];
      };
      referrals: {
        Row: {
          code: string;
          converted_at: string | null;
          created_at: string | null;
          id: string;
          referred_id: string | null;
          referrer_id: string;
          reward_granted: boolean | null;
        };
        Insert: {
          code: string;
          converted_at?: string | null;
          created_at?: string | null;
          id?: string;
          referred_id?: string | null;
          referrer_id: string;
          reward_granted?: boolean | null;
        };
        Update: {
          code?: string;
          converted_at?: string | null;
          created_at?: string | null;
          id?: string;
          referred_id?: string | null;
          referrer_id?: string;
          reward_granted?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey";
            columns: ["referred_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey";
            columns: ["referrer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          asaas_customer_id: string | null;
          asaas_subscription_id: string | null;
          canceled_at: string | null;
          created_at: string | null;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          owner_id: string;
          past_due_since: string | null;
          plan: Database["public"]["Enums"]["subscription_plan"];
          status: Database["public"]["Enums"]["subscription_status"];
          updated_at: string | null;
        };
        Insert: {
          asaas_customer_id?: string | null;
          asaas_subscription_id?: string | null;
          canceled_at?: string | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          owner_id: string;
          past_due_since?: string | null;
          plan?: Database["public"]["Enums"]["subscription_plan"];
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string | null;
        };
        Update: {
          asaas_customer_id?: string | null;
          asaas_subscription_id?: string | null;
          canceled_at?: string | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          owner_id?: string;
          past_due_since?: string | null;
          plan?: Database["public"]["Enums"]["subscription_plan"];
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      suggested_brands: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      vitrine_daily_stats: {
        Row: {
          intents_count: number;
          stat_date: string;
          views_count: number;
          vitrine_id: string;
        };
        Insert: {
          intents_count?: number;
          stat_date: string;
          views_count?: number;
          vitrine_id: string;
        };
        Update: {
          intents_count?: number;
          stat_date?: string;
          views_count?: number;
          vitrine_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vitrine_daily_stats_vitrine_id_fkey";
            columns: ["vitrine_id"];
            isOneToOne: false;
            referencedRelation: "vitrines";
            referencedColumns: ["id"];
          },
        ];
      };
      vitrines: {
        Row: {
          created_at: string | null;
          hero_image_url: string | null;
          id: string;
          is_active: boolean | null;
          is_default: boolean | null;
          owner_id: string;
          slug: string;
          subtitle: string | null;
          theme_mode: string | null;
          theme_primary: string | null;
          title: string;
          updated_at: string | null;
          views_count: number | null;
        };
        Insert: {
          created_at?: string | null;
          hero_image_url?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          owner_id: string;
          slug: string;
          subtitle?: string | null;
          theme_mode?: string | null;
          theme_primary?: string | null;
          title: string;
          updated_at?: string | null;
          views_count?: number | null;
        };
        Update: {
          created_at?: string | null;
          hero_image_url?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          owner_id?: string;
          slug?: string;
          subtitle?: string | null;
          theme_mode?: string | null;
          theme_primary?: string | null;
          title?: string;
          updated_at?: string | null;
          views_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "vitrines_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      anonymize_account: { Args: { p_user: string }; Returns: undefined };
      attach_asaas_checkout: {
        Args: {
          p_customer_id?: string;
          p_period_end?: string;
          p_period_start?: string;
          p_subscription_id?: string;
        };
        Returns: undefined;
      };
      downgrade_to_free: { Args: never; Returns: undefined };
      increment_vitrine_views: { Args: { p_slug: string }; Returns: undefined };
      is_slug_available: { Args: { p_slug: string }; Returns: boolean };
      redeem_coupon: {
        Args: { p_code: string; p_subscription_id: string };
        Returns: boolean;
      };
      request_account_deletion: { Args: never; Returns: undefined };
      request_subscription_cancel: {
        Args: { p_comment?: string; p_reason?: string };
        Returns: undefined;
      };
      validate_coupon: {
        Args: {
          p_code: string;
          p_plan: Database["public"]["Enums"]["subscription_plan"];
        };
        Returns: {
          code: string;
          discount_type: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value: number;
        }[];
      };
    };
    Enums: {
      coupon_discount_type: "percent" | "fixed_cents" | "free_days";
      subscription_plan: "free" | "pro" | "plus";
      subscription_status: "trialing" | "active" | "past_due" | "canceled" | "expired";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      coupon_discount_type: ["percent", "fixed_cents", "free_days"],
      subscription_plan: ["free", "pro", "plus"],
      subscription_status: ["trialing", "active", "past_due", "canceled", "expired"],
    },
  },
} as const;

// This file will be replaced by generated types from `supabase gen types typescript`
// For now, it provides a placeholder Database type

export type UserRole = 'super_admin' | 'admin' | 'marketing' | 'user';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_production'
  | 'ready'
  | 'delivered'
  | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type DiscountType = 'percentage' | 'fixed';
export type NotificationType = 'new_order' | 'low_stock' | 'new_review' | 'order_status_change';
export type AuditAction = 'create' | 'update' | 'delete';
export type ContentSection =
  | 'hero'
  | 'products_intro'
  | 'about_intro'
  | 'about_footer'
  | 'contact_intro'
  | 'footer'
  | 'seo';
export type SeasonTag =
  | 'navidad'
  | 'san_juan'
  | 'sant_jordi'
  | 'pascua'
  | 'todos_santos'
  | 'todo_el_ano';
export type DeliveryType = 'delivery' | 'pickup';
export type PaymentMethod = 'stripe' | 'bizum' | 'cash';
export type InventoryMovementType =
  | 'production'
  | 'order'
  | 'physical_sale'
  | 'damaged_product'
  | 'damaged_sale'
  | 'manual_adjustment';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          preferred_language: string;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          preferred_language?: string;
          stripe_customer_id?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          preferred_language?: string;
          stripe_customer_id?: string | null;
        };
      };
      languages: {
        Row: {
          code: string;
          name: string;
          native_name: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          code: string;
          name: string;
          native_name: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          name?: string;
          native_name?: string;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          image_url: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          image_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
        Update: {
          slug?: string;
          image_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
      };
      category_translations: {
        Row: {
          id: string;
          category_id: string;
          language_code: string;
          name: string;
          description: string | null;
        };
        Insert: {
          category_id: string;
          language_code: string;
          name: string;
          description?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          slug: string;
          category_id: string;
          price: number;
          compare_at_price: number | null;
          tax_rate: number;
          is_visible: boolean;
          is_featured: boolean;
          display_on_landing: boolean;
          sort_order: number;
          preparation_time_minutes: number | null;
          weight_grams: number | null;
          season_tags: SeasonTag[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          category_id: string;
          price: number;
          compare_at_price?: number | null;
          tax_rate?: number;
          is_visible?: boolean;
          is_featured?: boolean;
          display_on_landing?: boolean;
          sort_order?: number;
          preparation_time_minutes?: number | null;
          weight_grams?: number | null;
          season_tags?: SeasonTag[];
        };
        Update: {
          slug?: string;
          category_id?: string;
          price?: number;
          compare_at_price?: number | null;
          tax_rate?: number;
          is_visible?: boolean;
          is_featured?: boolean;
          display_on_landing?: boolean;
          sort_order?: number;
          preparation_time_minutes?: number | null;
          weight_grams?: number | null;
          season_tags?: SeasonTag[];
        };
      };
      product_translations: {
        Row: {
          id: string;
          product_id: string;
          language_code: string;
          name: string;
          short_description: string | null;
          description: string | null;
        };
        Insert: {
          product_id: string;
          language_code: string;
          name: string;
          short_description?: string | null;
          description?: string | null;
        };
        Update: {
          name?: string;
          short_description?: string | null;
          description?: string | null;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          product_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
        Update: {
          url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
      };
      ingredients: {
        Row: {
          id: string;
          product_id: string;
          sort_order: number;
          is_allergen: boolean;
        };
        Insert: {
          product_id: string;
          sort_order?: number;
          is_allergen?: boolean;
        };
        Update: {
          sort_order?: number;
          is_allergen?: boolean;
        };
      };
      ingredient_translations: {
        Row: {
          id: string;
          ingredient_id: string;
          language_code: string;
          name: string;
        };
        Insert: {
          ingredient_id: string;
          language_code: string;
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      preparation_steps: {
        Row: {
          id: string;
          product_id: string;
          step_number: number;
          image_url: string | null;
          duration_minutes: number | null;
        };
        Insert: {
          product_id: string;
          step_number: number;
          image_url?: string | null;
          duration_minutes?: number | null;
        };
        Update: {
          step_number?: number;
          image_url?: string | null;
          duration_minutes?: number | null;
        };
      };
      preparation_step_translations: {
        Row: {
          id: string;
          step_id: string;
          language_code: string;
          title: string;
          description: string | null;
        };
        Insert: {
          step_id: string;
          language_code: string;
          title: string;
          description?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
        };
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          stock: number;
          low_stock_threshold: number;
          updated_at: string;
        };
        Insert: {
          product_id: string;
          stock?: number;
          low_stock_threshold?: number;
        };
        Update: {
          stock?: number;
          low_stock_threshold?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: OrderStatus;
          payment_status: PaymentStatus;
          subtotal: number;
          discount_amount: number;
          total: number;
          coupon_id: string | null;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          delivery_type: DeliveryType;
          payment_method: PaymentMethod;
          delivery_fee: number;
          address_id: string | null;
          delivery_date: string | null;
          notes: string | null;
          buyer_nif: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          subtotal: number;
          discount_amount?: number;
          total: number;
          coupon_id?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          delivery_type?: DeliveryType;
          payment_method?: PaymentMethod;
          delivery_fee?: number;
          address_id?: string | null;
          delivery_date?: string | null;
          notes?: string | null;
          buyer_nif?: string | null;
        };
        Update: {
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          subtotal?: number;
          discount_amount?: number;
          total?: number;
          coupon_id?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          delivery_type?: DeliveryType;
          payment_method?: PaymentMethod;
          delivery_fee?: number;
          address_id?: string | null;
          delivery_date?: string | null;
          notes?: string | null;
          buyer_nif?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          tax_rate: number;
        };
        Insert: {
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          tax_rate?: number;
        };
        Update: {
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          tax_rate?: number;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: DiscountType;
          discount_value: number;
          min_order_amount: number | null;
          max_uses: number | null;
          current_uses: number;
          valid_from: string;
          valid_until: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          code: string;
          discount_type: DiscountType;
          discount_value: number;
          min_order_amount?: number | null;
          max_uses?: number | null;
          current_uses?: number;
          valid_from?: string;
          valid_until?: string | null;
          is_active?: boolean;
        };
        Update: {
          code?: string;
          discount_type?: DiscountType;
          discount_value?: number;
          min_order_amount?: number | null;
          max_uses?: number | null;
          current_uses?: number;
          valid_from?: string;
          valid_until?: string | null;
          is_active?: boolean;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string | null;
          rating: number;
          comment: string | null;
          status: ReviewStatus;
          admin_response: string | null;
          review_type: string;
          is_company_review: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          product_id?: string | null;
          rating: number;
          comment?: string | null;
          status?: ReviewStatus;
          review_type?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
          status?: ReviewStatus;
          admin_response?: string | null;
        };
      };
      review_images: {
        Row: {
          id: string;
          review_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
        };
        Insert: {
          review_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
        };
        Update: {
          url?: string;
          alt_text?: string | null;
          sort_order?: number;
        };
      };
      cms_content: {
        Row: {
          id: string;
          section: ContentSection;
          image_url: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          section: ContentSection;
          image_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
        Update: {
          section?: ContentSection;
          image_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
      };
      cms_content_translations: {
        Row: {
          id: string;
          content_id: string;
          language_code: string;
          title: string | null;
          subtitle: string | null;
          body: string | null;
          cta_text: string | null;
          cta_url: string | null;
        };
        Insert: {
          content_id: string;
          language_code: string;
          title?: string | null;
          subtitle?: string | null;
          body?: string | null;
          cta_text?: string | null;
          cta_url?: string | null;
        };
        Update: {
          title?: string | null;
          subtitle?: string | null;
          body?: string | null;
          cta_text?: string | null;
          cta_url?: string | null;
        };
      };
      cms_media: {
        Row: {
          id: string;
          content_id: string;
          url: string;
          alt_text: string | null;
          media_type: string;
          sort_order: number;
        };
        Insert: {
          content_id: string;
          url: string;
          alt_text?: string | null;
          media_type?: string;
          sort_order?: number;
        };
        Update: {
          url?: string;
          alt_text?: string | null;
          media_type?: string;
          sort_order?: number;
        };
      };
      timeline_events: {
        Row: {
          id: string;
          year: number;
          image_url: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          year: number;
          image_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
        Update: {
          year?: number;
          image_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
      };
      timeline_event_translations: {
        Row: {
          id: string;
          event_id: string;
          language_code: string;
          title: string;
          description: string | null;
        };
        Insert: {
          event_id: string;
          language_code: string;
          title: string;
          description?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
        };
      };
      feature_cards: {
        Row: {
          id: string;
          icon: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          icon?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
        Update: {
          icon?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
      };
      feature_card_translations: {
        Row: {
          id: string;
          card_id: string;
          language_code: string;
          title: string;
          description: string | null;
        };
        Insert: {
          card_id: string;
          language_code: string;
          title: string;
          description?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
        };
      };
      business_info: {
        Row: {
          id: string;
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
        };
        Update: {
          key?: string;
          value?: string;
        };
      };
      business_info_translations: {
        Row: {
          id: string;
          business_info_id: string;
          language_code: string;
          value: string;
        };
        Insert: {
          business_info_id: string;
          language_code: string;
          value: string;
        };
        Update: {
          value?: string;
        };
      };
      social_links: {
        Row: {
          id: string;
          platform: string;
          url: string;
          icon: string | null;
          sort_order: number;
          is_visible: boolean;
        };
        Insert: {
          platform: string;
          url: string;
          icon?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
        Update: {
          platform?: string;
          url?: string;
          icon?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
      };
      production_schedule: {
        Row: {
          id: string;
          product_id: string;
          day_of_week: number;
          base_quantity: number;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          product_id: string;
          day_of_week: number;
          base_quantity: number;
          is_active?: boolean;
        };
        Update: {
          base_quantity?: number;
          is_active?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          data: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          data?: Json | null;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
        };
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string;
          action: AuditAction;
          table_name: string;
          record_id: string;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          action: AuditAction;
          table_name: string;
          record_id: string;
          old_data?: Json | null;
          new_data?: Json | null;
        };
        Update: never;
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          full_name: string;
          phone: string | null;
          street: string;
          city: string;
          postal_code: string;
          province: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          label?: string | null;
          full_name: string;
          phone?: string | null;
          street: string;
          city: string;
          postal_code: string;
          province: string;
          country?: string;
          is_default?: boolean;
        };
        Update: {
          label?: string | null;
          full_name?: string;
          phone?: string | null;
          street?: string;
          city?: string;
          postal_code?: string;
          province?: string;
          country?: string;
          is_default?: boolean;
        };
      };
      invoices: {
        Row: {
          id: string;
          order_id: string;
          invoice_number: string;
          invoice_date: string;
          seller_name: string;
          seller_nif: string;
          seller_address: string;
          buyer_name: string;
          buyer_nif: string | null;
          buyer_address: string | null;
          buyer_email: string | null;
          subtotal_base: number;
          total_iva: number;
          total: number;
          discount_amount: number;
          delivery_fee: number;
          pdf_url: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          order_id: string;
          invoice_number: string;
          seller_name: string;
          seller_nif: string;
          seller_address: string;
          buyer_name: string;
          buyer_nif?: string | null;
          buyer_address?: string | null;
          buyer_email?: string | null;
          subtotal_base: number;
          total_iva: number;
          total: number;
          discount_amount?: number;
          delivery_fee?: number;
          pdf_url?: string | null;
          sent_at?: string | null;
        };
        Update: {
          pdf_url?: string | null;
          sent_at?: string | null;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          product_name: string;
          quantity: number;
          unit_price_incl_iva: number;
          tax_rate: number;
          unit_base: number;
          line_base: number;
          line_iva: number;
          line_total: number;
        };
        Insert: {
          invoice_id: string;
          product_name: string;
          quantity: number;
          unit_price_incl_iva: number;
          tax_rate: number;
          unit_base: number;
          line_base: number;
          line_iva: number;
          line_total: number;
        };
        Update: never;
      };
      inventory_movements: {
        Row: {
          id: string;
          product_id: string;
          movement_type: InventoryMovementType;
          quantity: number;
          reference_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          product_id: string;
          movement_type: InventoryMovementType;
          quantity: number;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: never;
      };
      daily_inventory_reports: {
        Row: {
          id: string;
          report_date: string;
          created_by: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          report_date: string;
          created_by: string;
          notes?: string | null;
        };
        Update: {
          notes?: string | null;
        };
      };
      daily_inventory_report_items: {
        Row: {
          id: string;
          report_id: string;
          product_id: string;
          produced: number;
          sold_online: number;
          sold_physical: number;
          damaged: number;
          leftover: number;
        };
        Insert: {
          report_id: string;
          product_id: string;
          produced?: number;
          sold_online?: number;
          sold_physical?: number;
          damaged?: number;
        };
        Update: {
          produced?: number;
          sold_online?: number;
          sold_physical?: number;
          damaged?: number;
        };
      };
      recurring_order_schedules: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          contact_name: string | null;
          contact_phone: string | null;
          delivery_type: DeliveryType;
          address_id: string | null;
          payment_method: PaymentMethod;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          business_name: string;
          contact_name?: string | null;
          contact_phone?: string | null;
          delivery_type?: DeliveryType;
          address_id?: string | null;
          payment_method?: PaymentMethod;
          notes?: string | null;
          is_active?: boolean;
        };
        Update: {
          business_name?: string;
          contact_name?: string | null;
          contact_phone?: string | null;
          delivery_type?: DeliveryType;
          address_id?: string | null;
          payment_method?: PaymentMethod;
          notes?: string | null;
          is_active?: boolean;
        };
      };
      recurring_order_items: {
        Row: {
          id: string;
          schedule_id: string;
          product_id: string;
          day_of_week: number;
          quantity: number;
          is_active: boolean;
        };
        Insert: {
          schedule_id: string;
          product_id: string;
          day_of_week: number;
          quantity: number;
          is_active?: boolean;
        };
        Update: {
          quantity?: number;
          is_active?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
      is_admin_or_above: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_marketing_or_above: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      review_status: ReviewStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      discount_type: DiscountType;
      notification_type: NotificationType;
      audit_action: AuditAction;
      content_section: ContentSection;
      season_tag: SeasonTag;
      delivery_type: DeliveryType;
      payment_method: PaymentMethod;
      inventory_movement_type: InventoryMovementType;
    };
  };
}

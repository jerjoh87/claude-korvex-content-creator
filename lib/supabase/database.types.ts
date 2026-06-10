export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      analytics: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          campaign_id: string | null;
          metric_name: string;
          metric_value: number;
          dimensions: Json;
          occurred_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          campaign_id?: string | null;
          metric_name: string;
          metric_value?: number;
          dimensions?: Json;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['analytics']['Insert']>;
        Relationships: [];
      };
      brand_kits: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          colors: Json;
          fonts: Json;
          logos: Json;
          guidelines: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          colors?: Json;
          fonts?: Json;
          logos?: Json;
          guidelines?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['brand_kits']['Insert']>;
        Relationships: [];
      };
      business_profiles: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          name: string;
          industry: string | null;
          audience: Json;
          voice: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          name: string;
          industry?: string | null;
          audience?: Json;
          voice?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['business_profiles']['Insert']>;
        Relationships: [];
      };
      generated_content: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          campaign_id: string | null;
          prompt: string | null;
          content: string;
          content_type: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          campaign_id?: string | null;
          prompt?: string | null;
          content: string;
          content_type?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['generated_content']['Insert']>;
        Relationships: [];
      };
      template_library: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          category: string | null;
          industry: string | null;
          business_type: string | null;
          platform: string | null;
          objective: string | null;
          template_type: string;
          prompt_body: string;
          sample_output: string | null;
          recommended_tier: string | null;
          tags: Json;
          metadata: Json;
          is_featured: boolean | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          category?: string | null;
          industry?: string | null;
          business_type?: string | null;
          platform?: string | null;
          objective?: string | null;
          template_type: string;
          prompt_body: string;
          sample_output?: string | null;
          recommended_tier?: string | null;
          tags?: Json;
          metadata?: Json;
          is_featured?: boolean | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['template_library']['Insert']>;
        Relationships: [];
      };
      scheduled_posts: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          generated_content_id: string | null;
          social_account_id: string | null;
          scheduled_for: string;
          status: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          generated_content_id?: string | null;
          social_account_id?: string | null;
          scheduled_for: string;
          status?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['scheduled_posts']['Insert']>;
        Relationships: [];
      };
      social_accounts: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          platform: string;
          account_name: string | null;
          account_handle: string | null;
          platform_account_id: string | null;
          access_token_encrypted: string;
          refresh_token_encrypted: string | null;
          scopes: string[];
          expires_at: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          platform: string;
          account_name?: string | null;
          account_handle?: string | null;
          platform_account_id?: string | null;
          access_token_encrypted: string;
          refresh_token_encrypted?: string | null;
          scopes?: string[];
          expires_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['social_accounts']['Insert']>;
        Relationships: [];
      };
      workspace_members: {
        Row: {
          workspace_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member' | 'viewer';
          created_at: string;
        };
        Insert: {
          workspace_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member' | 'viewer';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['workspace_members']['Insert']>;
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['workspaces']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];

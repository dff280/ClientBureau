import type {
  ReportCategory,
  ReportStatus,
  RiskLevel,
  SubscriptionTier,
  UserRole,
  VerificationStatus,
} from "@/lib/types"

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: UserRole
          created_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          role?: UserRole
        }
        Relationships: []
      }
      contractor_profiles: {
        Row: {
          id: string
          user_id: string
          business_name: string
          trade: string
          city: string
          state: string
          license_number: string | null
          verification_status: VerificationStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          trade: string
          city: string
          state: string
          license_number?: string | null
          verification_status?: VerificationStatus
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["contractor_profiles"]["Insert"]>
        Relationships: []
      }
      client_profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          business_name: string | null
          city: string
          state: string
          zip: string | null
          phone_hash: string
          email_hash: string
          public_slug: string
          client_bureau_score: number
          risk_level: RiskLevel
          report_count: number
          created_at: string
          updated_at: string
          is_public: boolean
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          business_name?: string | null
          city: string
          state: string
          zip?: string | null
          phone_hash: string
          email_hash: string
          public_slug: string
          client_bureau_score?: number
          risk_level?: RiskLevel
          report_count?: number
          created_at?: string
          updated_at?: string
          is_public?: boolean
        }
        Update: Partial<Database["public"]["Tables"]["client_profiles"]["Insert"]>
        Relationships: []
      }
      client_reports: {
        Row: {
          id: string
          contractor_id: string
          client_id: string
          project_type: string
          project_city: string
          project_state: string
          contract_amount: number
          amount_unpaid: number
          report_category: ReportCategory
          payment_status: string
          report_summary: string
          detailed_experience: string
          public_summary: string
          evidence_attached: boolean
          status: ReportStatus
          moderation_note: string | null
          created_at: string
          approved_at: string | null
        }
        Insert: {
          id?: string
          contractor_id: string
          client_id: string
          project_type: string
          project_city: string
          project_state: string
          contract_amount: number
          amount_unpaid?: number
          report_category: ReportCategory
          payment_status: string
          report_summary: string
          detailed_experience: string
          public_summary?: string
          evidence_attached?: boolean
          status?: ReportStatus
          moderation_note?: string | null
          created_at?: string
          approved_at?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["client_reports"]["Insert"]>
        Relationships: []
      }
      report_evidence: {
        Row: {
          id: string
          report_id: string
          file_name: string
          file_type: string
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          report_id: string
          file_name: string
          file_type: string
          storage_path: string
          uploaded_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["report_evidence"]["Insert"]>
        Relationships: []
      }
      client_responses: {
        Row: {
          id: string
          client_id: string
          report_id: string | null
          response_summary: string
          status: "pending" | "published" | "rejected"
          created_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          report_id?: string | null
          response_summary: string
          status?: "pending" | "published" | "rejected"
          created_at?: string
          published_at?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["client_responses"]["Insert"]>
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          contractor_id: string
          tier: SubscriptionTier
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          current_period_end: string | null
        }
        Insert: {
          id?: string
          contractor_id: string
          tier: SubscriptionTier
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          current_period_end?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>
        Relationships: []
      }
      admin_reviews: {
        Row: {
          id: string
          report_id: string
          reviewer_id: string | null
          status: "queued" | "approved" | "rejected" | "needs_dispute_review"
          edited_public_summary: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_id: string
          reviewer_id?: string | null
          status?: "queued" | "approved" | "rejected" | "needs_dispute_review"
          edited_public_summary?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["admin_reviews"]["Insert"]>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      risk_level: RiskLevel
      report_status: ReportStatus
      report_category: ReportCategory
      subscription_tier: SubscriptionTier
      user_role: UserRole
      verification_status: VerificationStatus
    }
  }
}

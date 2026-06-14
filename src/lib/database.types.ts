import type {
  ReportCategory,
  ReportStatus,
  RiskLevel,
  SubscriptionTier,
  UserRole,
  AccountType,
  VerificationStatus,
  DiscussionCategory,
  DiscussionStatus,
  AdminEntityType,
  AdminSavedViewScope,
  ClientInviteStatus,
  ClientPipelineStage,
  ContractDocumentStatus,
  ContractPacketStatus,
  ContractPaymentMode,
  ContractShareStatus,
  ContractSignatureStatus,
  ContractTemplateType,
  EvidenceReviewStatus,
  EvidenceVaultStatus,
  FloridaLienCaseStatus,
  FloridaLienWorkflowType,
  LienDeliveryMethod,
  LienFilingMethod,
  LienNoticeStatus,
  ManagedRecoveryStatus,
  ModerationCaseStatus,
  ModerationDecisionReason,
  ModerationPriority,
  PaymentPlanStatus,
  PaymentRecoveryAttemptOutcome,
  PaymentRecoveryStatus,
  RecoveryChannel,
  RecoveryComplianceStatus,
  ReportDraftStatus,
  ReportResolutionStatus,
  ServiceFeeKind,
  ServiceFeeStatus,
  ServiceReadinessStatus,
  WatchlistAlertEventType,
  WatchlistStatus,
  ClaimedStatus,
  ProfileClaimStatus,
  ProfileType,
  ProfileSubtype,
  ProjectJobStatus,
  ProjectJobPriority,
  ProjectJobType,
  ProjectPropertyType,
  ProjectProfileRole,
  JobBillingRelationship,
  JobParticipantStatus,
  ProfileRatingModel,
  ReportConfidenceLevel,
  ReportRelationshipType,
  VerificationLevel,
} from "@/lib/types"

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type DbTable<Row, Insert = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Partial<Insert>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          account_type: AccountType | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: UserRole
          account_type?: AccountType | null
          created_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          role?: UserRole
          account_type?: AccountType | null
        }
        Relationships: []
      }
      contractor_profiles: {
        Row: {
          id: string
          user_id: string
          business_name: string
          trade: string
          business_type: string | null
          business_phone: string | null
          website_url: string | null
          service_area: string | null
          company_size: string | null
          years_in_business: string | null
          primary_goal: string | null
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
          business_type?: string | null
          business_phone?: string | null
          website_url?: string | null
          service_area?: string | null
          company_size?: string | null
          years_in_business?: string | null
          primary_goal?: string | null
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
          project_job_id: string | null
          reporter_profile_id: string | null
          subject_profile_id: string | null
          subject_profile_type: ProfileType
          relationship_type: ReportRelationshipType
          legacy_client_name: string | null
          report_confidence_level: ReportConfidenceLevel
          redaction_note: string | null
          reported_business_role: string | null
          counterparty_business_role: string | null
          hiring_party_name_private: string | null
          scope_documentation_status: string | null
          work_authorization_status: string | null
          retainage_amount: number | null
          payment_application_reference: string | null
          license_insurance_context: string | null
          relationship_verification_summary: string | null
          client_type: string | null
          client_job_address_private: string | null
          trade_category: string | null
          job_type: string | null
          job_start_date: string | null
          job_completion_date: string | null
          job_status: string | null
          deposit_requested: number | null
          deposit_paid: number | null
          final_invoice_amount: number | null
          materials_purchased_amount: number | null
          signed_contract: boolean | null
          written_change_order: boolean | null
          secondary_category: ReportCategory | null
          dispute_status: string | null
          amount_disputed: number | null
          days_overdue: number | null
          client_responded: boolean | null
          issue_resolved: boolean | null
          resolution_summary: string | null
          payment_reminder_sent: boolean | null
          demand_letter_sent: boolean | null
          lien_notice_started: boolean | null
          factual_summary_public: string | null
          detailed_timeline_private: string | null
          evidence_confidence: string | null
          response_status: string | null
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
          resolution_status: ReportResolutionStatus | null
          moderation_note: string | null
          created_at: string
          approved_at: string | null
        }
        Insert: {
          id?: string
          contractor_id: string
          client_id: string
          project_job_id?: string | null
          reporter_profile_id?: string | null
          subject_profile_id?: string | null
          subject_profile_type?: ProfileType
          relationship_type?: ReportRelationshipType
          legacy_client_name?: string | null
          report_confidence_level?: ReportConfidenceLevel
          redaction_note?: string | null
          reported_business_role?: string | null
          counterparty_business_role?: string | null
          hiring_party_name_private?: string | null
          scope_documentation_status?: string | null
          work_authorization_status?: string | null
          retainage_amount?: number | null
          payment_application_reference?: string | null
          license_insurance_context?: string | null
          relationship_verification_summary?: string | null
          client_type?: string | null
          client_job_address_private?: string | null
          trade_category?: string | null
          job_type?: string | null
          job_start_date?: string | null
          job_completion_date?: string | null
          job_status?: string | null
          deposit_requested?: number | null
          deposit_paid?: number | null
          final_invoice_amount?: number | null
          materials_purchased_amount?: number | null
          signed_contract?: boolean | null
          written_change_order?: boolean | null
          secondary_category?: ReportCategory | null
          dispute_status?: string | null
          amount_disputed?: number | null
          days_overdue?: number | null
          client_responded?: boolean | null
          issue_resolved?: boolean | null
          resolution_summary?: string | null
          payment_reminder_sent?: boolean | null
          demand_letter_sent?: boolean | null
          lien_notice_started?: boolean | null
          factual_summary_public?: string | null
          detailed_timeline_private?: string | null
          evidence_confidence?: string | null
          response_status?: string | null
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
          resolution_status?: ReportResolutionStatus | null
          moderation_note?: string | null
          created_at?: string
          approved_at?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["client_reports"]["Insert"]>
        Relationships: []
      }
      entity_profiles: {
        Row: {
          id: string
          profile_type: ProfileType
          profile_subtype: ProfileSubtype | string | null
          account_capabilities: ProfileType[]
          display_name: string
          legal_name_private: string | null
          business_name: string | null
          city: string
          state: string
          slug: string
          legacy_client_id: string | null
          legacy_contractor_id: string | null
          claimed_status: ClaimedStatus
          owner_user_id: string | null
          verification_level: VerificationLevel | null
          verification_badges: string[]
          duplicate_group_key: string | null
          merged_into_profile_id: string | null
          public_field_redactions: Json
          redaction_note: string | null
          rating_score: number
          rating_band: string
          rating_model: ProfileRatingModel | null
          rating_version: string | null
          rating_confidence: string | null
          rating_factors: Json
          rating_public_note: string | null
          rating_last_calculated_at: string | null
          report_count: number
          positive_report_count: number
          disputed_report_count: number
          resolved_report_count: number
          evidence_on_file_count: number
          response_count: number
          public_summary: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_type: ProfileType
          profile_subtype?: ProfileSubtype | string | null
          account_capabilities?: ProfileType[]
          display_name: string
          legal_name_private?: string | null
          business_name?: string | null
          city: string
          state: string
          slug: string
          legacy_client_id?: string | null
          legacy_contractor_id?: string | null
          claimed_status?: ClaimedStatus
          owner_user_id?: string | null
          verification_level?: VerificationLevel | null
          verification_badges?: string[]
          duplicate_group_key?: string | null
          merged_into_profile_id?: string | null
          public_field_redactions?: Json
          redaction_note?: string | null
          rating_score?: number
          rating_band?: string
          rating_model?: ProfileRatingModel | null
          rating_version?: string | null
          rating_confidence?: string | null
          rating_factors?: Json
          rating_public_note?: string | null
          rating_last_calculated_at?: string | null
          report_count?: number
          positive_report_count?: number
          disputed_report_count?: number
          resolved_report_count?: number
          evidence_on_file_count?: number
          response_count?: number
          public_summary?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["entity_profiles"]["Insert"]>
        Relationships: []
      }
      profile_claims: {
        Row: {
          id: string
          profile_id: string
          claimant_user_id: string | null
          claimant_email_hash: string
          claimant_name: string
          relationship_to_profile: string
          verification_summary: string
          status: ProfileClaimStatus
          moderator_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          claimant_user_id?: string | null
          claimant_email_hash: string
          claimant_name: string
          relationship_to_profile: string
          verification_summary: string
          status?: ProfileClaimStatus
          moderator_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["profile_claims"]["Insert"]>
        Relationships: []
      }
      project_jobs: {
        Row: {
          id: string
          owner_user_id: string | null
          job_number: string | null
          title: string
          project_type: string
          job_type: ProjectJobType | null
          priority: ProjectJobPriority
          status: ProjectJobStatus
          short_description: string | null
          detailed_scope_of_work: string | null
          trade_category: string | null
          city: string
          state: string
          project_address_private: string | null
          address_line1: string | null
          address_line2: string | null
          postal_code: string | null
          county: string | null
          property_type: ProjectPropertyType | null
          access_instructions: string | null
          private_access_code: string | null
          parking_instructions: string | null
          site_warnings: string | null
          start_date: string | null
          target_completion_date: string | null
          completion_date: string | null
          contract_amount: number
          amount_due: number
          primary_client_profile_id: string | null
          primary_contractor_profile_id: string | null
          public_summary: string | null
          customer_facing_notes: string | null
          private_notes: string | null
          is_public_summary_allowed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_user_id?: string | null
          job_number?: string | null
          title: string
          project_type: string
          job_type?: ProjectJobType | null
          priority?: ProjectJobPriority
          status?: ProjectJobStatus
          short_description?: string | null
          detailed_scope_of_work?: string | null
          trade_category?: string | null
          city: string
          state: string
          project_address_private?: string | null
          address_line1?: string | null
          address_line2?: string | null
          postal_code?: string | null
          county?: string | null
          property_type?: ProjectPropertyType | null
          access_instructions?: string | null
          private_access_code?: string | null
          parking_instructions?: string | null
          site_warnings?: string | null
          start_date?: string | null
          target_completion_date?: string | null
          completion_date?: string | null
          contract_amount?: number
          amount_due?: number
          primary_client_profile_id?: string | null
          primary_contractor_profile_id?: string | null
          public_summary?: string | null
          customer_facing_notes?: string | null
          private_notes?: string | null
          is_public_summary_allowed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["project_jobs"]["Insert"]>
        Relationships: []
      }
      project_job_profiles: {
        Row: {
          id: string
          project_job_id: string
          profile_id: string
          role: ProjectProfileRole
          relationship_label: string | null
          hired_by_profile_id: string | null
          reports_to_participant_id: string | null
          billing_relationship: JobBillingRelationship | null
          participant_status: JobParticipantStatus
          scope_assigned: string | null
          contract_amount: number | null
          is_primary: boolean
          notes: string | null
          private_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_job_id: string
          profile_id: string
          role: ProjectProfileRole
          relationship_label?: string | null
          hired_by_profile_id?: string | null
          reports_to_participant_id?: string | null
          billing_relationship?: JobBillingRelationship | null
          participant_status?: JobParticipantStatus
          scope_assigned?: string | null
          contract_amount?: number | null
          is_primary?: boolean
          notes?: string | null
          private_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["project_job_profiles"]["Insert"]>
        Relationships: []
      }
      profile_relationships: {
        Row: {
          id: string
          source_profile_id: string
          target_profile_id: string
          project_job_id: string | null
          relationship_type: ReportRelationshipType
          status: "active" | "ended" | "disputed" | "merged"
          private_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_profile_id: string
          target_profile_id: string
          project_job_id?: string | null
          relationship_type: ReportRelationshipType
          status?: "active" | "ended" | "disputed" | "merged"
          private_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["profile_relationships"]["Insert"]>
        Relationships: []
      }
      profile_merge_events: {
        Row: {
          id: string
          source_profile_id: string
          target_profile_id: string
          merged_by: string | null
          reason: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          source_profile_id: string
          target_profile_id: string
          merged_by?: string | null
          reason: string
          metadata?: Json
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["profile_merge_events"]["Insert"]>
        Relationships: []
      }
      report_reassignment_events: {
        Row: {
          id: string
          report_id: string
          previous_subject_profile_id: string | null
          next_subject_profile_id: string | null
          previous_project_job_id: string | null
          next_project_job_id: string | null
          reassigned_by: string | null
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          previous_subject_profile_id?: string | null
          next_subject_profile_id?: string | null
          previous_project_job_id?: string | null
          next_project_job_id?: string | null
          reassigned_by?: string | null
          reason: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["report_reassignment_events"]["Insert"]>
        Relationships: []
      }
      profile_redaction_events: {
        Row: {
          id: string
          profile_id: string
          field_name: string
          previous_public_value_hash: string | null
          redacted_by: string | null
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          field_name: string
          previous_public_value_hash?: string | null
          redacted_by?: string | null
          reason: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["profile_redaction_events"]["Insert"]>
        Relationships: []
      }
      profile_rating_events: {
        Row: {
          id: string
          profile_id: string
          profile_type: ProfileType
          rating_model: ProfileRatingModel
          rating_version: string
          previous_score: number | null
          next_score: number
          previous_band: string | null
          next_band: string
          confidence: string
          factor_snapshot: Json
          source_report_id: string | null
          recalculated_by: string | null
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          profile_type: ProfileType
          rating_model: ProfileRatingModel
          rating_version: string
          previous_score?: number | null
          next_score: number
          previous_band?: string | null
          next_band: string
          confidence: string
          factor_snapshot?: Json
          source_report_id?: string | null
          recalculated_by?: string | null
          reason: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["profile_rating_events"]["Insert"]>
        Relationships: []
      }
      report_evidence: {
        Row: {
          id: string
          report_id: string
          project_job_id: string | null
          file_name: string
          file_type: string
          storage_path: string
          public_summary_label: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          report_id: string
          project_job_id?: string | null
          file_name: string
          file_type: string
          storage_path: string
          public_summary_label?: string | null
          uploaded_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["report_evidence"]["Insert"]>
        Relationships: []
      }
      client_responses: {
        Row: {
          id: string
          client_id: string | null
          entity_profile_id: string | null
          project_job_id: string | null
          report_id: string | null
          request_type: string | null
          verification_method: string | null
          attachment_reference_private: string | null
          response_summary: string
          status: "pending" | "published" | "rejected"
          created_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          entity_profile_id?: string | null
          project_job_id?: string | null
          report_id?: string | null
          request_type?: string | null
          verification_method?: string | null
          attachment_reference_private?: string | null
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
      saved_client_searches: DbTable<{
        id: string
        contractor_id: string | null
        query: string
        city: string | null
        state: string | null
        risk_level: RiskLevel | null
        category: ReportCategory | null
        profile_type: ProfileType | null
        trade_category: string | null
        result_count: number
        source: string
        created_at: string
        last_run_at: string | null
      }>
      search_analytics_events: DbTable<{
        id: string
        contractor_id: string | null
        query: string | null
        state: string | null
        risk_level: RiskLevel | null
        category: ReportCategory | null
        profile_type: ProfileType | null
        trade_category: string | null
        result_count: number | null
        event_type: string
        source: string
        created_at: string
      }>
      profile_share_events: DbTable<{
        id: string
        contractor_id: string | null
        profile_slug: string
        channel: string
        source: string
        created_at: string
      }>
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
      community_discussions: {
        Row: {
          id: string
          client_id: string
          report_id: string | null
          author_name: string
          author_email_hash: string
          relationship_category: DiscussionCategory
          comment_body: string
          attachment_url: string | null
          status: DiscussionStatus
          is_verified: boolean
          moderator_note: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          report_id?: string | null
          author_name: string
          author_email_hash: string
          relationship_category: DiscussionCategory
          comment_body: string
          attachment_url?: string | null
          status?: DiscussionStatus
          is_verified?: boolean
          moderator_note?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["community_discussions"]["Insert"]>
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          actor_name: string | null
          action: string
          entity_type: AdminEntityType
          entity_id: string
          summary: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          actor_name?: string | null
          action: string
          entity_type: AdminEntityType
          entity_id: string
          summary: string
          metadata?: Json
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>
        Relationships: []
      }
      contractor_watchlist_items: DbTable<{
        id: string
        contractor_id: string
        client_id: string
        status: WatchlistStatus
        watch_reason: string
        alert_level: ModerationPriority
        last_signal: string
        private_match: boolean
        created_at: string
        updated_at: string
      }, {
        id?: string
        contractor_id: string
        client_id: string
        status?: WatchlistStatus
        watch_reason: string
        alert_level?: ModerationPriority
        last_signal?: string
        private_match?: boolean
        created_at?: string
        updated_at?: string
      }>
      watchlist_alerts: DbTable<{
        id: string
        contractor_id: string
        client_id: string | null
        profile_slug: string | null
        event_type: WatchlistAlertEventType
        title: string
        description: string
        severity: ModerationPriority
        created_at: string
        read_at: string | null
      }, {
        id?: string
        contractor_id: string
        client_id?: string | null
        profile_slug?: string | null
        event_type: WatchlistAlertEventType
        title: string
        description: string
        severity?: ModerationPriority
        created_at?: string
        read_at?: string | null
      }>
      contractor_verification_badges: DbTable<{
        id: string
        contractor_id: string
        label: string
        verified_at: string
        expires_at: string | null
      }, {
        id?: string
        contractor_id: string
        label: string
        verified_at?: string
        expires_at?: string | null
      }>
      report_drafts: DbTable<{
        id: string
        contractor_id: string
        client_id: string | null
        client_name: string
        project_type: string
        estimated_value: number
        amount_at_risk: number
        summary: string
        next_step: string
        status: ReportDraftStatus
        updated_at: string
      }, {
        id?: string
        contractor_id: string
        client_id?: string | null
        client_name: string
        project_type: string
        estimated_value?: number
        amount_at_risk?: number
        summary: string
        next_step: string
        status?: ReportDraftStatus
        updated_at?: string
      }>
      client_intake_assessments: DbTable<{
        id: string
        contractor_id: string
        client_name: string
        city: string
        state: string
        project_value: number
        deposit_received: boolean
        contract_signed: boolean
        private_match_confirmed: boolean
        recommendation: string
        score: number
        notes: string | null
        created_at: string
      }, {
        id?: string
        contractor_id: string
        client_name: string
        city: string
        state: string
        project_value?: number
        deposit_received?: boolean
        contract_signed?: boolean
        private_match_confirmed?: boolean
        recommendation: string
        score: number
        notes?: string | null
        created_at?: string
      }>
      evidence_review_summaries: DbTable<{
        id: string
        report_id: string
        contractor_id: string
        status: EvidenceReviewStatus
        label: string
        file_count: number
        reviewed_count: number
        last_updated_at: string
      }, {
        id?: string
        report_id: string
        contractor_id: string
        status?: EvidenceReviewStatus
        label: string
        file_count?: number
        reviewed_count?: number
        last_updated_at?: string
      }>
      moderation_cases: DbTable<{
        id: string
        report_id: string | null
        discussion_id: string | null
        client_id: string | null
        title: string
        summary: string
        priority: ModerationPriority
        status: ModerationCaseStatus
        queue_stage: string
        assigned_to: string | null
        due_at: string
        decision_reason: ModerationDecisionReason | null
        escalation_note: string | null
        public_summary_preview: string | null
        created_at: string
        updated_at: string
      }, {
        id?: string
        report_id?: string | null
        discussion_id?: string | null
        client_id?: string | null
        title: string
        summary: string
        priority?: ModerationPriority
        status?: ModerationCaseStatus
        queue_stage?: string
        assigned_to?: string | null
        due_at?: string
        decision_reason?: ModerationDecisionReason | null
        escalation_note?: string | null
        public_summary_preview?: string | null
        created_at?: string
        updated_at?: string
      }>
      bulk_import_batches: DbTable<{
        id: string
        file_name: string
        created_by: string | null
        total_rows: number
        ready_rows: number
        duplicate_rows: number
        imported_rows: number
        status: string
        created_at: string
      }, {
        id?: string
        file_name: string
        created_by?: string | null
        total_rows?: number
        ready_rows?: number
        duplicate_rows?: number
        imported_rows?: number
        status?: string
        created_at?: string
      }>
      payment_recovery_cases: DbTable<{
        id: string
        contractor_id: string
        client_profile_id: string | null
        client_name: string
        city: string
        state: string
        amount_due: number
        invoice_age_days: number
        preferred_channel: RecoveryChannel
        status: PaymentRecoveryStatus
        priority: ModerationPriority
        last_contact_at: string | null
        next_action: string
        summary: string
        compliance_flags: string[]
        created_at: string
        updated_at: string
      }, {
        id?: string
        contractor_id: string
        client_profile_id?: string | null
        client_name: string
        city: string
        state: string
        amount_due?: number
        invoice_age_days?: number
        preferred_channel?: RecoveryChannel
        status?: PaymentRecoveryStatus
        priority?: ModerationPriority
        last_contact_at?: string | null
        next_action: string
        summary: string
        compliance_flags?: string[]
        created_at?: string
        updated_at?: string
      }>
      lien_notice_drafts: DbTable<{
        id: string
        contractor_id: string
        client_profile_id: string | null
        client_name: string
        project_type: string
        property_city: string
        state: string
        amount_due: number
        last_work_date: string
        target_send_date: string | null
        status: LienNoticeStatus
        required_review: boolean
        next_step: string
        jurisdiction_note: string
        created_at: string
        updated_at: string
      }, {
        id?: string
        contractor_id: string
        client_profile_id?: string | null
        client_name: string
        project_type: string
        property_city: string
        state: string
        amount_due?: number
        last_work_date: string
        target_send_date?: string | null
        status?: LienNoticeStatus
        required_review?: boolean
        next_step: string
        jurisdiction_note: string
        created_at?: string
        updated_at?: string
      }>
      contract_workspace_items: DbTable<{
        id: string
        contractor_id: string
        client_profile_id: string | null
        client_name: string
        project_type: string
        template_type: ContractTemplateType
        contract_value: number
        deposit_required: number
        milestone_billing: boolean
        status: ContractDocumentStatus
        next_step: string
        summary: string
        created_at: string
        updated_at: string
      }, {
        id?: string
        contractor_id: string
        client_profile_id?: string | null
        client_name: string
        project_type: string
        template_type: ContractTemplateType
        contract_value?: number
        deposit_required?: number
        milestone_billing?: boolean
        status?: ContractDocumentStatus
        next_step: string
        summary: string
        created_at?: string
        updated_at?: string
      }>
      client_pipeline_items: DbTable<{
        id: string
        contractor_id: string
        client_profile_id: string | null
        client_name: string
        city: string
        state: string
        stage: ClientPipelineStage
        priority: ModerationPriority
        estimated_value: number
        next_action: string
        due_at: string | null
        private_match: boolean
        created_at: string
        updated_at: string
      }, {
        id?: string
        contractor_id: string
        client_profile_id?: string | null
        client_name: string
        city: string
        state: string
        stage?: ClientPipelineStage
        priority?: ModerationPriority
        estimated_value?: number
        next_action: string
        due_at?: string | null
        private_match?: boolean
        created_at?: string
        updated_at?: string
      }>
      client_risk_rooms: DbTable<{
        id: string
        contractor_id: string
        client_profile_id: string | null
        client_name: string
        city: string
        state: string
        headline: string
        summary: string
        linked_search_ids: string[]
        linked_watchlist_ids: string[]
        linked_assessment_ids: string[]
        linked_contract_ids: string[]
        linked_report_draft_ids: string[]
        linked_evidence_ids: string[]
        linked_recovery_ids: string[]
        linked_resolution_ids: string[]
        last_activity_at: string
        created_at: string
      }, {
        id?: string
        contractor_id: string
        client_profile_id?: string | null
        client_name: string
        city: string
        state: string
        headline: string
        summary: string
        linked_search_ids?: string[]
        linked_watchlist_ids?: string[]
        linked_assessment_ids?: string[]
        linked_contract_ids?: string[]
        linked_report_draft_ids?: string[]
        linked_evidence_ids?: string[]
        linked_recovery_ids?: string[]
        linked_resolution_ids?: string[]
        last_activity_at?: string
        created_at?: string
      }>
      payment_recovery_attempts: DbTable<{
        id: string
        recovery_case_id: string
        contractor_id: string
        channel: RecoveryChannel
        attempted_at: string
        outcome: PaymentRecoveryAttemptOutcome
        note: string
        next_follow_up_at: string | null
        created_at: string
      }, {
        id?: string
        recovery_case_id: string
        contractor_id: string
        channel: RecoveryChannel
        attempted_at: string
        outcome: PaymentRecoveryAttemptOutcome
        note: string
        next_follow_up_at?: string | null
        created_at?: string
      }>
      payment_plans: DbTable<{
        id: string
        recovery_case_id: string
        contractor_id: string
        total_amount: number
        installment_amount: number
        due_day: number
        status: PaymentPlanStatus
        next_due_date: string | null
        notes: string
        created_at: string
        updated_at: string
      }, {
        id?: string
        recovery_case_id: string
        contractor_id: string
        total_amount?: number
        installment_amount?: number
        due_day: number
        status?: PaymentPlanStatus
        next_due_date?: string | null
        notes: string
        created_at?: string
        updated_at?: string
      }>
      contract_packets: DbTable<{
        id: string
        contractor_id: string
        client_name: string
        project_type: string
        template_type: ContractTemplateType
        status: ContractPacketStatus
        packet_value: number
        deposit_required: number
        milestone_count: number
        required_before_scheduling: boolean
        client_legal_name: string | null
        contractor_legal_name: string | null
        scope_summary: string
        included_work: string
        excluded_work: string
        payment_terms: string
        milestone_schedule: Json
        change_order_policy: string
        cancellation_policy: string
        project_start_date: string | null
        project_end_date: string | null
        next_action: string
        share_token: string | null
        share_url: string | null
        client_email_hash: string | null
        client_email_masked: string | null
        client_invite_status: ClientInviteStatus
        signature_status: ContractSignatureStatus
        share_status: ContractShareStatus
        payment_mode: ContractPaymentMode
        payment_summary: string | null
        client_signed_at: string | null
        contractor_signed_at: string | null
        signer_name: string | null
        signature_name_hash: string | null
        signer_email_hash: string | null
        signer_ip_hash: string | null
        signer_user_agent_hash: string | null
        signed_snapshot: Json | null
        signed_digest: string | null
        signed_recorded_at: string | null
        created_at: string
        updated_at: string
      }, {
        id?: string
        contractor_id: string
        client_name: string
        project_type: string
        template_type: ContractTemplateType
        status?: ContractPacketStatus
        packet_value?: number
        deposit_required?: number
        milestone_count?: number
        required_before_scheduling?: boolean
        client_legal_name?: string | null
        contractor_legal_name?: string | null
        scope_summary?: string
        included_work?: string
        excluded_work?: string
        payment_terms?: string
        milestone_schedule?: Json
        change_order_policy?: string
        cancellation_policy?: string
        project_start_date?: string | null
        project_end_date?: string | null
        next_action: string
        share_token?: string | null
        share_url?: string | null
        client_email_hash?: string | null
        client_email_masked?: string | null
        client_invite_status?: ClientInviteStatus
        signature_status?: ContractSignatureStatus
        share_status?: ContractShareStatus
        payment_mode?: ContractPaymentMode
        payment_summary?: string | null
        client_signed_at?: string | null
        contractor_signed_at?: string | null
        signer_name?: string | null
        signature_name_hash?: string | null
        signer_email_hash?: string | null
        signer_ip_hash?: string | null
        signer_user_agent_hash?: string | null
        signed_snapshot?: Json | null
        signed_digest?: string | null
        signed_recorded_at?: string | null
        created_at?: string
        updated_at?: string
      }>
      evidence_vault_items: DbTable<{
        id: string
        contractor_id: string
        report_id: string | null
        client_name: string
        label: string
        file_category: string
        status: EvidenceVaultStatus
        private_storage_path: string
        public_summary: string
        uploaded_at: string
        updated_at: string
      }, {
        id?: string
        contractor_id: string
        report_id?: string | null
        client_name: string
        label: string
        file_category: string
        status?: EvidenceVaultStatus
        private_storage_path: string
        public_summary: string
        uploaded_at?: string
        updated_at?: string
      }>
      admin_saved_views: DbTable<{
        id: string
        scope: AdminSavedViewScope
        name: string
        filters: Json
        is_default: boolean
        created_by: string | null
        created_at: string
      }, {
        id?: string
        scope: AdminSavedViewScope
        name: string
        filters?: Json
        is_default?: boolean
        created_by?: string | null
        created_at?: string
      }>
      admin_queue_assignments: DbTable<{
        id: string
        entity_type: AdminSavedViewScope
        entity_id: string
        assigned_to: string | null
        assigned_to_name: string
        priority: ModerationPriority
        due_at: string
        status: "open" | "in_review" | "closed"
        created_at: string
        updated_at: string
      }, {
        id?: string
        entity_type: AdminSavedViewScope
        entity_id: string
        assigned_to?: string | null
        assigned_to_name: string
        priority?: ModerationPriority
        due_at: string
        status?: "open" | "in_review" | "closed"
        created_at?: string
        updated_at?: string
      }>
      recovery_compliance_reviews: DbTable<{
        id: string
        recovery_case_id: string | null
        lien_notice_draft_id: string | null
        contract_packet_id: string | null
        reviewer_id: string | null
        status: RecoveryComplianceStatus
        decision_reason: string
        required_changes: string[]
        public_visibility_allowed: boolean
        created_at: string
        updated_at: string
      }, {
        id?: string
        recovery_case_id?: string | null
        lien_notice_draft_id?: string | null
        contract_packet_id?: string | null
        reviewer_id?: string | null
        status?: RecoveryComplianceStatus
        decision_reason: string
        required_changes?: string[]
        public_visibility_allowed?: boolean
        created_at?: string
        updated_at?: string
      }>
      service_fee_orders: DbTable<{
        id: string
        contractor_id: string
        kind: ServiceFeeKind
        entity_id: string
        status: ServiceFeeStatus
        client_bureau_fee_cents: number
        pass_through_fee_cents: number
        currency: "usd"
        stripe_checkout_url: string | null
        stripe_session_id: string | null
        paid_at: string | null
        created_at: string
        updated_at: string
      }, {
        id?: string
        contractor_id: string
        kind: ServiceFeeKind
        entity_id: string
        status?: ServiceFeeStatus
        client_bureau_fee_cents: number
        pass_through_fee_cents?: number
        currency?: "usd"
        stripe_checkout_url?: string | null
        stripe_session_id?: string | null
        paid_at?: string | null
        created_at?: string
        updated_at?: string
      }>
      managed_recovery_cases: DbTable<{
        id: string
        contractor_id: string
        client_name: string
        client_email_hash: string | null
        client_email_masked: string | null
        city: string
        state: string
        amount_due: number
        invoice_age_days: number
        preferred_channel: RecoveryChannel
        status: ManagedRecoveryStatus
        priority: ModerationPriority
        service_fee_order_id: string | null
        readiness_status: ServiceReadinessStatus | null
        readiness_score: number | null
        readiness_checked_at: string | null
        fee_paid_at: string | null
        submitted_for_review_at: string | null
        evidence_vault_item_ids: string[]
        assigned_to_name: string | null
        next_action: string
        summary: string
        contractor_direct_payment: boolean
        compliance_flags: string[]
        created_at: string
        updated_at: string
      }, {
        id?: string
        contractor_id: string
        client_name: string
        client_email_hash?: string | null
        client_email_masked?: string | null
        city: string
        state: string
        amount_due: number
        invoice_age_days: number
        preferred_channel: RecoveryChannel
        status?: ManagedRecoveryStatus
        priority?: ModerationPriority
        service_fee_order_id?: string | null
        readiness_status?: ServiceReadinessStatus | null
        readiness_score?: number | null
        readiness_checked_at?: string | null
        fee_paid_at?: string | null
        submitted_for_review_at?: string | null
        evidence_vault_item_ids?: string[]
        assigned_to_name?: string | null
        next_action: string
        summary: string
        contractor_direct_payment?: boolean
        compliance_flags?: string[]
        created_at?: string
        updated_at?: string
      }>
      recovery_communications: DbTable<{
        id: string
        managed_recovery_case_id: string
        contractor_id: string
        channel: RecoveryChannel
        direction: "outbound" | "inbound" | "internal"
        subject: string
        note: string
        outcome: PaymentRecoveryAttemptOutcome
        contacted_at: string
        logged_by_name: string
        created_at: string
      }, {
        id?: string
        managed_recovery_case_id: string
        contractor_id: string
        channel: RecoveryChannel
        direction?: "outbound" | "inbound" | "internal"
        subject: string
        note: string
        outcome: PaymentRecoveryAttemptOutcome
        contacted_at: string
        logged_by_name: string
        created_at?: string
      }>
      recovery_resolution_offers: DbTable<{
        id: string
        managed_recovery_case_id: string
        contractor_id: string
        amount_offered: number
        payment_due_date: string | null
        terms_summary: string
        status: "draft" | "offered" | "accepted" | "rejected" | "expired" | "paid"
        created_at: string
        updated_at: string
      }, {
        id?: string
        managed_recovery_case_id: string
        contractor_id: string
        amount_offered: number
        payment_due_date?: string | null
        terms_summary: string
        status?: "draft" | "offered" | "accepted" | "rejected" | "expired" | "paid"
        created_at?: string
        updated_at?: string
      }>
      florida_lien_cases: DbTable<{
        id: string
        contractor_id: string
        workflow_type: FloridaLienWorkflowType
        client_name: string
        owner_name: string
        property_county: string
        property_city: string
        state: "FL"
        parcel_number: string | null
        legal_description: string | null
        contractor_role: "direct_contractor" | "subcontractor" | "supplier" | "laborer" | "other"
        project_type: string
        contract_amount: number
        amount_due: number
        first_work_date: string | null
        last_work_date: string
        notice_history: string
        filing_deadline: string | null
        target_send_date: string | null
        status: FloridaLienCaseStatus
        delivery_method: LienDeliveryMethod | null
        filing_method: LienFilingMethod | null
        recording_vendor: string | null
        service_fee_order_id: string | null
        readiness_status: ServiceReadinessStatus | null
        readiness_score: number | null
        readiness_checked_at: string | null
        fee_paid_at: string | null
        submitted_for_review_at: string | null
        contractor_signed_at: string | null
        contractor_signature_name: string | null
        attorney_vendor_status: "not_started" | "queued" | "in_review" | "approved" | "rejected"
        next_action: string
        private_summary: string
        created_at: string
        updated_at: string
      }, {
        id?: string
        contractor_id: string
        workflow_type: FloridaLienWorkflowType
        client_name: string
        owner_name: string
        property_county: string
        property_city: string
        state?: "FL"
        parcel_number?: string | null
        legal_description?: string | null
        contractor_role: "direct_contractor" | "subcontractor" | "supplier" | "laborer" | "other"
        project_type: string
        contract_amount: number
        amount_due: number
        first_work_date?: string | null
        last_work_date: string
        notice_history: string
        filing_deadline?: string | null
        target_send_date?: string | null
        status?: FloridaLienCaseStatus
        delivery_method?: LienDeliveryMethod | null
        filing_method?: LienFilingMethod | null
        recording_vendor?: string | null
        service_fee_order_id?: string | null
        readiness_status?: ServiceReadinessStatus | null
        readiness_score?: number | null
        readiness_checked_at?: string | null
        fee_paid_at?: string | null
        submitted_for_review_at?: string | null
        contractor_signed_at?: string | null
        contractor_signature_name?: string | null
        attorney_vendor_status?: "not_started" | "queued" | "in_review" | "approved" | "rejected"
        next_action: string
        private_summary: string
        created_at?: string
        updated_at?: string
      }>
      lien_notice_deliveries: DbTable<{
        id: string
        florida_lien_case_id: string
        contractor_id: string
        delivery_method: LienDeliveryMethod
        recipient_name: string
        sent_at: string | null
        tracking_number: string | null
        delivery_status: "queued" | "sent" | "delivered" | "failed" | "returned"
        proof_summary: string
        created_at: string
        updated_at: string
      }, {
        id?: string
        florida_lien_case_id: string
        contractor_id: string
        delivery_method: LienDeliveryMethod
        recipient_name: string
        sent_at?: string | null
        tracking_number?: string | null
        delivery_status?: "queued" | "sent" | "delivered" | "failed" | "returned"
        proof_summary: string
        created_at?: string
        updated_at?: string
      }>
      lien_filing_records: DbTable<{
        id: string
        florida_lien_case_id: string
        contractor_id: string
        filing_method: LienFilingMethod
        recording_vendor: string | null
        clerk_county: string
        clerk_reference: string | null
        official_record_book: string | null
        official_record_page: string | null
        instrument_number: string | null
        filed_at: string | null
        recording_confirmed_at: string | null
        filing_receipt_path: string | null
        status: "queued" | "submitted" | "filed" | "recording_confirmed" | "rejected"
        created_at: string
        updated_at: string
      }, {
        id?: string
        florida_lien_case_id: string
        contractor_id: string
        filing_method: LienFilingMethod
        recording_vendor?: string | null
        clerk_county: string
        clerk_reference?: string | null
        official_record_book?: string | null
        official_record_page?: string | null
        instrument_number?: string | null
        filed_at?: string | null
        recording_confirmed_at?: string | null
        filing_receipt_path?: string | null
        status?: "queued" | "submitted" | "filed" | "recording_confirmed" | "rejected"
        created_at?: string
        updated_at?: string
      }>
      lien_release_records: DbTable<{
        id: string
        florida_lien_case_id: string
        contractor_id: string
        release_reason: "paid" | "settled" | "expired" | "withdrawn" | "error_correction"
        release_status: "draft" | "sent_for_signature" | "recorded" | "blocked"
        release_recorded_at: string | null
        release_instrument_number: string | null
        notes: string
        created_at: string
        updated_at: string
      }, {
        id?: string
        florida_lien_case_id: string
        contractor_id: string
        release_reason: "paid" | "settled" | "expired" | "withdrawn" | "error_correction"
        release_status?: "draft" | "sent_for_signature" | "recorded" | "blocked"
        release_recorded_at?: string | null
        release_instrument_number?: string | null
        notes: string
        created_at?: string
        updated_at?: string
      }>
      case_staff_assignments: DbTable<{
        id: string
        entity_type: "managed_recovery" | "florida_lien"
        entity_id: string
        assigned_to: string | null
        assigned_to_name: string
        priority: ModerationPriority
        due_at: string
        status: "open" | "in_review" | "closed"
        created_at: string
        updated_at: string
      }, {
        id?: string
        entity_type: "managed_recovery" | "florida_lien"
        entity_id: string
        assigned_to?: string | null
        assigned_to_name: string
        priority?: ModerationPriority
        due_at: string
        status?: "open" | "in_review" | "closed"
        created_at?: string
        updated_at?: string
      }>
      case_audit_events: DbTable<{
        id: string
        entity_type: "managed_recovery" | "florida_lien" | "service_fee"
        entity_id: string
        actor_id: string | null
        actor_name: string
        action: string
        summary: string
        created_at: string
      }, {
        id?: string
        entity_type: "managed_recovery" | "florida_lien" | "service_fee"
        entity_id: string
        actor_id?: string | null
        actor_name: string
        action: string
        summary: string
        created_at?: string
      }>
      case_document_links: DbTable<{
        id: string
        contractor_id: string
        entity_type: "managed_recovery" | "florida_lien"
        entity_id: string
        evidence_vault_item_id: string
        document_label: string
        document_category: "invoice" | "screenshot" | "contract" | "photo" | "pdf" | "other"
        public_summary: string
        created_at: string
      }, {
        id?: string
        contractor_id: string
        entity_type: "managed_recovery" | "florida_lien"
        entity_id: string
        evidence_vault_item_id: string
        document_label: string
        document_category: "invoice" | "screenshot" | "contract" | "photo" | "pdf" | "other"
        public_summary: string
        created_at?: string
      }>
    }
    Views: {
      client_bureau_required_tables: {
        Row: {
          table_name: string
          exists: boolean
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      risk_level: RiskLevel
      report_status: ReportStatus
      report_category: ReportCategory
      subscription_tier: SubscriptionTier
      user_role: UserRole
      verification_status: VerificationStatus
      discussion_category: DiscussionCategory
      discussion_status: DiscussionStatus
      admin_entity_type: AdminEntityType
      watchlist_status: WatchlistStatus
      watchlist_alert_event_type: WatchlistAlertEventType
      report_resolution_status: ReportResolutionStatus
      report_draft_status: ReportDraftStatus
      evidence_review_status: EvidenceReviewStatus
      moderation_priority: ModerationPriority
      moderation_case_status: ModerationCaseStatus
      moderation_decision_reason: ModerationDecisionReason
      payment_recovery_status: PaymentRecoveryStatus
      recovery_channel: RecoveryChannel
      lien_notice_status: LienNoticeStatus
      contract_template_type: ContractTemplateType
      contract_document_status: ContractDocumentStatus
      client_pipeline_stage: ClientPipelineStage
      payment_recovery_attempt_outcome: PaymentRecoveryAttemptOutcome
      payment_plan_status: PaymentPlanStatus
      contract_packet_status: ContractPacketStatus
      contract_share_status: ContractShareStatus
      contract_signature_status: ContractSignatureStatus
      client_invite_status: ClientInviteStatus
      contract_payment_mode: ContractPaymentMode
      evidence_vault_status: EvidenceVaultStatus
      admin_saved_view_scope: AdminSavedViewScope
      recovery_compliance_status: RecoveryComplianceStatus
      managed_recovery_status: ManagedRecoveryStatus
      florida_lien_workflow_type: FloridaLienWorkflowType
      florida_lien_case_status: FloridaLienCaseStatus
      lien_delivery_method: LienDeliveryMethod
      lien_filing_method: LienFilingMethod
      service_fee_kind: ServiceFeeKind
      service_fee_status: ServiceFeeStatus
      service_readiness_status: ServiceReadinessStatus
    }
  }
}

import type {
  ReportCategory,
  ReportStatus,
  RiskLevel,
  SubscriptionTier,
  UserRole,
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
  LienNoticeStatus,
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
  WatchlistAlertEventType,
  WatchlistStatus,
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
          resolution_status: ReportResolutionStatus | null
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
          resolution_status?: ReportResolutionStatus | null
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
    }
  }
}

import type {
  AdminReview,
  ClientReport,
  ClientSearchResult,
  PublicClientProfile,
  SearchFilters,
} from "@/lib/types"
import type { ClientReportInput } from "@/lib/schemas/client-bureau"

export interface ClientBureauRepository {
  searchClients(query?: string, filters?: SearchFilters): ClientSearchResult[]
  getPublicClientProfile(slug: string): PublicClientProfile | undefined
  submitClientReport(input: ClientReportInput): ClientReport
  reviewReport(
    reportId: string,
    decision: "approved" | "rejected",
    editedPublicSummary?: string,
  ): AdminReview
}

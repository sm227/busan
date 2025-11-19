// 지원사업 관련 타입 정의

export type ProgramType =
  | "SETTLEMENT_SUPPORT" // 정착지원
  | "HOUSING_SUPPORT" // 주거지원
  | "LOAN_SUPPORT" // 융자지원
  | "EDUCATION" // 교육지원
  | "EXPERIENCE_PROGRAM" // 체험프로그램
  | "STARTUP_SUPPORT" // 창업지원
  | "CONSULTING" // 컨설팅지원
  | "MOVING_SUPPORT" // 이사지원
  | "VILLAGE_SUPPORT" // 마을조성지원
  | "PROMOTION_SUPPORT"; // 홍보지원

export interface SupportProgram {
  program_id: string;
  district: string;
  program_name: string;
  support_amount?: number | null;
  support_amount_detail?: {
    subsidy?: number;
    self_pay?: number;
    startup_fund?: number;
    housing_fund?: number;
    mentee_monthly?: number;
    mentor_monthly?: number;
  };
  support_amount_unit?: string;
  support_content?: string;
  support_condition?: string;
  subsidy_rate?: number;
  self_pay_rate?: number;
  target_audience?: string;
  loan_type?: string;
  loan_interest_rate?: number;
  loan_interest_type?: string;
  loan_term?: string;
  purpose?: string;
  program_type: ProgramType;
}

export interface Region {
  region_code: string;
  region_name: string;
  programs: SupportProgram[];
}

export interface SupportData {
  regions: Region[];
  program_types: Record<ProgramType, string>;
}

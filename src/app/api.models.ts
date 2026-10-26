export type JsonObject = Record<string, unknown>;

export interface ConfigurationSummaryResponse {
  id: number;
  name: string | null;
}

export interface ConfigurationResponse extends ConfigurationSummaryResponse {
  ruleSetVersion: string | null;
  generationMode: string | null;
  templateVersion?: string | null;
  promptVersion?: string | null;
  modelName?: string | null;
  modelParameters?: JsonObject | null;
}

export interface RequestTemplateConfiguration {
  name: string;
  ruleSetVersion: string;
  templateVersion: string;
}

export interface RequestLlmConfiguration {
  name: string;
  ruleSetVersion: string;
  promptVersion: string;
  modelName: string;
  modelParameters: JsonObject;
}

export interface RequestConversation {
  title: string;
}

export interface ConversationResponse {
  id: number;
  title: string | null;
  status: string | null;
  createdAt: string;
}

export interface RequestMessage {
  content: string;
  configurationId: number;
}

export interface MessageResponse {
  id: number;
  conversationId: number;
  processingId: number;
  role: string;
  content: string;
  createdAt: string;
}

export interface EvaluationResultResponse {
  metric: string | null;
  score: number;
  unit: string | null;
  comment: string | null;
}

export interface GeneratedResponseResultResponse {
  text: string | null;
  generationMode: string | null;
  templateVersion: string | null;
  promptVersion: string | null;
  modelName: string | null;
  processingTimeMs: number;
}

export interface MatchedRuleResultResponse {
  matched: boolean;
  prioScore: number;
  resultJson: string | null;
  source: string | null;
  effectiveFrom: string | null;
  reason: string | null;
}

export interface PreProcessingResultResponse {
  cleanedText: string | null;
  caseType: string | null;
  structuredCaseStateJson: string | null;
}

export interface RuleDecisionResultResponse {
  decision: string | null;
  reason: string | null;
  ruleSetVersion: string | null;
  matchedRules: MatchedRuleResultResponse[] | null;
}

export interface ResponsePlanResultResponse {
  decision: string | null;
  reason: string | null;
  requiredElementsJson: string | null;
  responseStructureJson: string | null;
  sourcesJson: string | null;
}

export interface ProcessingArtifactsResponse {
  preProcessing: PreProcessingResultResponse | null;
  ruleDecision: RuleDecisionResultResponse | null;
  responsePlan: ResponsePlanResultResponse | null;
  response: GeneratedResponseResultResponse | null;
  evaluationResults: EvaluationResultResponse[] | null;
}

export interface ProcessingErrorResponse {
  type: string | null;
  message: string | null;
}

export interface ProcessingResultResponse {
  id: number;
  status: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  isFinished: boolean;
  resultsAvailable: boolean;
  availabilityMessage: string | null;
  error: ProcessingErrorResponse | null;
  results: ProcessingArtifactsResponse | null;
}

export interface AiServiceErrorResponse {
  code?: string | null;
  message?: string | null;
  correlation_id?: string | null;
}

export interface AiModel {
  name: string;
  is_default: boolean;
}

export interface AiModelsResponse {
  models: AiModel[];
  success: boolean;
  error: AiServiceErrorResponse | null;
}

export interface AiPreprocessingRequest {
  message: string;
}

export interface AiPreprocessingResponse {
  message: string;
  facts: Record<string, string[]>;
  category: string;
  success: boolean;
  partial_success: boolean;
  warnings: string[];
  error: AiServiceErrorResponse | null;
}

export interface AiGenerateRequest {
  input_data: {
    case_state: JsonObject;
    decision: string;
    reason: string;
    rule_result: JsonObject;
  };
  message: string;
  facts: Record<string, string[]>;
  category: string;
  prompt_name: string;
  model_name: string;
  model_parameters: JsonObject;
}

export interface AiGenerateResponse {
  response: string;
  prompt_version: string;
  model_name: string;
  model_id: string;
  model_parameters: JsonObject;
  success: boolean;
  reference_similarity?: number | null;
  reference_similarity_metric?: string | null;
  error: AiServiceErrorResponse | null;
}

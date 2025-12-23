import {
  AIModelType,
  ConsultationContext,
  StoryGenerationRequest,
  StoryGenerationResponse,
  QuestionFollowUpRequest,
  QuestionFollowUpResponse,
} from '../types';

/**
 * Base class for all AI providers
 * All AI providers must extend this class and implement its abstract methods
 */
export abstract class BaseAIProvider {
  /**
   * Unique identifier for the AI model
   */
  abstract readonly modelId: AIModelType;

  /**
   * Display name for the AI model (shown in UI)
   */
  abstract readonly displayName: string;

  /**
   * Generate a response for AI consultation chat
   * @param userMessage - The user's message
   * @param context - Optional context including preferences and previous messages
   * @returns Promise resolving to the AI's response text
   */
  abstract generateConsultationResponse(
    userMessage: string,
    context?: ConsultationContext
  ): Promise<string>;

  /**
   * Generate a personalized story about a rural property
   * @param request - Property and user preference information
   * @returns Promise resolving to a story with title, content, and highlights
   */
  abstract generatePersonalizedStory(
    request: StoryGenerationRequest
  ): Promise<StoryGenerationResponse>;

  /**
   * Generate a follow-up question based on previous answers
   * @param request - Previous answers and current category
   * @returns Promise resolving to a follow-up question, or null if not needed
   */
  abstract generateQuestionFollowUp(
    request: QuestionFollowUpRequest
  ): Promise<QuestionFollowUpResponse | null>;
}

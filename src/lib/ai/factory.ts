import { BaseAIProvider } from './providers/base';
import { GeminiAIProvider } from './providers/gemini';
import { BedrockAIProvider } from './providers/bedrock';
import { AIModelType } from './types';

/**
 * Factory class for creating and managing AI provider instances
 * Implements singleton pattern to reuse provider instances
 */
export class AIProviderFactory {
  private static providers: Map<AIModelType, BaseAIProvider> = new Map();

  /**
   * Get an AI provider instance for the specified model type
   * Returns cached instance if available, otherwise creates a new one
   * @param modelType - The AI model type identifier
   * @returns The corresponding AI provider instance
   */
  static getProvider(modelType: AIModelType): BaseAIProvider {
    if (!this.providers.has(modelType)) {
      this.providers.set(modelType, this.createProvider(modelType));
    }
    return this.providers.get(modelType)!;
  }

  /**
   * Create a new provider instance based on model type
   * @param modelType - The AI model type identifier
   * @returns A new AI provider instance
   * @throws Error if model type is not supported
   */
  private static createProvider(modelType: AIModelType): BaseAIProvider {
    switch (modelType) {
      case 'gemini-2.5-flash':
        return new GeminiAIProvider();
      case 'claude-3.5-sonnet':
        return new BedrockAIProvider();
      default:
        throw new Error(`Unknown AI model type: ${modelType}`);
    }
  }

  /**
   * Get the default AI model type
   * @returns The default model type (Gemini)
   */
  static getDefaultModel(): AIModelType {
    return 'gemini-2.5-flash';
  }

  /**
   * Get list of all available AI models with metadata
   * @returns Array of model information objects
   */
  static getAvailableModels(): Array<{ id: AIModelType; name: string }> {
    return [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'claude-3.5-sonnet', name: 'Amazon Nova Lite' },
    ];
  }
}

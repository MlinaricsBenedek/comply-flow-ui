import { Injectable, signal } from '@angular/core';

export type ConfigurationType = 'Template' | 'LLM';
export type GenerationMode = 'template' | 'llm';

export interface ConfigurationItem {
  id: number;
  name: string;
  type: ConfigurationType;
  ruleSetVersion: string;
  templateVersion?: string;
  promptVersion?: string;
  generationMode?: GenerationMode;
  modelName?: string;
  modelParameters?: Record<string, number | string | boolean>;
}

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private readonly configurationsSignal = signal<ConfigurationItem[]>([
    {
      id: 1,
      name: 'Template Configuration',
      type: 'Template',
      ruleSetVersion: '1.0',
      templateVersion: '1.0',
      generationMode: 'template',
    },
    {
      id: 2,
      name: 'LLM Configuration',
      type: 'LLM',
      ruleSetVersion: '1.0',
      promptVersion: '2.0',
      generationMode: 'llm',
      modelName: 'Llama-3',
      modelParameters: {
        temperature: 0.2,
        maxTokens: 500,
      },
    },
  ]);

  readonly configurations = this.configurationsSignal.asReadonly();

  addConfiguration(config: ConfigurationItem): void {
    this.configurationsSignal.update((items) => [config, ...items]);
  }
}

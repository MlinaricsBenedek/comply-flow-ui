import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, delay, map, Observable, of } from 'rxjs';

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
  private readonly http = inject(HttpClient);
  private readonly configurationsSignal = signal<ConfigurationItem[]>([]);

  readonly configurations = this.configurationsSignal.asReadonly();

  readonly mockConfigurations: ConfigurationItem[] = [
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
  ];

  loadConfigurations(): Observable<ConfigurationItem[]> {
    return this.http.get<ConfigurationItem[]>('http://localhost:3600/api/configurations').pipe(
      delay(150),
      map((items) => {
        this.configurationsSignal.set(items.length ? items : this.mockConfigurations);
        return items.length ? items : this.mockConfigurations;
      }),
    );
  }

  getConfigurationById(id: number): Observable<ConfigurationItem | undefined> {
    return this.http.get<ConfigurationItem>(`http://localhost:3600/api/configurations/${id}`).pipe(
      delay(120),
      map((item) => item),
      catchError(() => of(this.mockConfigurations.find((config) => config.id === id))),
    );
  }

  addConfiguration(config: ConfigurationItem): Observable<ConfigurationItem> {
    return this.http.post<ConfigurationItem>('http://localhost:3600/api/configurations', config).pipe(
      delay(150),
      map((created) => {
        const next = [created, ...this.configurationsSignal()];
        this.configurationsSignal.set(next);
        return created;
      }),
      catchError(() => {
        const created = { ...config };
        this.configurationsSignal.update((items) => [created, ...items]);
        return of(created);
      }),
    );
  }
}

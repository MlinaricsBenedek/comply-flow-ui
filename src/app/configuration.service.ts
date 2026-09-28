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

  loadConfigurations(): Observable<ConfigurationItem[]> {
    return this.http.get<ConfigurationItem[]>('http://localhost:3600/api/configurations').pipe(
      delay(150),
      map((items) => {
        this.configurationsSignal.set(items);
        return items;
      }),
      catchError(() => {
        this.configurationsSignal.set([]);
        return of([]);
      }),
    );
  }

  getConfigurationById(id: number): Observable<ConfigurationItem | undefined> {
    return this.http.get<ConfigurationItem>(`http://localhost:3600/api/configurations/${id}`).pipe(
      delay(120),
      map((item) => item),
      catchError(() => of(undefined)),
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
        this.configurationsSignal.update((items) => [config, ...items]);
        return of(config);
      }),
    );
  }
}

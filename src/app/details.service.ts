import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, delay, map, Observable, of } from 'rxjs';

export interface RuleMatch {
  code: string;
  matched: boolean;
  reason: string;
}

export interface StructuredCaseState {
  product: string;
  issue: string;
  requestedAction: string;
}

export interface DetailEntry {
  messageId: string;
  messageTitle: string;
  originalMessage: string;
  processingRunId: number;
  configurationName: string;
  configurationType: 'template' | 'llm';
  summary: string;
  preprocessing: {
    cleanedText: string;
    caseType: string;
    structuredCaseState: StructuredCaseState;
  };
  rules: {
    decision: string;
    reason: string;
    ruleSetVersion: string;
    matchedRules: RuleMatch[];
  };
  responsePlan: {
    decision: string;
    reason: string;
    requiredElements: string[];
    responseStructure: string[];
    sources: string[];
  };
  generatedResponse: {
    generationMode: 'template' | 'llm';
    generatedResponse: string;
    templateVersion?: string;
    promptVersion?: string;
    modelName?: string;
    modelParameters?: Record<string, string | number | boolean>;
    processingTime: string;
  };
}

@Injectable({ providedIn: 'root' })
export class DetailsService {
  private readonly http = inject(HttpClient);
  private readonly detailsSignal = signal<DetailEntry[]>([]);

  readonly details = this.detailsSignal.asReadonly();

  loadDetailsForConversation(conversationId: string): Observable<DetailEntry[]> {
    return this.http.get<DetailEntry[]>(`http://localhost:3600/api/conversations/${conversationId}/details`).pipe(
      delay(120),
      map((items) => {
        this.detailsSignal.set(items);
        return items;
      }),
      catchError(() => {
        this.detailsSignal.set([]);
        return of([]);
      }),
    );
  }

  getDetailForMessage(conversationId: string, messageId: string): Observable<DetailEntry | undefined> {
    return this.http
      .get<DetailEntry>(`http://localhost:3600/api/conversations/${conversationId}/messages/${messageId}/details`)
      .pipe(
        delay(120),
        map((item) => item),
        catchError(() => of(undefined)),
      );
  }
}

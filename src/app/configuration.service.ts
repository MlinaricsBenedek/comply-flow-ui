import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ConfigurationResponse,
  ConfigurationSummaryResponse,
  JsonObject,
  RequestLlmConfiguration,
  RequestTemplateConfiguration,
} from './api.models';
import { getApiBaseUrl } from './api-url';

export type ConfigurationItem = ConfigurationResponse;

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = getApiBaseUrl(inject(PLATFORM_ID));

  getConfigurations(): Observable<ConfigurationSummaryResponse[]> {
    return this.http.get<ConfigurationSummaryResponse[]>(`${this.apiBaseUrl}/configurations`);
  }

  getConfiguration(id: number): Observable<ConfigurationResponse> {
    return this.http.get<ConfigurationResponse>(`${this.apiBaseUrl}/configurations/${id}`);
  }

  createTemplateConfiguration(
    request: RequestTemplateConfiguration,
  ): Observable<ConfigurationResponse> {
    return this.http.post<ConfigurationResponse>(
      `${this.apiBaseUrl}/configurations/template`,
      request,
    );
  }

  createLlmConfiguration(request: RequestLlmConfiguration): Observable<ConfigurationResponse> {
    return this.http.post<ConfigurationResponse>(`${this.apiBaseUrl}/configurations/llm`, request);
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as
        | { title?: string; detail?: string; message?: string; errors?: Record<string, string[]> }
        | null;

      if (body?.message) {
        return body.message;
      }
      if (body?.detail) {
        return body.detail;
      }
      if (body?.title) {
        const validationErrors = body.errors
          ? Object.values(body.errors).flat().join(' ')
          : '';
        return validationErrors ? `${body.title} ${validationErrors}` : body.title;
      }
      return error.status
        ? `API request failed (${error.status} ${error.statusText}).`
        : 'The API could not be reached.';
    }

    return error instanceof Error ? error.message : 'An unexpected error occurred.';
  }
}

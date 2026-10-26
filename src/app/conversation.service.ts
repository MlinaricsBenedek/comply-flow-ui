import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ConversationResponse,
  MessageResponse,
  ProcessingResultResponse,
  RequestConversation,
  RequestMessage,
} from './api.models';
import { getApiBaseUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = getApiBaseUrl(inject(PLATFORM_ID));

  getConversations(): Observable<ConversationResponse[]> {
    return this.http.get<ConversationResponse[]>(`${this.apiBaseUrl}/conversations`);
  }

  getConversation(id: number): Observable<ConversationResponse> {
    return this.http.get<ConversationResponse>(
      `${this.apiBaseUrl}/Conversation/conversation/${id}`,
    );
  }

  getConversationMessages(conversationId: number): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(
      `${this.apiBaseUrl}/conversations/${conversationId}/messages`,
    );
  }

  createConversation(request: RequestConversation): Observable<ConversationResponse> {
    return this.http.post<ConversationResponse>(
      `${this.apiBaseUrl}/Conversation/conversation`,
      request,
    );
  }

  sendMessage(conversationId: number, request: RequestMessage): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiBaseUrl}/conversations/${conversationId}/messages`,
      request,
    );
  }

  getProcessingResult(processingId: number): Observable<ProcessingResultResponse> {
    return this.http.get<ProcessingResultResponse>(
      `${this.apiBaseUrl}/processings/${processingId}`,
    );
  }
}

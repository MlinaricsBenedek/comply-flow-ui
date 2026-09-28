import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, delay, map, Observable, of } from 'rxjs';

export interface ConversationEntry {
  id: string;
  title: string;
  summary: string;
  status: 'New' | 'In review' | 'Resolved';
  statusKey: 'new' | 'review' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly http = inject(HttpClient);
  private readonly conversationsSignal = signal<ConversationEntry[]>([]);

  readonly conversations = this.conversationsSignal.asReadonly();

  loadConversations(): Observable<ConversationEntry[]> {
    return this.http.get<ConversationEntry[]>('http://localhost:3600/api/conversations').pipe(
      delay(150),
      map((items) => {
        this.conversationsSignal.set(items);
        return items;
      }),
      catchError(() => {
        this.conversationsSignal.set([]);
        return of([]);
      }),
    );
  }

  createConversation(title: string): Observable<ConversationEntry> {
    const payload = { title };

    return this.http.post<ConversationEntry>('http://localhost:3600/api/conversations', payload).pipe(
      delay(150),
      map((created) => {
        const next = [created, ...this.conversationsSignal()];
        this.conversationsSignal.set(next);
        return created;
      }),
      catchError(() => {
        const created: ConversationEntry = {
          id: `conv-${Date.now()}`,
          title,
          summary: '',
          status: 'New',
          statusKey: 'new',
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        this.conversationsSignal.update((items) => [created, ...items]);
        return of(created);
      }),
    );
  }
}

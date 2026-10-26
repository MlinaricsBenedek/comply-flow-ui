import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, catchError, switchMap, takeWhile, timer } from 'rxjs';
import {
  ConfigurationSummaryResponse,
  ConversationResponse,
  MessageResponse,
  ProcessingResultResponse,
} from './api.models';
import { ConfigurationService } from './configuration.service';
import { ConversationService } from './conversation.service';

interface ChatMessage {
  key: string;
  sender: 'user' | 'system';
  content: string;
  timestamp: string;
  processingId?: number;
}

@Component({
  selector: 'app-conversation-page',
  imports: [RouterLink],
  template: `
    <main class="conversation-page">
      <div class="conversation-shell">
        <header class="conversation-header">
          <div class="header-left">
            <button type="button" class="back-button" [routerLink]="['/']">← Back</button>
            <div>
              <p class="eyebrow">Conversation</p>
              <h1>{{ currentTitle() }}</h1>
            </div>
          </div>

          <div class="header-actions">
            <label class="field-group compact">
              <span>Configuration</span>
              <select
                [value]="selectedConfigurationId() ?? ''"
                (change)="selectConfiguration($event)"
                [disabled]="loadingConfigurations() || configurations().length === 0"
              >
                @for (configuration of configurations(); track configuration.id) {
                  <option [value]="configuration.id">
                    {{ configuration.name ?? 'Unnamed configuration' }} (#{{ configuration.id }})
                  </option>
                }
              </select>
            </label>
          </div>
        </header>

        @if (errorMessage()) {
          <p class="error-message" role="alert">{{ errorMessage() }}</p>
        }
        @if (configurationError()) {
          <p class="error-message" role="alert">{{ configurationError() }}</p>
        }
        @if (loadingConversation()) {
          <p class="status-message">Loading conversation…</p>
        }
        @if (loadingMessages()) {
          <p class="status-message">Loading messages…</p>
        }
        @if (messagesError()) {
          <p class="error-message" role="alert">{{ messagesError() }}</p>
        }
        @if (loadingConfigurations()) {
          <p class="status-message">Loading configurations…</p>
        } @else if (configurations().length === 0) {
          <p class="error-message" role="alert">Create a configuration before sending a message.</p>
        }

        <section class="chat-panel">
          <div class="chat-thread">
            @for (message of messages(); track message.key) {
              <div
                class="message-row"
                [class.user]="message.sender === 'user'"
                [class.system]="message.sender === 'system'"
              >
                <div class="message-bubble">
                  <p>{{ message.content }}</p>
                  <span>{{ message.timestamp }}</span>
                  @if (message.processingId) {
                    <a
                      class="detail-link"
                      [routerLink]="['/details', conversationId(), message.processingId]"
                      [queryParams]="{ chatTitle: currentTitle() }"
                    >
                      View processing details #{{ message.processingId }}
                    </a>
                  }
                </div>
              </div>
            } @empty {
              @if (!loadingConversation() && !loadingMessages() && !messagesError()) {
                <p class="empty-thread">No messages yet. Send a message to start this conversation.</p>
              }
            }
          </div>

          <div class="composer">
            <textarea
              rows="4"
              placeholder="Írd le a panasz szövegét..."
              [value]="draftMessage()"
              (input)="draftMessage.set($any($event.target).value)"
              [disabled]="loadingConversation() || !conversationId()"
            ></textarea>

            <div class="composer-actions">
              <button type="button" class="secondary-button" [routerLink]="['/']">Cancel</button>
              <button
                type="button"
                class="primary-button"
                (click)="sendMessage()"
                [disabled]="!canSend() || isSending()"
              >
                {{ isSending() ? 'Sending…' : 'Send' }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  `,
  styles: [
    '.conversation-page { min-height: 100vh; padding: 32px; background: linear-gradient(180deg, #eef6ff 0%, #f8fafc 100%); font-family: Inter, "Segoe UI", sans-serif; color: #0f172a; }',
    '.conversation-shell { max-width: 1100px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08); padding: 24px; }',
    '.conversation-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }',
    '.header-left { display: flex; align-items: center; gap: 14px; }',
    '.header-left h1 { margin: 0; font-size: clamp(1.7rem, 2vw, 2.4rem); }',
    '.eyebrow { margin: 0 0 6px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; }',
    '.back-button, .secondary-button, .primary-button { border: none; border-radius: 12px; padding: 0.8rem 1.1rem; font-weight: 700; cursor: pointer; font: inherit; }',
    '.back-button { background: #e2e8f0; color: #0f172a; }',
    '.secondary-button { background: #eef2ff; color: #1e293b; }',
    '.primary-button { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2); }',
    '.primary-button:disabled { opacity: 0.5; cursor: not-allowed; }',
    '.header-actions { display: flex; justify-content: flex-end; }',
    '.field-group { display: flex; flex-direction: column; gap: 8px; }',
    '.field-group span { font-size: 0.76rem; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }',
    '.field-group select { width: min(320px, 100%); padding: 0.9rem 1rem; border-radius: 12px; border: 1px solid #cbd5e1; background: #fff; color: #0f172a; font: inherit; }',
    '.status-message, .empty-thread { color: #64748b; line-height: 1.5; }',
    '.error-message { margin: 12px 0; color: #b91c1c; line-height: 1.5; font-weight: 600; }',
    '.chat-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; }',
    '.chat-thread { display: flex; flex-direction: column; gap: 14px; min-height: 350px; max-height: 58vh; overflow-y: auto; padding: 6px 2px 12px; }',
    '.message-row { display: flex; }',
    '.message-row.user { justify-content: flex-end; }',
    '.message-row.system { justify-content: flex-start; }',
    '.message-bubble { position: relative; max-width: min(72%, 620px); border-radius: 16px; padding: 12px 14px; box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05); }',
    '.message-row.user .message-bubble { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; }',
    '.message-row.system .message-bubble { background: #eef2ff; color: #1e293b; }',
    '.message-bubble p { margin: 4px 0 6px; line-height: 1.5; white-space: pre-wrap; }',
    '.message-bubble span { display: block; font-size: 0.7rem; opacity: 0.8; margin-top: 4px; }',
    '.detail-link { display: inline-block; margin-top: 8px; color: inherit; font-size: 0.78rem; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }',
    '.composer { margin-top: 18px; border-top: 1px solid #e2e8f0; padding-top: 18px; }',
    '.composer textarea { width: 100%; box-sizing: border-box; resize: vertical; border-radius: 12px; border: 1px solid #cbd5e1; padding: 0.9rem 1rem; font: inherit; min-height: 90px; }',
    '.composer textarea:focus { outline: 2px solid #bfdbfe; border-color: #60a5fa; }',
    '.composer-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }',
    '@media (max-width: 640px) { .conversation-page { padding: 18px; } .conversation-shell { padding: 18px; } .conversation-header { flex-direction: column; align-items: flex-start; } .header-actions, .composer-actions { width: 100%; } .composer-actions { flex-direction: column; } .composer-actions .secondary-button, .composer-actions .primary-button { width: 100%; } }',
  ],
})
export class ConversationPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly conversationService = inject(ConversationService);
  private readonly configurationService = inject(ConfigurationService);

  protected readonly conversationId = signal<number | null>(null);
  protected readonly conversation = signal<ConversationResponse | null>(null);
  protected readonly currentTitle = computed(() => this.conversation()?.title ?? 'Conversation');
  protected readonly configurations = signal<ConfigurationSummaryResponse[]>([]);
  protected readonly selectedConfigurationId = signal<number | null>(null);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly loadingMessages = signal(true);
  protected readonly messagesError = signal<string | null>(null);
  protected readonly draftMessage = signal('');
  protected readonly loadingConversation = signal(true);
  protected readonly loadingConfigurations = signal(true);
  protected readonly isSending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly configurationError = signal<string | null>(null);
  protected readonly canSend = computed(
    () =>
      !!this.conversationId() &&
      !!this.selectedConfigurationId() &&
      !!this.draftMessage().trim() &&
      !this.loadingConversation(),
  );

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const rawId = params.get('id');
          if (rawId === null) {
            this.conversationId.set(null);
            this.loadingConversation.set(false);
            this.loadingMessages.set(false);
            this.errorMessage.set(
              'No conversation was selected. Create one from the conversation list.',
            );
            return EMPTY;
          }

          const id = Number(rawId);
          if (!Number.isInteger(id) || id < 1) {
            this.conversationId.set(null);
            this.loadingConversation.set(false);
            this.loadingMessages.set(false);
            this.errorMessage.set('The conversation ID is invalid.');
            return EMPTY;
          }

          this.conversationId.set(id);
          this.conversation.set(null);
          this.messages.set([]);
          this.loadingMessages.set(true);
          this.messagesError.set(null);
          this.loadingConversation.set(true);
          this.errorMessage.set(null);
          return this.conversationService.getConversation(id).pipe(
            catchError((error: unknown) => {
              this.conversationId.set(null);
              this.loadingConversation.set(false);
              this.errorMessage.set(ConfigurationService.getErrorMessage(error));
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((conversation) => {
        this.conversation.set(conversation);
        this.loadingConversation.set(false);
        this.loadConversationMessages(conversation.id);
      });

    this.configurationService.getConfigurations().subscribe({
      next: (configurations) => {
        this.configurations.set(configurations);
        this.selectedConfigurationId.set(configurations[0]?.id ?? null);
        this.loadingConfigurations.set(false);
      },
      error: (error: unknown) => {
        this.loadingConfigurations.set(false);
        this.configurationError.set(ConfigurationService.getErrorMessage(error));
      },
    });
  }

  protected selectConfiguration(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.selectedConfigurationId.set(Number.isInteger(id) && id > 0 ? id : null);
  }

  protected sendMessage(): void {
    const conversationId = this.conversationId();
    const configurationId = this.selectedConfigurationId();
    const content = this.draftMessage().trim();
    if (!conversationId || !configurationId || !content || this.isSending()) {
      return;
    }

    this.errorMessage.set(null);
    this.isSending.set(true);
    this.conversationService
      .sendMessage(conversationId, { content, configurationId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (message) => {
          this.isSending.set(false);
          this.draftMessage.set('');
          this.appendMessage(message);
          this.watchProcessing(message.processingId);
        },
        error: (error: unknown) => {
          this.isSending.set(false);
          this.errorMessage.set(ConfigurationService.getErrorMessage(error));
        },
      });
  }

  private appendMessage(message: MessageResponse): void {
    const timestamp = this.formatTimestamp(message.createdAt);
    this.messages.update((messages) => [
      ...messages,
      {
        key: `user-${message.id}`,
        sender: 'user',
        content: message.content,
        timestamp,
      },
      {
        key: `processing-${message.processingId}`,
        sender: 'system',
        content: 'Processing has started.',
        timestamp,
        processingId: message.processingId,
      },
    ]);
  }

  private loadConversationMessages(conversationId: number): void {
    this.loadingMessages.set(true);
    this.messagesError.set(null);
    this.conversationService
      .getConversationMessages(conversationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (messages) => {
          this.messages.set(
            [...(messages.messages ?? [])]
              .sort(
                (left, right) =>
                  new Date(left.request?.createdAt ?? 0).getTime() -
                  new Date(right.request?.createdAt ?? 0).getTime(),
              )
              .flatMap((exchange) => {
                const chatMessages: ChatMessage[] = [];
                if (exchange.request) {
                  chatMessages.push({
                    key: `request-${exchange.request.id}`,
                    sender: 'user',
                    content: exchange.request.content ?? '',
                    timestamp: this.formatTimestamp(exchange.request.createdAt),
                  });
                }

                const responseContent =
                  exchange.response?.content ??
                  exchange.error?.message ??
                  exchange.status ??
                  'No response available.';
                chatMessages.push({
                  key: `response-${exchange.processingId}`,
                  sender: 'system',
                  content: responseContent,
                  timestamp: this.formatTimestamp(
                    exchange.response?.createdAt ?? exchange.request?.createdAt ?? '',
                  ),
                  ...(exchange.processingId > 0 ? { processingId: exchange.processingId } : {}),
                });
                return chatMessages;
              }),
          );
          this.loadingMessages.set(false);
        },
        error: (error: unknown) => {
          this.loadingMessages.set(false);
          this.messagesError.set(ConfigurationService.getErrorMessage(error));
        },
      });
  }

  private watchProcessing(processingId: number): void {
    let finished = false;
    timer(0, 1500)
      .pipe(
        switchMap(() => this.conversationService.getProcessingResult(processingId)),
        takeWhile((result, index) => !result.isFinished && index < 59, true),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          finished = result.isFinished;
          this.updateProcessingMessage(processingId, result);
        },
        error: (error: unknown) => {
          this.updateProcessingMessage(
            processingId,
            null,
            ConfigurationService.getErrorMessage(error),
          );
        },
        complete: () => {
          if (!finished) {
            this.updateProcessingMessage(
              processingId,
              null,
              'Processing is still underway. Please check again later.',
            );
          }
        },
      });
  }

  private updateProcessingMessage(
    processingId: number,
    result: ProcessingResultResponse | null,
    errorMessage?: string,
  ): void {
    const responseText = result?.results?.response?.text?.trim();
    const statusText = result?.error?.message ?? result?.availabilityMessage ?? result?.status;
    const content = errorMessage ?? responseText ?? statusText ?? 'Processing is in progress…';
    this.messages.update((messages) =>
      messages.map((message) =>
        message.processingId === processingId ? { ...message, content } : message,
      ),
    );
  }

  private formatTimestamp(value: string): string {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toISOString().replace('T', ' ').slice(0, 16);
  }
}

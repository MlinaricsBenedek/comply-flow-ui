import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  content: string;
  timestamp: string;
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
              <select [value]="selectedConfiguration()" (change)="selectedConfiguration.set($any($event.target).value)">
                @for (option of configurationOptions; track option) {
                  <option [value]="option">{{ option }}</option>
                }
              </select>
            </label>
          </div>
        </header>

        <section class="chat-panel">
          <div class="chat-thread">
            @for (message of messages(); track message.id) {
              <div class="message-row" [class.user]="message.sender === 'user'" [class.system]="message.sender === 'system'">
                @if (message.sender === 'system') {
                  <button type="button" class="message-bubble clickable-message" (click)="openMessageDetails(message.id)" aria-label="Open message details">
                    <span class="hover-label">details</span>
                    <p>{{ message.content }}</p>
                    <span>{{ message.timestamp }}</span>
                  </button>
                } @else {
                  <div class="message-bubble">
                    <p>{{ message.content }}</p>
                    <span>{{ message.timestamp }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <div class="composer">
            <textarea
              rows="4"
              placeholder="Írd le a panasz szövegét..."
              [value]="draftMessage()"
              (input)="draftMessage.set($any($event.target).value)"
            ></textarea>

            <div class="composer-actions">
              <button type="button" class="secondary-button" [routerLink]="['/']">Cancel</button>
              <button type="button" class="primary-button" (click)="sendMessage()" [disabled]="!draftMessage().trim()">
                Send
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
    '.field-group select { width: min(280px, 100%); padding: 0.9rem 1rem; border-radius: 12px; border: 1px solid #cbd5e1; background: #fff; color: #0f172a; font: inherit; }',
    '.chat-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; }',
    '.chat-thread { display: flex; flex-direction: column; gap: 14px; min-height: 350px; max-height: 58vh; overflow-y: auto; padding: 6px 2px 12px; }',
    '.message-row { display: flex; }',
    '.message-row.user { justify-content: flex-end; }',
    '.message-row.system { justify-content: flex-start; }',
    '.message-bubble { position: relative; max-width: min(72%, 620px); border-radius: 16px; padding: 12px 14px; box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05); }',
    '.message-row.user .message-bubble { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; }',
    '.message-row.system .message-bubble { background: #eef2ff; color: #1e293b; }',
    '.clickable-message { border: none; text-align: left; cursor: pointer; position: relative; }',
    '.hover-label { position: absolute; right: 12px; top: 8px; font-size: 0.6rem; letter-spacing: 0.08em; text-transform: lowercase; opacity: 0; transition: opacity 0.2s ease; color: #1d4ed8; z-index: 1; }',
    '.clickable-message:hover .hover-label, .clickable-message:focus-visible .hover-label { opacity: 1; }',
    '.message-bubble p { margin: 18px 0 6px; line-height: 1.5; }',
    '.message-bubble span { display: block; font-size: 0.7rem; opacity: 0.8; }',
    '.composer { margin-top: 18px; border-top: 1px solid #e2e8f0; padding-top: 18px; }',
    '.composer textarea { width: 100%; box-sizing: border-box; resize: vertical; border-radius: 12px; border: 1px solid #cbd5e1; padding: 0.9rem 1rem; font: inherit; min-height: 90px; }',
    '.composer textarea:focus { outline: 2px solid #bfdbfe; border-color: #60a5fa; }',
    '.composer-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }',
    '@media (max-width: 640px) { .conversation-page { padding: 18px; } .conversation-shell { padding: 18px; } .conversation-header { flex-direction: column; align-items: flex-start; } .header-actions, .composer-actions { width: 100%; } .composer-actions { flex-direction: column; } .composer-actions .secondary-button, .composer-actions .primary-button { width: 100%; } }',
  ],
})
export class ConversationPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly configurationOptions = ['Template Configuration', 'LLM Configuration'];
  protected readonly selectedConfiguration = signal('Template Configuration');
  protected readonly draftMessage = signal('');

  protected readonly conversationId = signal(this.route.snapshot.paramMap.get('id') ?? 'conv-101');
  protected readonly currentTitle = signal(this.resolveTitle(this.conversationId()));
  protected readonly messages = signal<ChatMessage[]>(this.getMessagesForConversation(this.conversationId()));

  protected openMessageDetails(messageId: string): void {
    this.router.navigate(['/details', this.conversationId(), messageId], {
      queryParams: {
        configurationName: this.selectedConfiguration(),
      },
    });
  }

  protected sendMessage(): void {
    const text = this.draftMessage().trim();

    if (!text) {
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const next = [
      ...this.messages(),
      {
        id: `${this.conversationId()}-${Date.now()}`,
        sender: 'user' as const,
        content: text,
        timestamp,
      },
      {
        id: `message-${Date.now()}`,
        sender: 'system' as const,
        content: 'A rendszer a beérkező üzenetet előfeldolgozza és a releváns szabályok alapján továbbítja a feldolgozási folyamatnak.',
        timestamp,
      },
    ];

    this.messages.set(next);
    this.draftMessage.set('');
  }

  private getMessagesForConversation(id: string): ChatMessage[] {
    const dataset: Record<string, ChatMessage[]> = {
      'conv-101': [
        {
          id: 'chat-1',
          sender: 'user',
          content: 'A múlt héten vásárolt fejhallgatóm hibásan működik. Szeretném visszakapni a pénzem.',
          timestamp: '09:13',
        },
        {
          id: 'message-1',
          sender: 'system',
          content: 'A rendszer előfeldolgozta a panaszt, eltávolította a személyes adatokat és a refund kérelemre vonatkozó szabályokat alkalmazta.',
          timestamp: '09:14',
        },
      ],
      'conv-102': [
        {
          id: 'chat-3',
          sender: 'user',
          content: 'A számlakivonatom nem mutatja a teljes kamatösszeget.',
          timestamp: '08:45',
        },
        {
          id: 'message-3',
          sender: 'system',
          content: 'A kérdésben szereplő adatok ellenőrzése megtörtént, a további lépés a banki tranzakciók összevetése.',
          timestamp: '08:47',
        },
      ],
      'conv-103': [
        {
          id: 'chat-5',
          sender: 'user',
          content: 'Kérném a termék cseréjét és a visszatérítést.',
          timestamp: '08:03',
        },
        {
          id: 'message-5',
          sender: 'system',
          content: 'A korábbi ügyben a kérés lezárult, a válasz ellenőrzés alatt áll.',
          timestamp: '08:05',
        },
      ],
    };

    return dataset[id] ?? dataset['conv-101'];
  }

  private resolveTitle(id: string): string {
    const titles: Record<string, string> = {
      'conv-101': 'Fejhallgató reklamáció',
      'conv-102': 'Számlakivonat és kamatvitás',
      'conv-103': 'Termékcsere kérése',
    };

    return titles[id] ?? 'New conversation';
  }
}

import { Component, signal } from '@angular/core';
import { ChatMessage, ChatMessageComponent } from './chat-message.component';

@Component({
  selector: 'app-root',
  imports: [ChatMessageComponent],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Comply Flow UI');
  protected readonly draftMessage = signal('');
  protected readonly messages = signal<ChatMessage[]>([
    {
      id: '1',
      sender: 'user',
      content: 'Tóth Jakab vagyok, az egyenlegem 100000000 Ft, és 50 Ft kamatot kaptam. Miért nem 100 Ft-ot?',
      timestamp: '09:15',
    },
    {
      id: '2',
      sender: 'ai',
      content:
        'A kérdésben a név személyes adat, ezért az LLM-nek nem továbbítjuk. A biztonsági szabály miatt a rendszer a személyes adatokat eltávolítja, majd a tisztított szöveg alapján válaszol.',
      timestamp: '09:16',
    },
  ]);

  protected updateDraft(value: string): void {
    this.draftMessage.set(value);
  }

  protected sendMessage(): void {
    const text = this.draftMessage().trim();

    if (!text) {
      return;
    }

    const nextMessages = [
      ...this.messages(),
      {
        id: crypto.randomUUID(),
        sender: 'user' as const,
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    this.messages.set(nextMessages);
    this.draftMessage.set('');
  }
}

import { Component, signal } from '@angular/core';
import { ChatMessage, ChatMessageComponent } from './chat-message.component';
import { HistoryMenuComponent, HistoryMenuItem } from './history-menu.component';

@Component({
  selector: 'app-root',
  imports: [ChatMessageComponent, HistoryMenuComponent],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Comply Flow UI');
  protected readonly draftMessage = signal('');
  protected readonly selectedHistoryId = signal('1');
  protected readonly historyItems = signal<HistoryMenuItem[]>([
    {
      id: '1',
      summary: 'Panasz: 100 Ft kamat összege nem egyezik a várttal.',
      status: 'new',
      timestamp: '09:15',
    },
    {
      id: '2',
      summary: 'Személyes adatok szűrése, prompt tisztítása megtörtént.',
      status: 'review',
      timestamp: '08:50',
    },
    {
      id: '3',
      summary: 'Panasz lezárva, a válasz hitelesítés alatt.',
      status: 'resolved',
      timestamp: '08:10',
    },
  ]);
  protected readonly chatMap = signal<Record<string, ChatMessage[]>>({
    '1': [
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
    ],
    '2': [
      {
        id: '10',
        sender: 'user',
        content: 'A banki számlakivonatomban 5000 Ft kamat szerepel, de nem látom a követelés összegét.',
        timestamp: '08:50',
      },
      {
        id: '11',
        sender: 'ai',
        content:
          'A rendszer eltávolította a személyes azonosítót és a releváns adatokat összegyűjtötte a banki kamat és a kérdés logikájához.',
        timestamp: '08:51',
      },
    ],
    '3': [
      {
        id: '20',
        sender: 'user',
        content: 'Miért nem kaptam meg a teljes felárat a panaszom után?',
        timestamp: '08:10',
      },
      {
        id: '21',
        sender: 'ai',
        content:
          'A korábbi felülvizsgálat alapján a kérdés lezárult, és a válasz ellenőrzés alatt áll.',
        timestamp: '08:12',
      },
    ],
  });
  protected readonly messages = signal<ChatMessage[]>(this.chatMap()['1']);

  protected openChat(chatId: string): void {
    this.selectedHistoryId.set(chatId);
    const nextMessages = this.chatMap()[chatId] ?? this.chatMap()['1'];
    this.messages.set(nextMessages);
  }

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

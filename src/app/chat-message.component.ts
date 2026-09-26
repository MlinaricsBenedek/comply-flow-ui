import { Component, Input } from '@angular/core';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

@Component({
  selector: 'app-chat-message',
  standalone: true,
  template: `
    <div class="message-row" [class.user]="isUser" [class.ai]="!isUser">
      <div class="message-bubble">
        <div class="message-header">
          <span>{{ isUser ? 'Kérdés' : 'Válasz' }}</span>
          <span>{{ message.timestamp }}</span>
        </div>
        <p>{{ message.content }}</p>
      </div>
    </div>
  `,
  styleUrl: './chat-message.component.css',
})
export class ChatMessageComponent {
  @Input() message!: ChatMessage;

  get isUser(): boolean {
    return this.message?.sender === 'user';
  }
}

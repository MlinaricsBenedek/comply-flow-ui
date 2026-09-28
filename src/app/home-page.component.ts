import { Component, computed, signal } from '@angular/core';

interface ConversationEntry {
  id: string;
  title: string;
  summary: string;
  status: 'New' | 'In review' | 'Resolved';
  statusKey: 'new' | 'review' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-home-page',
  imports: [],
  styleUrl: './app.css',
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  protected readonly title = signal('Comply Flow');
  protected readonly conversations = signal<ConversationEntry[]>([
    {
      id: 'conv-101',
      title: 'Fejhallgató reklamáció',
      summary: 'Ár és minőség eltérés a rendelésben.',
      status: 'New',
      statusKey: 'new',
      createdAt: '2026-09-27',
      updatedAt: '09:15',
    },
    {
      id: 'conv-102',
      title: 'Számlakivonat és kamatvitás',
      summary: 'A felhasználó a kamat és a követelés összegét vitatja.',
      status: 'In review',
      statusKey: 'review',
      createdAt: '2026-09-25',
      updatedAt: '08:50',
    },
    {
      id: 'conv-103',
      title: 'Termékcsere kérése',
      summary: 'A vevő a termék cseréjét és a pénzvisszatérítést kéri.',
      status: 'Resolved',
      statusKey: 'resolved',
      createdAt: '2026-09-21',
      updatedAt: '08:10',
    },
  ]);
  protected readonly selectedConversationId = signal('conv-101');
  protected readonly showCreateModal = signal(false);
  protected readonly newConversationTitle = signal('');

  protected readonly selectedConversation = computed(() => {
    return (
      this.conversations().find((conversation) => conversation.id === this.selectedConversationId()) ??
      this.conversations()[0] ??
      {
        id: 'empty',
        title: 'Nincs kiválasztott beszélgetés',
        summary: 'Hozz létre új beszélgetést a panaszok kezeléséhez.',
        status: 'New',
        statusKey: 'new',
        createdAt: '-',
        updatedAt: '-',
      }
    );
  });

  protected openConversation(id: string): void {
    this.selectedConversationId.set(id);
  }

  protected openCreateModal(): void {
    this.newConversationTitle.set('');
    this.showCreateModal.set(true);
  }

  protected closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.newConversationTitle.set('');
  }

  protected createConversation(): void {
    const title = this.newConversationTitle().trim();

    if (!title) {
      return;
    }

    const now = new Date();
    const id = `conv-${now.getTime()}`;
    const newEntry: ConversationEntry = {
      id,
      title,
      summary: 'Új beszélgetés létrehozva. Az ügyfél üzenete hamarosan feldolgozásra kerül.',
      status: 'New',
      statusKey: 'new',
      createdAt: now.toISOString().slice(0, 10),
      updatedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.conversations.update((items) => [newEntry, ...items]);
    this.selectedConversationId.set(id);
    this.closeCreateModal();
  }
}

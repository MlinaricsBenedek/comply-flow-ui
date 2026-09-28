import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConversationEntry, ConversationService } from './conversation.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  styleUrl: './app.css',
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  private readonly router = inject(Router);
  private readonly conversationService = inject(ConversationService);

  protected readonly title = signal('Comply Flow');
  protected readonly conversations = this.conversationService.conversations;
  protected readonly selectedConversationId = signal('conv-101');

  constructor() {
    this.conversationService.loadConversations().subscribe();
  }
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

    this.conversationService.createConversation(title).subscribe((created) => {
      this.selectedConversationId.set(created.id);
      this.closeCreateModal();
      this.router.navigate(['/conversation', created.id]);
    });
  }
}

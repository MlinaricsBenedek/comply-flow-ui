import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConversationResponse, RequestConversation } from './api.models';
import { ConfigurationService } from './configuration.service';
import { ConversationService } from './conversation.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  styleUrl: './app.css',
  templateUrl: './home-page.component.html',
})
export class HomePageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly conversationService = inject(ConversationService);

  protected readonly title = signal('Comply Flow');
  protected readonly conversations = signal<ConversationResponse[]>([]);
  protected readonly selectedConversationId = signal<number | null>(null);
  protected readonly showCreateModal = signal(false);
  protected readonly newConversationTitle = signal('');
  protected readonly isLoading = signal(true);
  protected readonly isCreating = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly selectedConversation = computed(
    () =>
      this.conversations().find(
        (conversation) => conversation.id === this.selectedConversationId(),
      ) ?? null,
  );

  ngOnInit(): void {
    this.conversationService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations.set(conversations);
        this.selectedConversationId.set(conversations[0]?.id ?? null);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(ConfigurationService.getErrorMessage(error));
        this.isLoading.set(false);
      },
    });
  }

  protected openConversation(id: number): void {
    this.selectedConversationId.set(id);
  }

  protected openCreateModal(): void {
    this.newConversationTitle.set('');
    this.errorMessage.set(null);
    this.showCreateModal.set(true);
  }

  protected closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.newConversationTitle.set('');
  }

  protected createConversation(): void {
    const title = this.newConversationTitle().trim();
    if (!title || title.length > 200 || this.isCreating()) {
      return;
    }

    const request: RequestConversation = { title };
    this.isCreating.set(true);
    this.errorMessage.set(null);
    this.conversationService.createConversation(request).subscribe({
      next: (conversation) => {
        this.isCreating.set(false);
        this.closeCreateModal();
        this.router.navigate(['/conversation', conversation.id]);
      },
      error: (error: unknown) => {
        this.isCreating.set(false);
        this.errorMessage.set(ConfigurationService.getErrorMessage(error));
      },
    });
  }

  protected formatDate(value: string): string {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toISOString().slice(0, 10);
  }

  protected statusKey(status: string | null): 'new' | 'review' | 'resolved' {
    const normalizedStatus = status?.toLowerCase() ?? '';
    if (normalizedStatus.includes('complete') || normalizedStatus.includes('resolv')) {
      return 'resolved';
    }
    if (normalizedStatus.includes('process') || normalizedStatus.includes('review')) {
      return 'review';
    }
    return 'new';
  }
}

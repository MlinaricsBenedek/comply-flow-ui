import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface HistoryMenuItem {
  id: string;
  summary: string;
  status: 'new' | 'review' | 'resolved';
  timestamp: string;
}

@Component({
  selector: 'app-history-menu',
  standalone: true,
  template: `
    <aside class="history-menu">
      <div class="history-header">
        <h3>Előzmények</h3>
      </div>

      <div class="history-list">
        @for (item of items; track item.id) {
          <button
            type="button"
            class="history-item"
            [class.active]="selectedId === item.id"
            (click)="selectItem(item.id)"
          >
            <div class="history-topline">
              <span class="status" [class]="item.status">{{ statusLabel(item.status) }}</span>
              <span class="time">{{ item.timestamp }}</span>
            </div>
            <p>{{ item.summary }}</p>
          </button>
        }
      </div>
    </aside>
  `,
  styleUrl: './history-menu.component.css',
})
export class HistoryMenuComponent {
  @Input() items: HistoryMenuItem[] = [];
  @Input() selectedId: string | null = null;
  @Output() itemSelected = new EventEmitter<string>();

  protected statusLabel(status: HistoryMenuItem['status']): string {
    switch (status) {
      case 'new':
        return 'Új';
      case 'review':
        return 'Áttekintés';
      case 'resolved':
        return 'Megoldott';
      default:
        return status;
    }
  }

  protected selectItem(id: string): void {
    this.itemSelected.emit(id);
  }
}

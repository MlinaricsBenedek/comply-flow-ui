import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface DetailEntry {
  messageId: string;
  messageTitle: string;
  summary: string;
  preprocessedText: string;
  rules: string[];
  finalPrompt: string;
}

@Component({
  selector: 'app-details-page',
  template: `
    <main class="details-page">
      <section class="details-shell">
        <header class="details-header">
          <button type="button" class="back-button" (click)="goBack()">Vissza</button>
          <h1>{{ chatTitle() }}</h1>
        </header>

        <div class="details-content">
          <div class="selector-group">
            <label for="detail-select">Message</label>
            <select id="detail-select" [value]="selectedDetailTitle()" (change)="selectedDetailTitle.set($any($event.target).value)">
              @for (entry of visibleEntries(); track entry.messageTitle) {
                <option [value]="entry.messageTitle">{{ entry.messageTitle }}</option>
              }
            </select>
          </div>

          <div class="detail-card">
            <div class="detail-header-row">
              <span class="badge">Selected detail</span>
              <h2>{{ selectedDetail().messageTitle }}</h2>
            </div>

            <p class="summary">{{ selectedDetail().summary }}</p>

            <div class="detail-grid">
              <div class="detail-block">
                <h3>Preprocessed text</h3>
                <textarea readonly rows="5">{{ selectedDetail().preprocessedText }}</textarea>
              </div>

              <div class="detail-block">
                <h3>Applied rules</h3>
                <ul>
                  @for (rule of selectedDetail().rules; track rule) {
                    <li>{{ rule }}</li>
                  }
                </ul>
              </div>
            </div>

            <div class="detail-block prompt-block">
              <h3>Final prompt</h3>
              <textarea readonly rows="4">{{ selectedDetail().finalPrompt }}</textarea>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [
    '.details-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f4f7fb; font-family: Arial, sans-serif; padding: 32px; }',
    '.details-shell { width: min(1200px, 100%); background: #ffffff; border: 1px solid #dfe7f1; border-radius: 18px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); padding: 24px 28px; }',
    '.details-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }',
    '.back-button { border: none; border-radius: 10px; background: #e2e8f0; color: #0f172a; padding: 10px 18px; font-weight: 600; cursor: pointer; }',
    '.details-header h1 { margin: 0; font-size: 1.6rem; color: #1f2937; text-align: right; flex: 1; word-break: break-word; }',
    '.details-content { display: flex; flex-direction: column; gap: 20px; }',
    '.selector-group { display: flex; flex-direction: column; gap: 8px; max-width: 420px; }',
    '.selector-group label { font-size: 0.8rem; font-weight: 700; color: #334155; }',
    '.selector-group select { width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; background: #ffffff; padding: 10px 12px; font-size: 0.95rem; color: #0f172a; }',
    '.detail-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }',
    '.detail-header-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }',
    '.badge { display: inline-block; background: #dbeafe; color: #1d4ed8; border-radius: 999px; font-size: 0.75rem; font-weight: 700; padding: 6px 10px; }',
    '.detail-header-row h2 { margin: 0; font-size: 1.25rem; color: #0f172a; }',
    '.summary { margin: 0 0 18px; color: #475569; line-height: 1.6; }',
    '.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }',
    '.detail-block { display: flex; flex-direction: column; gap: 10px; }',
    '.detail-block h3 { margin: 0; font-size: 0.95rem; color: #334155; }',
    '.detail-block textarea { width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 10px; background: #ffffff; padding: 12px 14px; color: #0f172a; resize: vertical; }',
    '.detail-block ul { margin: 0; padding-left: 18px; color: #334155; line-height: 1.8; }',
    '.prompt-block { margin-top: 18px; }',
  ],
})
export class DetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly conversationId = signal(this.route.snapshot.paramMap.get('conversationId') ?? this.route.snapshot.queryParamMap.get('chatId') ?? '1');
  protected readonly messageId = signal(this.route.snapshot.paramMap.get('messageId') ?? this.route.snapshot.queryParamMap.get('messageId') ?? 'message-1');
  protected readonly chatTitle = signal(this.route.snapshot.queryParamMap.get('chatTitle') ?? 'Details');

  protected readonly visibleEntries = signal<DetailEntry[]>(this.getVisibleEntriesForChat(this.conversationId()));
  protected readonly selectedDetailTitle = signal(
    this.visibleEntries().find((entry) => entry.messageId === this.messageId())?.messageTitle ?? this.visibleEntries()[0]?.messageTitle ?? 'Details',
  );
  protected readonly selectedDetail = computed(() => {
    return (
      this.visibleEntries().find((entry) => entry.messageId === this.messageId()) ??
      this.visibleEntries().find((entry) => entry.messageTitle === this.selectedDetailTitle()) ??
      this.visibleEntries()[0]
    );
  });

  protected goBack(): void {
    this.router.navigate(['/conversation', this.conversationId()]);
  }

  private getVisibleEntriesForChat(chatId: string): DetailEntry[] {
    const entriesByChat: Record<string, DetailEntry[]> = {
      'conv-101': [
        {
          messageId: 'message-1',
          messageTitle: 'A múlt héten vásárolt fejhallgatóm hibásan működik. Szeretném visszakapni a pénzem.',
          summary: 'A panaszban szereplő hiba és a visszatérítés kérése.',
          preprocessedText: 'Fejhallgató hibás, pénzvisszatérítés kérés.',
          rules: ['Személyes adatok eltávolítása', 'Termékhiba észlelése', 'Refund kérelem ellenőrzése'],
          finalPrompt: 'Értékelje a fejhallgató hibáját és a pénzvisszatérítés jogosságát a rendelkezésre álló tények alapján.',
        },
        {
          messageId: 'message-2',
          messageTitle: 'A rendszer előfeldolgozta a panaszt, eltávolította a személyes adatokat és a refund kérelemre vonatkozó szabályokat alkalmazta.',
          summary: 'A rendszertisztítás és a szabályalapú döntés folyamatának összefoglalása.',
          preprocessedText: 'Személyes adatok eltávolítva, a refund logika a további feldolgozásban maradt.',
          rules: ['Név eltávolítása', 'Adatbiztonság', 'Refund logika alkalmazása'],
          finalPrompt: 'A tisztított kontextus alapján határozd meg a refund döntéshez szükséges következtetéseket.',
        },
      ],
      'conv-102': [
        {
          messageId: 'message-3',
          messageTitle: 'A számlakivonatom nem mutatja a teljes kamatösszeget.',
          summary: 'A banki kamat és a követelés összegének összehasonlítása.',
          preprocessedText: 'A számlakivonatból hiányzik a teljes kamatösszeg.',
          rules: ['Adatbiztonság', 'Összefüggés ellenőrzése', 'Kamatfeldolgozás'],
          finalPrompt: 'Azonosítsd a hiányzó kamatösszeget és ellenőrizd a konzisztenciát a banki adatokkal.',
        },
        {
          messageId: 'message-4',
          messageTitle: 'A kérdésben szereplő adatok ellenőrzése megtörtént, a további lépés a banki tranzakciók összevetése.',
          summary: 'A banki tranzakciók ellenőrzése és a releváns adatok összegyűjtése.',
          preprocessedText: 'Banki tranzakciók és kérdés logikája összevetése szükséges.',
          rules: ['Személyes adatok eltávolítása', 'Tranzakció ellenőrzése', 'Kérdés logikájának validálása'],
          finalPrompt: 'Ellenőrizd a banki tranzakciók és a kérdés logikája közötti összefüggést.',
        },
      ],
      'conv-103': [
        {
          messageId: 'message-5',
          messageTitle: 'Kérném a termék cseréjét és a visszatérítést.',
          summary: 'A termékcsere és a refund kérése.',
          preprocessedText: 'Termékcsere és pénzvisszatérítés kérés.',
          rules: ['Felár ellenőrzése', 'Csere kérelem', 'Refund döntés'],
          finalPrompt: 'Értékelje a termékcsere-kérelem és a refund logikáját a rendelkezésre álló adatok alapján.',
        },
        {
          messageId: 'message-6',
          messageTitle: 'A korábbi ügyben a kérés lezárult, a válasz ellenőrzés alatt áll.',
          summary: 'A lezárás és ellenőrzés állapotának vizsgálata.',
          preprocessedText: 'A korábbi felülvizsgálat alapján a kérdés lezárult.',
          rules: ['Lezárás', 'Válasz ellenőrzése', 'Audit követelmények'],
          finalPrompt: 'Ellenőrizd, hogy a lezárt ügyben a válasz megfelel-e az audit és nyomkövetési követelményeknek.',
        },
      ],
    };

    return entriesByChat[chatId] ?? entriesByChat['conv-101'];
  }
}

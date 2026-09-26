import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface DetailEntry {
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

  protected readonly chatTitle = signal(this.route.snapshot.queryParamMap.get('chatTitle') ?? 'Details');
  protected readonly selectedHistoryId = signal(this.route.snapshot.queryParamMap.get('chatId') ?? '1');

  protected readonly visibleEntries = signal<DetailEntry[]>(this.getVisibleEntriesForChat(this.selectedHistoryId()));
  protected readonly selectedDetailTitle = signal(this.visibleEntries()[0]?.messageTitle ?? 'Details');
  protected readonly selectedDetail = computed(() =>
    this.visibleEntries().find((entry) => entry.messageTitle === this.selectedDetailTitle()) ?? this.visibleEntries()[0],
  );

  protected goBack(): void {
    this.router.navigate(['/']);
  }

  private getVisibleEntriesForChat(chatId: string): DetailEntry[] {
    const entriesByChat: Record<string, DetailEntry[]> = {
      '1': [
        {
          messageTitle: 'Tóth Jakab vagyok, az egyenlegem 100000000 Ft, és 50 Ft kamatot kaptam. Miért nem 100 Ft-ot?',
          summary: 'A panaszban szereplő kamatösszeg és az ügyfél által megadott érték összehasonlítása.',
          preprocessedText: 'Tóth Jakab, 100000000 Ft egyenleg, 50 Ft kamat, összeg és kamat ellenőrzése szükséges.',
          rules: ['Személyes adatok eltávolítása', 'Számértékek validálása', 'Panasz logikájának ellenőrzése'],
          finalPrompt: 'Ellenőrizd a panaszban szereplő kamatösszeg és a tényadatok konzisztenciáját, és jelezd a különbségeket a felhasználó számára.',
        },
        {
          messageTitle: 'A kérdésben a név személyes adat, ezért az LLM-nek nem továbbítjuk. A biztonsági szabály miatt a rendszer a személyes adatokat eltávolítja, majd a tisztított szöveg alapján válaszol.',
          summary: 'A kérdésből a személyes adatok eltávolítása és a további feldolgozás biztonságosítása.',
          preprocessedText: 'A felhasználó megadott azonosításra alkalmas adatokat, amelyeket eltávolítottunk a promptből.',
          rules: ['Név eltávolítása', 'Számlaszám anonimizálása', 'Biztonsági szabály alkalmazása'],
          finalPrompt: 'A promptet anonimizált formában továbbítsd az LLM-nek, és csak a releváns üzleti kontextust tartsd meg.',
        },
      ],
      '2': [
        {
          messageTitle: 'A banki számlakivonatomban 5000 Ft kamat szerepel, de nem látom a követelés összegét.',
          summary: 'A banki kamat és a követelés összegének összefüggésének ellenőrzése.',
          preprocessedText: 'A banki kivonatban szereplő 5000 Ft kamat, a felhasználó szerint nem látszik a követelés összegének összevetéséhez.',
          rules: ['Adatbiztonság', 'Összefüggés ellenőrzése', 'Felhasználó által látott adatok használata'],
          finalPrompt: 'Azonosítsd a közvetlenül látható pénzügyi adatokat, és ellenőrizd, hogy a követelés összege konzisztens-e a banki kivonattal.',
        },
        {
          messageTitle: 'A rendszer eltávolította a személyes azonosítót és a releváns adatokat összegyűjtötte a banki kamat és a kérdés logikájához.',
          summary: 'A rendszer által tisztított kontextus és a releváns adatok összegyűjtése a döntéshez.',
          preprocessedText: 'Személyes azonosító eltávolítva, a banki kamat és kérdés logikája maradt a további feldolgozásban.',
          rules: ['Személyes azonosító eltávolítása', 'Összefüggő adatok megtartása', 'Kérdés logikájának ellenőrzése'],
          finalPrompt: 'A tisztított kontextus alapján határozd meg, mely adatok relevánsak a kamat és követelés ellenőrzéséhez.',
        },
      ],
      '3': [
        {
          messageTitle: 'Miért nem kaptam meg a teljes felárat a panaszom után?',
          summary: 'Az ügyfél által megjelölt felár és a korábbi lezárási döntés összehasonlítása.',
          preprocessedText: 'Miért nem kaptam meg a teljes felárat a panaszom után?',
          rules: ['Felár ellenőrzése', 'Kérdés logikájának feldolgozása', 'Bizonyítékok értékelése'],
          finalPrompt: 'Értékeljék a felár kérdését a korábbi döntés és a felhasználó által megadott információk alapján.',
        },
        {
          messageTitle: 'A korábbi felülvizsgálat alapján a kérdés lezárult, és a válasz ellenőrzés alatt áll.',
          summary: 'A lezárási állapot és a válasz ellenőrzésének áttekintése.',
          preprocessedText: 'A korábbi felülvizsgálat alapján a kérdés lezárult, és a válasz ellenőrzés alatt áll.',
          rules: ['Lezárási állapot megjelenítése', 'Válasz ellenőrzése', 'Audit követelmények betartása'],
          finalPrompt: 'A lezárt ügyben ellenőrizd, hogy a válasz megfelel-e az audit és a döntési nyomvonal követelményeinek.',
        },
      ],
    };

    return entriesByChat[chatId] ?? entriesByChat['1'];
  }
}

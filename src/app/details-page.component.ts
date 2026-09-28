import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface RuleMatch {
  code: string;
  matched: boolean;
  reason: string;
}

interface StructuredCaseState {
  product: string;
  issue: string;
  requestedAction: string;
}

interface DetailEntry {
  messageId: string;
  messageTitle: string;
  originalMessage: string;
  processingRunId: number;
  configurationName: string;
  configurationType: 'template' | 'llm';
  summary: string;
  preprocessing: {
    cleanedText: string;
    caseType: string;
    structuredCaseState: StructuredCaseState;
  };
  rules: {
    decision: string;
    reason: string;
    ruleSetVersion: string;
    matchedRules: RuleMatch[];
  };
  responsePlan: {
    decision: string;
    reason: string;
    requiredElements: string[];
    responseStructure: string[];
    sources: string[];
  };
  generatedResponse: {
    generationMode: 'template' | 'llm';
    generatedResponse: string;
    templateVersion?: string;
    promptVersion?: string;
    modelName?: string;
    modelParameters?: Record<string, string | number | boolean>;
    processingTime: string;
  };
}

@Component({
  selector: 'app-details-page',
  template: `
    <main class="details-page">
      <section class="details-shell">
        <header class="details-header">
          <button type="button" class="back-button" (click)="goBack()">Vissza</button>
          <div class="header-copy">
            <span class="eyebrow">Message details</span>
            <h1>{{ chatTitle() }}</h1>
          </div>
        </header>

        <div class="detail-card">
          <div class="detail-header">
            <span class="badge">Selected detail</span>
            <h2>{{ selectedDetail().messageTitle }}</h2>
          </div>

          <div class="meta-grid">
            <div class="meta-box">
              <span class="meta-label">Configuration</span>
              <strong>{{ selectedDetail().configurationName }}</strong>
            </div>
            <div class="meta-box">
              <span class="meta-label">Mode</span>
              <strong>{{ selectedDetail().configurationType }}</strong>
            </div>
          </div>

          <div class="accordion-list">
            <details open>
              <summary>1. Original Message</summary>
              <div class="panel-body">
                <p class="summary">{{ selectedDetail().summary }}</p>
                <div class="read-only-block">
                  <label>Original message</label>
                  <textarea readonly rows="4">{{ selectedDetail().originalMessage }}</textarea>
                </div>
              </div>
            </details>

            <details open>
              <summary>2. Preprocessing</summary>
              <div class="panel-body two-column">
                <div class="read-only-block">
                  <label>Cleaned text</label>
                  <textarea readonly rows="4">{{ selectedDetail().preprocessing.cleanedText }}</textarea>
                </div>
                <div class="read-only-block">
                  <label>Case type</label>
                  <textarea readonly rows="2">{{ selectedDetail().preprocessing.caseType }}</textarea>
                </div>
                <div class="read-only-block full-span">
                  <label>Structured case state</label>
                  <div class="kv-grid">
                    @for (entry of objectEntries(selectedDetail().preprocessing.structuredCaseState); track entry[0]) {
                      <div class="kv-item">
                        <span>{{ entry[0] }}</span>
                        <strong>{{ entry[1] }}</strong>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </details>

            <details open>
              <summary>3. Rule Engine</summary>
              <div class="panel-body">
                <div class="kv-grid compact-grid">
                  <div class="kv-item">
                    <span>Decision</span>
                    <strong>{{ selectedDetail().rules.decision }}</strong>
                  </div>
                  <div class="kv-item">
                    <span>Rule set version</span>
                    <strong>{{ selectedDetail().rules.ruleSetVersion }}</strong>
                  </div>
                </div>
                <p class="rule-reason"><strong>Reason:</strong> {{ selectedDetail().rules.reason }}</p>

                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Rule code</th>
                        <th>Matched</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (rule of selectedDetail().rules.matchedRules; track rule.code) {
                        <tr>
                          <td>{{ rule.code }}</td>
                          <td>{{ rule.matched ? 'Yes' : 'No' }}</td>
                          <td>{{ rule.reason }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </details>

            <details open>
              <summary>4. Response Plan</summary>
              <div class="panel-body">
                <div class="kv-grid compact-grid">
                  <div class="kv-item">
                    <span>Decision</span>
                    <strong>{{ selectedDetail().responsePlan.decision }}</strong>
                  </div>
                  <div class="kv-item">
                    <span>Reason</span>
                    <strong>{{ selectedDetail().responsePlan.reason }}</strong>
                  </div>
                </div>

                <div class="list-block">
                  <h3>Required elements</h3>
                  <ul>
                    @for (item of selectedDetail().responsePlan.requiredElements; track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                </div>

                <div class="list-block">
                  <h3>Response structure</h3>
                  <ol>
                    @for (item of selectedDetail().responsePlan.responseStructure; track item) {
                      <li>{{ item }}</li>
                    }
                  </ol>
                </div>

                <div class="list-block">
                  <h3>Sources</h3>
                  <ul>
                    @for (item of selectedDetail().responsePlan.sources; track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                </div>
              </div>
            </details>

            <details open>
              <summary>5. Generated Response</summary>
              <div class="panel-body">
                <div class="kv-grid compact-grid">
                  <div class="kv-item">
                    <span>Generation mode</span>
                    <strong>{{ selectedDetail().generatedResponse.generationMode }}</strong>
                  </div>
                  <div class="kv-item">
                    <span>Processing time</span>
                    <strong>{{ selectedDetail().generatedResponse.processingTime }}</strong>
                  </div>
                  @if (selectedDetail().generatedResponse.templateVersion) {
                    <div class="kv-item">
                      <span>Template version</span>
                      <strong>{{ selectedDetail().generatedResponse.templateVersion }}</strong>
                    </div>
                  }
                  @if (selectedDetail().generatedResponse.promptVersion) {
                    <div class="kv-item">
                      <span>Prompt version</span>
                      <strong>{{ selectedDetail().generatedResponse.promptVersion }}</strong>
                    </div>
                  }
                  @if (selectedDetail().generatedResponse.modelName) {
                    <div class="kv-item">
                      <span>Model name</span>
                      <strong>{{ selectedDetail().generatedResponse.modelName }}</strong>
                    </div>
                  }
                </div>

                <div class="read-only-block">
                  <label>Generated response</label>
                  <textarea readonly rows="6">{{ selectedDetail().generatedResponse.generatedResponse }}</textarea>
                </div>

                @if (selectedDetail().generatedResponse.modelParameters) {
                  <details class="nested-details">
                    <summary>Model parameters</summary>
                    <div class="panel-body">
                      <div class="kv-grid compact-grid">
                        @for (entry of objectEntries(selectedDetail().generatedResponse.modelParameters ?? {}); track entry[0]) {
                          <div class="kv-item">
                            <span>{{ entry[0] }}</span>
                            <strong>{{ entry[1] }}</strong>
                          </div>
                        }
                      </div>
                    </div>
                  </details>
                }
              </div>
            </details>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [
    '.details-page { min-height: 100vh; padding: 28px; background: linear-gradient(180deg, #eef6ff 0%, #f8fafc 100%); font-family: Inter, "Segoe UI", sans-serif; color: #0f172a; }',
    '.details-shell { max-width: 1100px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08); padding: 24px; }',
    '.details-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 18px; }',
    '.header-copy { flex: 1; text-align: right; }',
    '.eyebrow { display: inline-block; margin-bottom: 6px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; }',
    '.details-header h1 { margin: 0; font-size: clamp(1.6rem, 2vw, 2.3rem); }',
    '.back-button { border: none; border-radius: 12px; background: #e2e8f0; color: #0f172a; padding: 0.8rem 1.1rem; font-weight: 700; cursor: pointer; }',
    '.detail-selector { display: flex; flex-direction: column; gap: 8px; max-width: 480px; margin-bottom: 20px; }',
    '.detail-selector label { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #475569; }',
    '.detail-selector select { width: 100%; border: 1px solid #cbd5e1; border-radius: 12px; background: #fff; padding: 0.9rem 1rem; font: inherit; color: #0f172a; }',
    '.detail-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px; }',
    '.detail-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }',
    '.badge { display: inline-flex; align-items: center; background: #dbeafe; color: #1d4ed8; border-radius: 999px; padding: 6px 10px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }',
    '.detail-header h2 { margin: 0; font-size: 1.3rem; color: #0f172a; }',
    '.meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 18px; }',
    '.meta-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; }',
    '.meta-label { font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }',
    '.meta-box strong { font-size: 0.98rem; }',
    '.accordion-list { display: flex; flex-direction: column; gap: 14px; }',
    'details { background: #ffffff; border: 1px solid #dfe7f1; border-radius: 14px; overflow: hidden; }',
    'summary { list-style: none; cursor: pointer; padding: 16px 18px; background: #eef2ff; font-weight: 700; color: #1e293b; }',
    'summary::-webkit-details-marker { display: none; }',
    '.panel-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 16px; }',
    '.two-column { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }',
    '.full-span { grid-column: 1 / -1; }',
    '.summary { margin: 0; color: #475569; line-height: 1.6; }',
    '.read-only-block { display: flex; flex-direction: column; gap: 8px; }',
    '.read-only-block label { font-size: 0.74rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }',
    '.read-only-block textarea { width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 10px; background: #f8fafc; padding: 12px 14px; color: #0f172a; resize: vertical; font: inherit; }',
    '.kv-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }',
    '.compact-grid { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }',
    '.kv-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }',
    '.kv-item span { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }',
    '.kv-item strong { font-size: 0.96rem; }',
    '.rule-reason { margin: 0; color: #334155; line-height: 1.6; }',
    '.table-wrap { overflow-x: auto; }',
    'table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #dfe7f1; border-radius: 12px; overflow: hidden; }',
    'th, td { border-bottom: 1px solid #e2e8f0; padding: 12px 14px; text-align: left; vertical-align: top; }',
    'th { background: #eef2ff; color: #1e293b; font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase; }',
    '.list-block { display: flex; flex-direction: column; gap: 10px; }',
    '.list-block h3 { margin: 0; font-size: 0.9rem; color: #1e293b; }',
    '.list-block ul, .list-block ol { margin: 0; padding-left: 20px; color: #334155; line-height: 1.8; }',
    '.nested-details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; }',
    '.nested-details summary { background: #f1f5f9; font-size: 0.9rem; }',
    '@media (max-width: 640px) { .details-page { padding: 18px; } .details-shell { padding: 16px; } .details-header { flex-direction: column; align-items: flex-start; } .header-copy { text-align: left; width: 100%; } .two-column { grid-template-columns: 1fr; } }',
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

  protected readonly objectEntries = <T extends object>(source: T): [string, string | number | boolean][] =>
    Object.entries(source as Record<string, unknown>).map(([key, value]) => [key, String(value) as string]);

  protected goBack(): void {
    this.router.navigate(['/conversation', this.conversationId()]);
  }

  private getVisibleEntriesForChat(chatId: string): DetailEntry[] {
    const entriesByChat: Record<string, DetailEntry[]> = {
      'conv-101': [
        {
          messageId: 'message-1',
          messageTitle: 'A múlt héten vásárolt fejhallgatóm hibásan működik. Szeretném visszakapni a pénzem.',
          originalMessage: 'A múlt héten vásárolt fejhallgatóm elromlott. Szeretném visszakapni a pénzem.',
          processingRunId: 501,
          configurationName: 'Refund policy template',
          configurationType: 'template',
          summary: 'A felhasználó fejhallgató meghibásodására hivatkozva pénzvisszatérítést kér.',
          preprocessing: {
            cleanedText: 'A múlt héten vásárolt fejhallgatóm elromlott.',
            caseType: 'RefundRequest',
            structuredCaseState: {
              product: 'Fejhallgató',
              issue: 'Defective',
              requestedAction: 'Refund',
            },
          },
          rules: {
            decision: 'Approved',
            reason: 'A termék hibás és a vásárló a teljes összeg visszatérítésére jogosult.',
            ruleSetVersion: 'refund-v3.2',
            matchedRules: [
              { code: 'REF-101', matched: true, reason: 'A termék hibásnak minősül.' },
              { code: 'REF-204', matched: true, reason: 'A visszatérítés kérelme teljes mértékben érvényes.' },
              { code: 'PRV-011', matched: true, reason: 'Személyes adatok eltávolítása megtörtént.' },
            ],
          },
          responsePlan: {
            decision: 'Issue refund',
            reason: 'A kártyás fizetéshez igazított, dokumentált hiba miatt a visszatérítés folytatható.',
            requiredElements: ['Hiba leírása', 'Vásárlás dátuma', 'Termék azonosító', 'Fizetési adatok'],
            responseStructure: ['Bevezetés', 'A hiba összefoglalása', 'A visszatérítés jogosságának magyarázata', 'Következő lépések'],
            sources: ['Receiptt', 'Termék garancia', 'Vásárlói nyilatkozat'],
          },
          generatedResponse: {
            generationMode: 'template',
            generatedResponse: 'Kedves Vásárló, a bejelentett hibát ellenőriztük. A termék hibásnak minősült, ezért a teljes összeg visszatérítésére jogosult. A következő lépésekben elküldjük a visszatérítési végrehajtás részleteit.',
            templateVersion: 'customer-refund-v2',
            processingTime: '480 ms',
          },
        },
      ],
      'conv-102': [
        {
          messageId: 'message-3',
          messageTitle: 'A számlakivonatom nem mutatja a teljes kamatösszeget.',
          originalMessage: 'A számlakivonatom nem mutatja a teljes kamatösszeget.',
          processingRunId: 502,
          configurationName: 'LLM compliance review',
          configurationType: 'llm',
          summary: 'A felhasználó a számlakivonat kamatadatai között eltérést észlel.',
          preprocessing: {
            cleanedText: 'A számlakivonatból hiányzik a teljes kamatösszeg.',
            caseType: 'BillingDiscrepancy',
            structuredCaseState: {
              product: 'Számlakivonat',
              issue: 'Missing interest',
              requestedAction: 'Clarification',
            },
          },
          rules: {
            decision: 'Needs review',
            reason: 'A hiányzó kamatérték ellenőrzése szükséges a banki tranzakciók és letéti adatok között.',
            ruleSetVersion: 'billing-v5.1',
            matchedRules: [
              { code: 'BILL-202', matched: true, reason: 'A számlakivonat hiányos lehet.' },
              { code: 'BILL-305', matched: false, reason: 'Nincs azonnali pénzügyi kockázat.' },
              { code: 'PRV-015', matched: true, reason: 'Személyes adat elkülönítés végrehajtva.' },
            ],
          },
          responsePlan: {
            decision: 'Investigate account entries',
            reason: 'A kamatérték ellenőrzéséhez a banki tranzakciók összehasonlítása szükséges.',
            requiredElements: ['Tranzakciók', 'Kamatkalkuláció', 'Számlatörténet', 'Jóváírások'],
            responseStructure: ['A probléma összefoglalása', 'Állapotértékelés', 'További ellenőrzés', 'Megoldási javaslat'],
            sources: ['Banki kivonat', 'Számlatörténet', 'Fizetési nyilvántartás'],
          },
          generatedResponse: {
            generationMode: 'llm',
            generatedResponse: 'A számlakivonat alapján a kamatérték hiányzik. A következő lépésben a banki tranzakciók összevetését végezzük el, hogy pontosan azonosítsuk a hiányzó összeget.',
            promptVersion: 'billing-audit-v4',
            modelName: 'gpt-4.1-mini',
            modelParameters: {
              temperature: 0.2,
              maxTokens: 800,
              topP: 0.9,
              responseFormat: 'plain-text',
            },
            processingTime: '1.1 s',
          },
        },
      ],
      'conv-103': [
        {
          messageId: 'message-5',
          messageTitle: 'Kérném a termék cseréjét és a visszatérítést.',
          originalMessage: 'Kérném a termék cseréjét és a visszatérítést.',
          processingRunId: 503,
          configurationName: 'Exchange and refund policy',
          configurationType: 'template',
          summary: 'A felhasználó termékcsere és pénzvisszatérítés iránti kérelmet nyújt be.',
          preprocessing: {
            cleanedText: 'Termékcsere és pénzvisszatérítés kérés.',
            caseType: 'ReturnAndExchangeRequest',
            structuredCaseState: {
              product: 'Termék',
              issue: 'Replacement and refund',
              requestedAction: 'Exchange or refund',
            },
          },
          rules: {
            decision: 'Partial approval',
            reason: 'A cserére vonatkozó kérelem elfogadható, a teljes refund pedig a feltételek függvényében értékelendő.',
            ruleSetVersion: 'returns-v4.0',
            matchedRules: [
              { code: 'RET-110', matched: true, reason: 'A csere kérelem érvényes.' },
              { code: 'RET-221', matched: true, reason: 'A refund feltételei részben teljesülnek.' },
              { code: 'PRV-009', matched: true, reason: 'Személyes adatokat kizártuk a feldolgozásból.' },
            ],
          },
          responsePlan: {
            decision: 'Offer exchange with review',
            reason: 'A csere prioritása magasabb, mint a teljes refund, de a végső döntéshez a termék állapota szükséges.',
            requiredElements: ['Termék állapota', 'Garancia adatok', 'Vásárlás dátuma', 'Pénzvisszatérítés lehetősége'],
            responseStructure: ['A kérelem összefoglalása', 'Csere lehetősége', 'Refund értékelés', 'Végső döntés'],
            sources: ['Visszaküldési feltételek', 'Garancia adatok', 'Vásárlói profil'],
          },
          generatedResponse: {
            generationMode: 'template',
            generatedResponse: 'A kérelmet elfogadtuk. Először a termék cseréjének lehetőségét vizsgáljuk meg, és a visszatérítésre vonatkozó döntést a termékállapot és a határidő alapján fogjuk meghozni.',
            templateVersion: 'exchange-review-v1',
            processingTime: '620 ms',
          },
        },
      ],
    };

    return entriesByChat[chatId] ?? entriesByChat['conv-101'];
  }
}

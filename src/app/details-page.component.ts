import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, catchError, switchMap, takeWhile, timer } from 'rxjs';
import { BankName, ConversationResponse, ProcessingResultResponse } from './api.models';
import { ConfigurationService } from './configuration.service';
import { ConversationService } from './conversation.service';

@Component({
  selector: 'app-details-page',
  standalone: true,
  template: `
    <main class="details-page">
      <section class="details-shell">
        <header class="details-header">
          <button type="button" class="back-button" (click)="goBack()">Back to conversation</button>
          <div class="header-copy">
            <span class="eyebrow">Processing details · #{{ processingId() ?? '—' }}</span>
            <h1>{{ conversation()?.title ?? 'Conversation details' }}</h1>
          </div>
        </header>

        @if (errorMessage()) {
          <p class="error-message" role="alert">{{ errorMessage() }}</p>
        }
        @if (loading()) {
          <p class="status-message">Loading processing result…</p>
        } @else if (result(); as processing) {
          <div class="detail-card">
            <div class="meta-grid">
              <div class="meta-box"><span>Status</span><strong>{{ processing.status ?? '—' }}</strong></div>
              <div class="meta-box"><span>Created</span><strong>{{ formatDate(processing.createdAt) }}</strong></div>
              <div class="meta-box"><span>Started</span><strong>{{ formatDate(processing.startedAt) }}</strong></div>
              <div class="meta-box"><span>Finished</span><strong>{{ formatDate(processing.finishedAt) }}</strong></div>
              <div class="meta-box"><span>Finished</span><strong>{{ processing.isFinished ? 'Yes' : 'No' }}</strong></div>
              <div class="meta-box"><span>Results available</span><strong>{{ processing.resultsAvailable ? 'Yes' : 'No' }}</strong></div>
              <div class="meta-box"><span>Bank</span><strong>{{ bankLabel(configurationBank()) }}</strong></div>
            </div>

            @if (processing.availabilityMessage) {
              <p class="status-message">{{ processing.availabilityMessage }}</p>
            }
            @if (!processing.isFinished) {
              <p class="status-message">Processing is still underway. This page checks for updates automatically.</p>
            }
            @if (processing.error) {
              <div class="processing-error" role="alert">
                <strong>{{ processing.error.type ?? 'Processing error' }}</strong>
                <p>{{ processing.error.message ?? 'No error description was provided.' }}</p>
              </div>
            }

            @if (processing.results?.preProcessing; as preprocessing) {
              <details open>
                <summary>1. Preprocessing</summary>
                <div class="panel-body two-column">
                  <div class="read-only-block">
                    <label>Cleaned text</label>
                    <textarea readonly rows="4">{{ preprocessing.cleanedText ?? '—' }}</textarea>
                  </div>
                  <div class="read-only-block">
                    <label>Case type</label>
                    <textarea readonly rows="2">{{ preprocessing.caseType ?? '—' }}</textarea>
                  </div>
                  @if (preprocessing.structuredCaseStateJson) {
                    <div class="read-only-block full-span">
                      <label>Structured case state</label>
                      <pre>{{ formatJson(preprocessing.structuredCaseStateJson) }}</pre>
                    </div>
                  }
                </div>
              </details>
            }

            @if (processing.results?.ruleDecision; as rules) {
              <details open>
                <summary>2. Rule decision</summary>
                <div class="panel-body">
                  <div class="meta-grid">
                    <div class="meta-box"><span>Decision</span><strong>{{ rules.decision ?? '—' }}</strong></div>
                    <div class="meta-box"><span>Rule set version</span><strong>{{ rules.ruleSetVersion ?? '—' }}</strong></div>
                  </div>
                  @if (rules.reason) {
                    <p>{{ rules.reason }}</p>
                  }
                  @if (rules.matchedRules?.length) {
                    <div class="table-wrap">
                      <table>
                        <thead><tr><th>Matched</th><th>Priority score</th><th>Reason</th><th>Source</th><th>Effective from</th><th>Result</th></tr></thead>
                        <tbody>
                          @for (rule of rules.matchedRules; track $index) {
                            <tr>
                              <td>{{ rule.matched ? 'Yes' : 'No' }}</td>
                              <td>{{ rule.prioScore }}</td>
                              <td>{{ rule.reason ?? '—' }}</td>
                              <td>{{ rule.source ?? '—' }}</td>
                              <td>{{ rule.effectiveFrom ?? '—' }}</td>
                              <td><pre>{{ rule.resultJson ? formatJson(rule.resultJson) : '—' }}</pre></td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }
                </div>
              </details>
            }

            @if (processing.results?.responsePlan; as plan) {
              <details open>
                <summary>3. Response plan</summary>
                <div class="panel-body">
                  <div class="meta-grid">
                    <div class="meta-box"><span>Decision</span><strong>{{ plan.decision ?? '—' }}</strong></div>
                    <div class="meta-box"><span>Reason</span><strong>{{ plan.reason ?? '—' }}</strong></div>
                  </div>
                  @if (plan.requiredElementsJson) {
                    <div class="read-only-block"><label>Required elements</label><pre>{{ formatJson(plan.requiredElementsJson) }}</pre></div>
                  }
                  @if (plan.responseStructureJson) {
                    <div class="read-only-block"><label>Response structure</label><pre>{{ formatJson(plan.responseStructureJson) }}</pre></div>
                  }
                  @if (plan.sourcesJson) {
                    <div class="read-only-block"><label>Sources</label><pre>{{ formatJson(plan.sourcesJson) }}</pre></div>
                  }
                </div>
              </details>
            }

            @if (processing.results?.response; as response) {
              <details open>
                <summary>4. Generated response</summary>
                <div class="panel-body">
                  <div class="meta-grid">
                    <div class="meta-box"><span>Generation mode</span><strong>{{ response.generationMode ?? '—' }}</strong></div>
                    <div class="meta-box"><span>Processing time</span><strong>{{ response.processingTimeMs }} ms</strong></div>
                    @if (response.templateVersion) {
                      <div class="meta-box"><span>Template version</span><strong>{{ response.templateVersion }}</strong></div>
                    }
                    @if (response.promptVersion) {
                      <div class="meta-box"><span>Prompt version</span><strong>{{ response.promptVersion }}</strong></div>
                    }
                    @if (response.modelName) {
                      <div class="meta-box"><span>Model name</span><strong>{{ response.modelName }}</strong></div>
                    }
                  </div>
                  <div class="read-only-block">
                    <label>Generated response</label>
                    <textarea readonly rows="6">{{ response.text ?? 'No response text available.' }}</textarea>
                  </div>
                </div>
              </details>
            }

            @if (processing.results?.evaluationResults?.length) {
              <details open>
                <summary>5. Evaluation results</summary>
                <div class="panel-body table-wrap">
                  <table>
                    <thead><tr><th>Metric</th><th>Score</th><th>Unit</th><th>Comment</th></tr></thead>
                    <tbody>
                      @for (evaluation of processing.results?.evaluationResults ?? []; track $index) {
                        <tr>
                          <td>{{ evaluation.metric ?? '—' }}</td>
                          <td>{{ evaluation.score }}</td>
                          <td>{{ evaluation.unit ?? '—' }}</td>
                          <td>{{ evaluation.comment ?? '—' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </details>
            }

            @if (!processing.resultsAvailable || !processing.results) {
              <p class="status-message">
                {{ processing.availabilityMessage ?? 'No processing artifacts are available yet.' }}
              </p>
            }
          </div>
        }
      </section>
    </main>
  `,
  styles: [
    '.details-page { min-height: 100vh; padding: 28px; background: linear-gradient(180deg, #eef6ff 0%, #f8fafc 100%); font-family: Inter, "Segoe UI", sans-serif; color: #0f172a; }',
    '.details-shell { max-width: 1100px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08); padding: 24px; }',
    '.details-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 18px; }',
    '.header-copy { flex: 1; text-align: right; }',
    '.eyebrow { display: inline-block; margin-bottom: 6px; font-size: .72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #64748b; }',
    '.details-header h1 { margin: 0; font-size: clamp(1.6rem, 2vw, 2.3rem); }',
    '.back-button { border: 0; border-radius: 12px; background: #e2e8f0; color: #0f172a; padding: .8rem 1.1rem; font: inherit; font-weight: 700; cursor: pointer; }',
    '.detail-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px; display: flex; flex-direction: column; gap: 14px; }',
    '.meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; }',
    '.meta-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; overflow-wrap: anywhere; }',
    '.meta-box span, .read-only-block label { font-size: .72rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }',
    'details { background: #fff; border: 1px solid #dfe7f1; border-radius: 14px; overflow: hidden; }',
    'summary { cursor: pointer; padding: 16px 18px; background: #eef2ff; font-weight: 700; color: #1e293b; }',
    '.panel-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 14px; }',
    '.two-column { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }',
    '.full-span { grid-column: 1 / -1; }',
    '.read-only-block { display: flex; flex-direction: column; gap: 8px; min-width: 0; }',
    '.read-only-block textarea { width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 10px; background: #f8fafc; padding: 12px 14px; color: #0f172a; resize: vertical; font: inherit; }',
    'pre { margin: 0; padding: 12px; border-radius: 10px; background: #f8fafc; white-space: pre-wrap; overflow-wrap: anywhere; font: .9rem/1.5 ui-monospace, monospace; }',
    '.table-wrap { overflow-x: auto; }',
    'table { width: 100%; border-collapse: collapse; background: #fff; }',
    'th, td { border-bottom: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; vertical-align: top; }',
    'th { background: #eef2ff; font-size: .72rem; text-transform: uppercase; }',
    '.status-message { color: #475569; line-height: 1.5; }',
    '.error-message, .processing-error { color: #b91c1c; line-height: 1.5; }',
    '.processing-error { border: 1px solid #fecaca; border-radius: 12px; padding: 14px; background: #fef2f2; }',
    '.processing-error p { margin: 4px 0 0; }',
    '@media (max-width: 640px) { .details-page { padding: 18px; } .details-shell { padding: 16px; } .details-header { flex-direction: column; align-items: flex-start; } .header-copy { text-align: left; width: 100%; } .two-column { grid-template-columns: 1fr; } .full-span { grid-column: auto; } }',
  ],
})
export class DetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly configurationService = inject(ConfigurationService);
  private readonly conversationService = inject(ConversationService);

  protected readonly conversationId = signal<number | null>(null);
  protected readonly processingId = signal<number | null>(null);
  protected readonly conversation = signal<ConversationResponse | null>(null);
  protected readonly configurationBank = signal<BankName | null>(null);
  protected readonly result = signal<ProcessingResultResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const conversationId = Number(params.get('conversationId'));
          const processingId = Number(params.get('processingId'));
          if (
            !Number.isInteger(conversationId) ||
            conversationId < 1 ||
            !Number.isInteger(processingId) ||
            processingId < 1
          ) {
            this.loading.set(false);
            this.errorMessage.set('The conversation or processing ID is invalid.');
            return EMPTY;
          }

          this.conversationId.set(conversationId);
          this.processingId.set(processingId);
          this.result.set(null);
          this.configurationBank.set(null);
          this.loading.set(true);
          this.errorMessage.set(null);
          this.loadConversationTitle(conversationId);
          this.loadConfigurationBank(conversationId, processingId);
          return timer(0, 1500).pipe(
            switchMap(() => this.conversationService.getProcessingResult(processingId)),
            takeWhile((result, index) => !result.isFinished && index < 59, true),
            catchError((error: unknown) => {
              this.loading.set(false);
              this.errorMessage.set(ConfigurationService.getErrorMessage(error));
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
  }

  protected goBack(): void {
    const conversationId = this.conversationId();
    if (conversationId) {
      this.router.navigate(['/conversation', conversationId]);
    } else {
      this.router.navigate(['/']);
    }
  }

  protected formatDate(value: string | null): string {
    if (!value) {
      return '—';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  protected bankLabel(bank: BankName | null): string {
    return bank === 'otp' ? 'OTP' : bank === 'raiffeisen' ? 'Raiffeisen' : '—';
  }

  protected formatJson(value: string): string {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return value;
      }
      throw error;
    }
  }

  private loadConversationTitle(id: number): void {
    this.conversationService
      .getConversation(id)
      .pipe(
        catchError((error: unknown) => {
          this.errorMessage.set(ConfigurationService.getErrorMessage(error));
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((conversation) => this.conversation.set(conversation));
  }

  private loadConfigurationBank(conversationId: number, processingId: number): void {
    this.conversationService
      .getConversationMessages(conversationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (messages) => {
          const exchange = messages.messages?.find(
            (message) => message.processingId === processingId,
          );
          const configurationId = exchange?.configurationId ?? exchange?.request?.configurationId;
          if (!configurationId) {
            return;
          }

          this.configurationService
            .getConfiguration(configurationId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (configuration) => this.configurationBank.set(configuration.bank ?? null),
              error: (error: unknown) =>
                this.errorMessage.set(ConfigurationService.getErrorMessage(error)),
            });
        },
        error: (error: unknown) =>
          this.errorMessage.set(ConfigurationService.getErrorMessage(error)),
      });
  }
}

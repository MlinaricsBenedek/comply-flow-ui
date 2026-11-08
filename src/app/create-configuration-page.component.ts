import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfigurationService } from './configuration.service';
import { JsonObject, RequestLlmConfiguration, RequestTemplateConfiguration } from './api.models';

@Component({
  selector: 'app-create-configuration-page',
  imports: [RouterLink],
  template: `
    <main class="create-config-page">
      <section class="create-config-shell">
        <header class="page-header">
          <div>
            <p class="eyebrow">Create</p>
            <h1>New configuration</h1>
          </div>
          <button type="button" class="secondary-button" [routerLink]="['/configurations']">Back to list</button>
        </header>

        <div class="form-card">
          <div class="type-toggle">
            <button type="button" class="toggle-button" [class.active]="selectedType() === 'template'" (click)="selectedType.set('template')">Template</button>
            <button type="button" class="toggle-button" [class.active]="selectedType() === 'llm'" (click)="selectedType.set('llm')">LLM</button>
          </div>

          <div class="field-grid">
            <label class="field-group">
              <span>Name</span>
              <input type="text" maxlength="100" [value]="name()" (input)="name.set($any($event.target).value)" placeholder="Template Configuration" />
            </label>

            <label class="field-group">
              <span>Rule set version</span>
              <input type="text" maxlength="50" [value]="ruleSetVersion()" (input)="ruleSetVersion.set($any($event.target).value)" placeholder="1.0" />
            </label>

            @if (selectedType() === 'template') {
              <label class="field-group">
                <span>Template version</span>
                <input type="text" maxlength="50" [value]="templateVersion()" (input)="templateVersion.set($any($event.target).value)" placeholder="1.0" />
              </label>
            }

            @if (selectedType() === 'llm') {
              <label class="field-group">
                <span>Prompt version</span>
                <input type="text" maxlength="50" [value]="promptVersion()" (input)="promptVersion.set($any($event.target).value)" placeholder="2.0" />
              </label>

              <label class="field-group">
                <span>Model</span>
                <select [value]="modelName()" (change)="modelName.set($any($event.target).value)">
                  @for (model of modelOptions; track model.id) {
                    <option [value]="model.id">{{ model.id }} — {{ model.name }}</option>
                  }
                </select>
                <small>{{ selectedModelDescription() }}</small>
              </label>

              <label class="field-group">
                <span>Temperature</span>
                <input type="number" min="0" max="2" step="0.1" [value]="temperature()" (input)="temperature.set(+($any($event.target).value || 0))" />
              </label>

              <label class="field-group">
                <span>Max new tokens</span>
                <input type="number" min="1" step="1" [value]="maxNewTokens()" (input)="maxNewTokens.set(+($any($event.target).value || 0))" />
              </label>

              <label class="field-group">
                <span>Top P</span>
                <input type="number" min="0" max="1" step="0.1" [value]="topP()" (input)="topP.set(+($any($event.target).value || 0))" />
              </label>

              <label class="field-group checkbox-field">
                <span>Do sample</span>
                <input type="checkbox" [checked]="doSample()" (change)="doSample.set($any($event.target).checked)" />
              </label>
            }
          </div>

          @if (errorMessage()) {
            <p class="error-message" role="alert">{{ errorMessage() }}</p>
          }

          <div class="actions">
            <button type="button" class="secondary-button" [routerLink]="['/configurations']">Cancel</button>
            <button type="button" class="primary-button" (click)="saveConfiguration()" [disabled]="!canSave() || isSaving()">
              {{ isSaving() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [
    '.create-config-page { min-height: 100vh; padding: 28px; background: linear-gradient(180deg, #eef6ff 0%, #f8fafc 100%); font-family: Inter, "Segoe UI", sans-serif; color: #0f172a; }',
    '.create-config-shell { max-width: 900px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08); padding: 24px; }',
    '.page-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }',
    '.eyebrow { margin: 0 0 6px; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; color: #64748b; }',
    'h1 { margin: 0; font-size: clamp(1.8rem, 2vw, 2.3rem); }',
    '.form-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 20px; }',
    '.type-toggle { display: inline-flex; gap: 8px; background: #e2e8f0; border-radius: 12px; padding: 6px; margin-bottom: 18px; }',
    '.toggle-button { border: none; background: transparent; color: #475569; border-radius: 10px; padding: 0.7rem 1.1rem; font: inherit; font-weight: 700; cursor: pointer; }',
    '.toggle-button.active { background: #fff; color: #0f172a; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08); }',
    '.field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }',
    '.field-group { display: flex; flex-direction: column; gap: 8px; }',
    '.field-group span { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #475569; }',
    '.field-group input, .field-group select { width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 12px; padding: 0.8rem 0.9rem; font: inherit; }',
    '.field-group small { color: #64748b; line-height: 1.4; }',
    '.field-group.checkbox-field { flex-direction: row; align-items: center; justify-content: space-between; }',
    '.field-group.checkbox-field input { width: 1.1rem; height: 1.1rem; accent-color: #2563eb; }',
    '.actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 22px; }',
    '.primary-button, .secondary-button { border: none; border-radius: 12px; padding: 0.82rem 1.1rem; font: inherit; font-weight: 700; cursor: pointer; }',
    '.primary-button { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #fff; }',
    '.primary-button:disabled { opacity: 0.5; cursor: not-allowed; }',
    '.secondary-button { background: #e2e8f0; color: #0f172a; }',
    '.error-message { margin: 16px 0 0; color: #b91c1c; font-weight: 600; }',
    '@media (max-width: 640px) { .page-header { flex-direction: column; align-items: flex-start; } .actions { flex-direction: column; } .actions .primary-button, .actions .secondary-button { width: 100%; } }',
  ],
})
export class CreateConfigurationPageComponent {
  private readonly router = inject(Router);
  private readonly configurationService = inject(ConfigurationService);

  protected readonly modelOptions = [
    {
      id: 'qwen2.5-0.5b-instruct',
      name: 'Qwen/Qwen2.5-0.5B-Instruct',
      description: 'Alapértelmezett válaszgeneráló modell',
    },
    {
      id: 'qwen2-0.5b-instruct',
      name: 'Qwen/Qwen2-0.5B-Instruct',
      description: 'Válaszgenerálás',
    },
    {
      id: 'llama-tiny-1.1b-chat',
      name: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
      description: 'Válaszgenerálás',
    },
    {
      id: 'llama-3.2-1b-instruct',
      name: 'meta-llama/Llama-3.2-1B-Instruct',
      description: 'Válaszgenerálás',
    },
  ];
  protected readonly selectedType = signal<'template' | 'llm'>('template');
  protected readonly name = signal('');
  protected readonly ruleSetVersion = signal('1.0');
  protected readonly templateVersion = signal('1.0');
  protected readonly promptVersion = signal('2.0');
  protected readonly modelName = signal(this.modelOptions[0].id);
  protected readonly selectedModelDescription = computed(
    () => this.modelOptions.find((model) => model.id === this.modelName())?.description ?? '',
  );
  protected readonly temperature = signal(0.7);
  protected readonly maxNewTokens = signal(180);
  protected readonly doSample = signal(true);
  protected readonly topP = signal(0.9);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canSave = computed(() => {
    const validVersion = (value: string, maxLength: number) =>
      value.trim().length > 0 && value.trim().length <= maxLength;
    return (
      validVersion(this.name(), 100) &&
      validVersion(this.ruleSetVersion(), 50) &&
      (this.selectedType() === 'template'
        ? validVersion(this.templateVersion(), 50)
        : validVersion(this.promptVersion(), 50) && validVersion(this.modelName(), 100))
    );
  });

  protected saveConfiguration(): void {
    if (!this.canSave() || this.isSaving()) {
      return;
    }

    this.errorMessage.set(null);
    this.isSaving.set(true);

    if (this.selectedType() === 'template') {
      const request: RequestTemplateConfiguration = {
        name: this.name().trim(),
        ruleSetVersion: this.ruleSetVersion().trim(),
        templateVersion: this.templateVersion().trim(),
      };
      this.configurationService.createTemplateConfiguration(request).subscribe({
        next: (config) => this.finishSave(config.id),
        error: (error: unknown) => this.handleSaveError(error),
      });
      return;
    }

    const modelParameters: JsonObject = {
      max_new_tokens: this.maxNewTokens(),
      do_sample: this.doSample(),
      temperature: this.temperature(),
      top_p: this.topP(),
    };
    const request: RequestLlmConfiguration = {
      name: this.name().trim(),
      ruleSetVersion: this.ruleSetVersion().trim(),
      promptVersion: this.promptVersion().trim(),
      modelName: this.modelName().trim(),
      modelParameters,
    };
    this.configurationService.createLlmConfiguration(request).subscribe({
      next: (config) => this.finishSave(config.id),
      error: (error: unknown) => this.handleSaveError(error),
    });
  }

  private finishSave(id: number): void {
    this.isSaving.set(false);
    this.router.navigate(['/configurations', id]);
  }

  private handleSaveError(error: unknown): void {
    this.isSaving.set(false);
    this.errorMessage.set(ConfigurationService.getErrorMessage(error));
  }
}

import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfigurationItem, ConfigurationService, ConfigurationType } from './configuration.service';

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
              <input type="text" [value]="name()" (input)="name.set($any($event.target).value)" placeholder="Template Configuration" />
            </label>

            <label class="field-group">
              <span>Rule set version</span>
              <input type="text" [value]="ruleSetVersion()" (input)="ruleSetVersion.set($any($event.target).value)" placeholder="1.0" />
            </label>

            @if (selectedType() === 'template') {
              <label class="field-group">
                <span>Template version</span>
                <input type="text" [value]="templateVersion()" (input)="templateVersion.set($any($event.target).value)" placeholder="1.0" />
              </label>
            }

            @if (selectedType() === 'llm') {
              <label class="field-group">
                <span>Prompt version</span>
                <input type="text" [value]="promptVersion()" (input)="promptVersion.set($any($event.target).value)" placeholder="2.0" />
              </label>

              <label class="field-group">
                <span>Model name</span>
                <input type="text" [value]="modelName()" (input)="modelName.set($any($event.target).value)" placeholder="Llama-3" />
              </label>

              <label class="field-group">
                <span>Temperature</span>
                <input type="number" step="0.1" [value]="temperature()" (input)="temperature.set(+($any($event.target).value || 0))" />
              </label>

              <label class="field-group">
                <span>Max tokens</span>
                <input type="number" step="10" [value]="maxTokens()" (input)="maxTokens.set(+($any($event.target).value || 0))" />
              </label>
            }
          </div>

          <div class="actions">
            <button type="button" class="secondary-button" [routerLink]="['/configurations']">Cancel</button>
            <button type="button" class="primary-button" (click)="saveConfiguration()" [disabled]="!canSave()">Save</button>
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
    '.field-group input { width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 12px; padding: 0.8rem 0.9rem; font: inherit; }',
    '.actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 22px; }',
    '.primary-button, .secondary-button { border: none; border-radius: 12px; padding: 0.82rem 1.1rem; font: inherit; font-weight: 700; cursor: pointer; }',
    '.primary-button { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #fff; }',
    '.primary-button:disabled { opacity: 0.5; cursor: not-allowed; }',
    '.secondary-button { background: #e2e8f0; color: #0f172a; }',
    '@media (max-width: 640px) { .page-header { flex-direction: column; align-items: flex-start; } .actions { flex-direction: column; } .actions .primary-button, .actions .secondary-button { width: 100%; } }',
  ],
})
export class CreateConfigurationPageComponent {
  private readonly router = inject(Router);
  private readonly configurationService = inject(ConfigurationService);

  protected readonly selectedType = signal<'template' | 'llm'>('template');
  protected readonly name = signal('');
  protected readonly ruleSetVersion = signal('1.0');
  protected readonly templateVersion = signal('1.0');
  protected readonly promptVersion = signal('2.0');
  protected readonly modelName = signal('Llama-3');
  protected readonly temperature = signal(0.2);
  protected readonly maxTokens = signal(500);

  protected readonly canSave = signal(false);

  protected saveConfiguration(): void {
    const configName = this.name().trim();
    const ruleSet = this.ruleSetVersion().trim();

    if (!configName || !ruleSet) {
      return;
    }

    const config: ConfigurationItem = {
      id: Date.now(),
      name: configName,
      type: this.selectedType() === 'llm' ? 'LLM' : 'Template',
      ruleSetVersion: ruleSet,
      generationMode: this.selectedType(),
      ...(this.selectedType() === 'template'
        ? { templateVersion: this.templateVersion().trim() || '1.0' }
        : {
            promptVersion: this.promptVersion().trim() || '2.0',
            modelName: this.modelName().trim() || 'Llama-3',
            modelParameters: {
              temperature: this.temperature(),
              maxTokens: this.maxTokens(),
            },
          }),
    };

    this.configurationService.addConfiguration(config);
    this.router.navigate(['/configurations', config.id]);
  }
}

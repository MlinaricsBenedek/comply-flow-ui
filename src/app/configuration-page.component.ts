import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfigurationItem, ConfigurationService } from './configuration.service';

@Component({
  selector: 'app-configuration-page',
  imports: [RouterLink],
  template: `
    <main class="config-page">
      <section class="config-shell">
        <header class="topbar">
          <div>
            <p class="eyebrow">Configuration</p>
            <h1>Configurations</h1>
          </div>

          <div class="topbar-actions">
            <button type="button" class="secondary-button" [routerLink]="['/']">Back home</button>
            <button type="button" class="primary-button" (click)="openCreatePage()">+ Add Configuration</button>
          </div>
        </header>

        <div class="content-grid">
          <aside class="list-panel">
            <div class="panel-header">
              <h2>Available configurations</h2>
              <span class="count-pill">{{ configurations().length }}</span>
            </div>

            @for (config of configurations(); track config.id) {
              <button
                type="button"
                class="config-card"
                [class.active]="selectedId() === config.id"
                (click)="openConfig(config.id)"
              >
                <div class="card-header">
                  <span class="type-badge type-{{ config.type.toLowerCase() }}">{{ config.type }}</span>
                </div>
                <h3>{{ config.name }}</h3>
                <p>{{ config.ruleSetVersion }}</p>
              </button>
            }
          </aside>

          <section class="details-panel">
            <div class="detail-card">
              <div class="detail-header">
                <div>
                  <p class="eyebrow">Selected configuration</p>
                  <h2>{{ selectedConfiguration().name }}</h2>
                </div>
                <span class="type-badge type-{{ selectedConfiguration().type.toLowerCase() }}">{{ selectedConfiguration().type }}</span>
              </div>

              <div class="meta-grid">
                <div class="meta-item">
                  <span>Name</span>
                  <strong>{{ selectedConfiguration().name }}</strong>
                </div>
                <div class="meta-item">
                  <span>Rule set version</span>
                  <strong>{{ selectedConfiguration().ruleSetVersion }}</strong>
                </div>
                <div class="meta-item">
                  <span>Generation mode</span>
                  <strong>{{ selectedConfiguration().generationMode ?? 'template' }}</strong>
                </div>
                @if (selectedConfiguration().templateVersion) {
                  <div class="meta-item">
                    <span>Template version</span>
                    <strong>{{ selectedConfiguration().templateVersion }}</strong>
                  </div>
                }
                @if (selectedConfiguration().promptVersion) {
                  <div class="meta-item">
                    <span>Prompt version</span>
                    <strong>{{ selectedConfiguration().promptVersion }}</strong>
                  </div>
                }
                @if (selectedConfiguration().modelName) {
                  <div class="meta-item">
                    <span>Model name</span>
                    <strong>{{ selectedConfiguration().modelName }}</strong>
                  </div>
                }
              </div>

              @if (selectedConfiguration().modelParameters) {
                <div class="parameter-box">
                  <h3>Model parameters</h3>
                  <div class="parameter-grid">
                    @for (entry of objectEntries(selectedConfiguration().modelParameters ?? {}); track entry[0]) {
                      <div class="parameter-item">
                        <span>{{ entry[0] }}</span>
                        <strong>{{ entry[1] }}</strong>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </section>
        </div>
      </section>
    </main>
  `,
  styles: [
    '.config-page { min-height: 100vh; padding: 28px; background: linear-gradient(180deg, #eef6ff 0%, #f8fafc 100%); font-family: Inter, "Segoe UI", sans-serif; color: #0f172a; }',
    '.config-shell { max-width: 1200px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08); padding: 24px; }',
    '.topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }',
    '.eyebrow { margin: 0 0 6px; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; color: #64748b; }',
    'h1, h2, h3, p { margin: 0; }',
    'h1 { font-size: clamp(1.8rem, 2vw, 2.4rem); }',
    '.topbar-actions { display: flex; align-items: center; gap: 12px; }',
    '.primary-button, .secondary-button { border: none; border-radius: 12px; padding: 0.85rem 1.1rem; font: inherit; font-weight: 700; cursor: pointer; }',
    '.primary-button { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #fff; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2); }',
    '.secondary-button { background: #e2e8f0; color: #0f172a; }',
    '.content-grid { display: grid; grid-template-columns: minmax(260px, 360px) minmax(0, 1fr); gap: 20px; }',
    '.list-panel, .detail-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; }',
    '.panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }',
    '.count-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 38px; padding: 6px 10px; border-radius: 999px; background: #dbeafe; color: #1d4ed8; font-weight: 700; }',
    '.config-card { width: 100%; border: 1px solid #dfe7f1; background: #ffffff; border-radius: 14px; padding: 14px 14px 12px; margin-bottom: 12px; text-align: left; cursor: pointer; }',
    '.config-card.active { border-color: #60a5fa; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.12); }',
    '.card-header { display: flex; justify-content: flex-end; margin-bottom: 8px; }',
    '.type-badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 5px 10px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }',
    '.type-template { background: #dcfce7; color: #166534; }',
    '.type-llm { background: #ede9fe; color: #5b21b6; }',
    '.config-card h3 { font-size: 1.1rem; margin-bottom: 6px; }',
    '.config-card p { color: #64748b; }',
    '.detail-card { min-height: 420px; }',
    '.detail-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }',
    '.detail-header h2 { font-size: 1.6rem; }',
    '.meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 18px; }',
    '.meta-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; }',
    '.meta-item span { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; font-weight: 700; }',
    '.parameter-box { margin-top: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }',
    '.parameter-box h3 { margin-bottom: 12px; }',
    '.parameter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }',
    '.parameter-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }',
    '.parameter-item span { font-size: 0.7rem; letter-spacing: 0.05em; text-transform: uppercase; color: #64748b; font-weight: 700; }',
    '@media (max-width: 768px) { .content-grid { grid-template-columns: 1fr; } .topbar { flex-direction: column; align-items: flex-start; } .topbar-actions { width: 100%; } .topbar-actions .primary-button, .topbar-actions .secondary-button { flex: 1; } }',
  ],
})
export class ConfigurationPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly configurationService = inject(ConfigurationService);

  protected readonly configurations = this.configurationService.configurations;
  protected readonly selectedId = signal<number>(this.readSelectedId());

  protected readonly selectedConfiguration = computed<ConfigurationItem>(() => {
    return (
      this.configurations().find((config) => config.id === this.selectedId()) ??
      this.configurations()[0] ??
      {
        id: 0,
        name: 'No configuration selected',
        type: 'Template',
        ruleSetVersion: 'n/a',
        generationMode: 'template',
      }
    );
  });

  protected openConfig(id: number): void {
    this.selectedId.set(id);
    this.router.navigate(['/configurations', id]);
  }

  protected openCreatePage(): void {
    this.router.navigate(['/configurations/create']);
  }

  protected readonly objectEntries = (source: Record<string, number | string | boolean>): [string, string | number | boolean][] =>
    Object.entries(source).map(([key, value]) => [key, value]);

  private readSelectedId(): number {
    const idFromRoute = Number(this.route.snapshot.paramMap.get('id'));
    return Number.isFinite(idFromRoute) && idFromRoute > 0 ? idFromRoute : this.configurationService.configurations()[0]?.id ?? 0;
  }
}

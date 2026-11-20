import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ConfigurationPageComponent } from './configuration-page.component';
import { CreateConfigurationPageComponent } from './create-configuration-page.component';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([{ path: 'configurations/:id', component: CreateConfigurationPageComponent }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/conversations')
      .flush([
        {
          id: 1,
          title: 'Test conversation',
          status: 'Created',
          createdAt: '2026-10-26T00:00:00Z',
        },
      ]);
    return fixture;
  }

  it('should create the component', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render the app title and conversation list', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Comply Flow');
    expect(compiled.querySelectorAll('.conversation-card').length).toBeGreaterThan(0);
    expect(compiled.textContent).toContain('Configurations');
  });

  it('should show an Add chat button that opens the create conversation dialog', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const addChatButton = [...compiled.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Add chat'),
    );

    expect(addChatButton).toBeTruthy();
    addChatButton?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.modal-card h3')?.textContent).toContain('Create conversation');
  });

  it('should offer the supported prompt versions for LLM configurations', () => {
    const fixture = TestBed.createComponent(CreateConfigurationPageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const llmButton = [...compiled.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('LLM'),
    );

    llmButton?.click();
    fixture.detectChanges();

    const promptVersionSelect = [...compiled.querySelectorAll('label')].find((label) =>
      label.textContent?.includes('Prompt version'),
    )?.querySelector('select');

    expect([...(promptVersionSelect?.options ?? [])].map((option) => option.value)).toEqual([
      'v1.1',
      'v1.2',
      'v1.3',
      'v1.4',
    ]);
    expect(promptVersionSelect?.value).toBe('v1.1');
  });

  it('should offer only Qwen 2.5 1.5B for LLM configurations', () => {
    const fixture = TestBed.createComponent(CreateConfigurationPageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    [...compiled.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === 'LLM')
      ?.click();
    fixture.detectChanges();

    const modelSelect = [...compiled.querySelectorAll('label')]
      .find((label) => label.textContent?.includes('Model'))
      ?.querySelector('select');

    expect([...(modelSelect?.options ?? [])].map((option) => option.value)).toEqual([
      'qwen2.5-1.5b-instruct',
    ]);
    expect(modelSelect?.value).toBe('qwen2.5-1.5b-instruct');
  });

  it('should create a template configuration without a rule set version', () => {
    const fixture = TestBed.createComponent(CreateConfigurationPageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const bankSelect = [...compiled.querySelectorAll('label')]
      .find((label) => label.textContent?.includes('Bank'))
      ?.querySelector('select');
    const nameInput = [...compiled.querySelectorAll('label')]
      .find((label) => label.textContent?.includes('Name'))
      ?.querySelector('input');
    const templateVersionSelect = [...compiled.querySelectorAll('label')]
      .find((label) => label.textContent?.includes('Template version'))
      ?.querySelector('select');
    const saveButton = [...compiled.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === 'Save');

    expect(bankSelect?.value).toBe('otp');
    expect(compiled.textContent).not.toContain('Rule set version');
    expect([...(templateVersionSelect?.options ?? [])].map((option) => option.value)).toEqual([
      'template-v1',
      'template-v2',
    ]);
    expect(templateVersionSelect?.value).toBe('template-v1');
    if (!bankSelect || !nameInput || !templateVersionSelect || !saveButton) {
      throw new Error('Expected template configuration controls to be rendered.');
    }

    bankSelect.value = 'raiffeisen';
    bankSelect.dispatchEvent(new Event('change'));
    templateVersionSelect.value = 'template-v2';
    templateVersionSelect.dispatchEvent(new Event('change'));
    nameInput.value = 'Test configuration';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(saveButton.disabled).toBe(false);

    saveButton.click();

    const request = TestBed.inject(HttpTestingController).expectOne('/api/configurations/template');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Test configuration',
      templateVersion: 'template-v2',
      bank: 'raiffeisen',
    });
    request.flush({ id: 1, name: 'Test configuration', bank: 'raiffeisen' });
  });

  it('should send the selected bank with LLM configurations', () => {
    const fixture = TestBed.createComponent(CreateConfigurationPageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    [...compiled.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === 'LLM')
      ?.click();
    fixture.detectChanges();

    expect(compiled.textContent).not.toContain('Rule set version');
    expect(compiled.textContent).not.toContain('Do sample');
    const bankSelect = [...compiled.querySelectorAll('label')]
      .find((label) => label.textContent?.includes('Bank'))
      ?.querySelector('select');
    const nameInput = [...compiled.querySelectorAll('label')]
      .find((label) => label.textContent?.includes('Name'))
      ?.querySelector('input');
    if (!bankSelect || !nameInput) {
      throw new Error('Expected bank and name inputs to be rendered.');
    }

    bankSelect.value = 'raiffeisen';
    bankSelect.dispatchEvent(new Event('change'));
    nameInput.value = 'Test LLM configuration';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    [...compiled.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === 'Save')
      ?.click();

    const request = TestBed.inject(HttpTestingController).expectOne('/api/configurations/llm');
    expect(request.request.body).toEqual({
      name: 'Test LLM configuration',
      promptVersion: 'v1.1',
      modelName: 'qwen2.5-1.5b-instruct',
      modelParameters: {
        max_new_tokens: 180,
        do_sample: true,
        temperature: 0.7,
        top_p: 0.9,
      },
      bank: 'raiffeisen',
    });
    request.flush({ id: 2, name: 'Test LLM configuration', bank: 'raiffeisen' });
  });

  it('should hide internal model parameters in configuration details', () => {
    const fixture = TestBed.createComponent(ConfigurationPageComponent);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/configurations').flush([{ id: 1, name: 'Test configuration' }]);
    http.expectOne('/api/configurations/1').flush({
      id: 1,
      name: 'Test configuration',
      generationMode: 'llm',
      modelParameters: { do_sample: true, temperature: 0.7 },
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Rule set version');
    expect(compiled.textContent).not.toContain('hidden-version');
    expect(compiled.textContent).not.toContain('do_sample');
    expect(compiled.textContent).toContain('temperature');
    expect(compiled.textContent).toContain('0.7');
  });
});

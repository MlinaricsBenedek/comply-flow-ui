import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
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
});

import { TestBed } from '@angular/core/testing';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render the app title and conversation list', async () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Comply Flow');
    expect(compiled.querySelectorAll('.conversation-card').length).toBeGreaterThan(0);
    expect(compiled.textContent).toContain('Configurations');
  });
});

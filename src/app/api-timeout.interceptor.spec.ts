import { HttpClient, HttpEventType, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { apiTimeoutInterceptor } from './api-timeout.interceptor';
import { ConfigurationService } from './configuration.service';

describe('apiTimeoutInterceptor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        provideHttpClient(withInterceptors([apiTimeoutInterceptor])),
        provideHttpClientTesting(),
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.useRealTimers();
  });

  it('cancels the request and reports a timeout after ten minutes even with progress events', () => {
    let failure: unknown;
    TestBed.inject(HttpClient).get('/api/configurations', {
      observe: 'events',
      reportProgress: true,
    }).subscribe({ error: (error: unknown) => failure = error });

    const request = TestBed.inject(HttpTestingController).expectOne('/api/configurations');
    vi.advanceTimersByTime(599_999);
    request.event({ type: HttpEventType.DownloadProgress, loaded: 10 });
    expect(failure).toBeUndefined();
    vi.advanceTimersByTime(1);

    expect(request.cancelled).toBe(true);
    expect(ConfigurationService.getErrorMessage(failure)).toBe('API request timed out after 10 minutes.');
  });

  it('accepts a response before the deadline and does not time out afterwards', () => {
    let result: unknown;
    let failure: unknown;
    TestBed.inject(HttpClient).get('/api/configurations').subscribe({
      next: (value) => result = value,
      error: (error: unknown) => failure = error,
    });

    const request = TestBed.inject(HttpTestingController).expectOne('/api/configurations');
    vi.advanceTimersByTime(599_999);
    request.flush({ ok: true });
    vi.advanceTimersByTime(1);

    expect(result).toEqual({ ok: true });
    expect(failure).toBeUndefined();
  });
});

import { HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { mergeMap, takeUntil, throwError, timer } from 'rxjs';
import { getApiBaseUrl } from './api-url';

const API_TIMEOUT_MS = 10 * 60 * 1000;

export const apiTimeoutInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = getApiBaseUrl(inject(PLATFORM_ID));
  if (request.url !== apiBaseUrl && !request.url.startsWith(`${apiBaseUrl}/`)) {
    return next(request);
  }

  const deadline = timer(API_TIMEOUT_MS).pipe(
    mergeMap(() => throwError(() => new Error('API request timed out after 10 minutes.'))),
  );
  return next(request).pipe(takeUntil(deadline));
};

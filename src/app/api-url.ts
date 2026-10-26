import { isPlatformBrowser } from '@angular/common';

export function getApiBaseUrl(platformId: object): string {
  return isPlatformBrowser(platformId) ? '/api' : 'http://localhost:5079/api';
}

import { apiFetch } from './client';
import type { Statistika } from '../types';

export function fetchStatistika(): Promise<Statistika> {
  return apiFetch<Statistika>('/statistika/');
}

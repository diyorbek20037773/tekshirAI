import { apiFetch } from './client';
import type { TahlilResponse } from '../types';

export function fetchTahlil(): Promise<TahlilResponse> {
  return apiFetch<TahlilResponse>('/tahlil/');
}

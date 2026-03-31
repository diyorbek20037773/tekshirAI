import type { FeedItem } from '../types';

export function engagementScore(item: FeedItem, index: number): number {
  let score = item.likes_soni * 3 + item.comments_soni * 5;

  // Recency bonus based on position (API returns newest first)
  score += Math.max(0, 20 - index * 0.4);

  // Status boost — unresolved problems get priority
  if (item.holat_kod === 'kutilmoqda') score += 15;
  else if (item.holat_kod === 'korib_chiqilmoqda') score += 5;

  return score;
}

export function sortByEngagement(items: FeedItem[]): FeedItem[] {
  const scored = items.map((item, index) => ({ item, score: engagementScore(item, index) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.item);
}

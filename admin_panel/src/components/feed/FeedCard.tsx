import type { FeedItem } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import { Heart, MessageCircle, MapPin } from 'lucide-react';
import { CATEGORY_LABELS } from '../../types';

interface Props {
  item: FeedItem;
}

export default function FeedCard({ item }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-slate-400">
            {item.is_anonim ? 'A' : (item.user?.[0] || '?')}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-700">
              {item.is_anonim ? 'Anonim fuqaro' : item.user}
            </span>
            <span className="text-[11px] text-slate-400">{item.vaqt}</span>
            <StatusBadge holat={item.holat_kod} />
          </div>

          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{item.izoh}</p>

          {item.rasmlar.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {item.rasmlar.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-slate-400">
              <MapPin size={13} />
              <span className="text-[11px]">{item.viloyat}, {item.tuman}</span>
            </div>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
              {CATEGORY_LABELS[item.infratuzilma_kod] || item.infratuzilma}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1 text-slate-400">
              <Heart size={14} className={item.likes_soni > 0 ? 'text-red-400' : ''} />
              <span className="text-xs font-medium">{item.likes_soni}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <MessageCircle size={14} />
              <span className="text-xs font-medium">{item.comments_soni}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

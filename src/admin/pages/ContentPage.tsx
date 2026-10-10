import { useState } from 'react';
import { FileText, Newspaper } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';
import PagesPanel from './content/PagesPanel';
import PostsPanel from './content/PostsPanel';

type Tab = 'pages' | 'posts';

/**
 * The content surfaces share one screen because they are edited the same way and by the same
 * permission (`content.manage`); the tab decides which list is mounted, so switching never leaves a
 * second copy of a form open.
 */
export default function ContentPage() {
  const { can } = useAdminAuth();
  const [tab, setTab] = useState<Tab>('pages');

  const canWrite = can('content.manage');

  const tabClass = (active: boolean) =>
    [
      'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] transition-colors',
      active ? 'bg-teal-800 font-medium text-white' : 'text-cocoa hover:bg-cream',
    ].join(' ');

  return (
    <div>
      <div className="mb-6 inline-flex items-center gap-1 rounded-xl border border-line bg-white p-1 shadow-soft">
        <button type="button" className={tabClass(tab === 'pages')} onClick={() => setTab('pages')}>
          <FileText className="h-4 w-4" />
          برگه‌ها
        </button>
        <button type="button" className={tabClass(tab === 'posts')} onClick={() => setTab('posts')}>
          <Newspaper className="h-4 w-4" />
          نوشته‌های وبلاگ
        </button>
      </div>

      {tab === 'pages' ? <PagesPanel canWrite={canWrite} /> : <PostsPanel canWrite={canWrite} />}
    </div>
  );
}

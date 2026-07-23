import React from 'react';

interface NewsPreviewProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  status?: string;
}

export const NewsPreview: React.FC<NewsPreviewProps> = ({ open, onClose, title, content, excerpt, coverImageUrl, status }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {coverImageUrl && (
          <div className="h-48 rounded-t-2xl overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img src={coverImageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {status === 'published' ? 'Publié' : status === 'draft' ? 'Brouillon' : 'Archivé'}
            </span>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-3">{title || '(Sans titre)'}</h1>
          {excerpt && <p className="text-gray-500 dark:text-gray-400 mb-4 italic">{excerpt}</p>}
          <hr className="border-gray-200 dark:border-gray-700 mb-4" />
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {content || 'Aucun contenu.'}
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SourceBadge } from '@/components/ui/RealDataUI';

interface Props { onNext?: () => void; }

export default function QuoteIngestion({ onNext }: Props) {
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      ['application/pdf', 'image/png', 'image/jpeg'].includes(f.type)
    );
    setFiles(prev => [...prev, ...dropped]);
  };

  return (
    <div className="min-h-full flex flex-col items-center py-12 px-8">
      <motion.h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#181922] mb-4 text-center"
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        Quote Upload
      </motion.h1>
      <p className="text-[#7A7F8D] text-sm font-mono tracking-wider mb-8 text-center">
        Upload actual quotation documents (PDF, PNG, JPG) for structured extraction
      </p>

      <div className="w-full max-w-2xl surface-panel p-12 text-center border-dashed border-2 border-[#181922]/10 hover:border-[#6C63FF]/30 transition-colors cursor-pointer"
        onDragOver={e => e.preventDefault()} onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}>
        <input id="file-input" type="file" accept=".pdf,.png,.jpg,.jpeg" multiple className="hidden"
          onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])} />
        <div className="text-3xl mb-4">📄</div>
        <p className="text-[#7A7F8D] font-mono text-sm mb-2">Drop quotation files here or click to browse</p>
        <p className="text-[#969AA6] font-mono text-[10px]">PDF &middot; PNG &middot; JPG &middot; Max 10MB each</p>
      </div>

      {files.length > 0 && (
        <div className="w-full max-w-2xl mt-6 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="surface-panel p-3 flex items-center gap-3">
              <span className="text-[#6C63FF]">📎</span>
              <span className="text-sm font-mono text-[#555867] flex-1">{f.name}</span>
              <span className="text-[10px] font-mono text-[#969AA6]">{(f.size / 1024).toFixed(1)} KB</span>
              <SourceBadge label="uploaded-document" />
            </div>
          ))}
          <p className="text-[10px] font-mono text-[#FFB86B] text-center mt-4">
            Document extraction is available with an AI provider configured. Currently in upload-only mode.
          </p>
        </div>
      )}

      {onNext && (
        <button onClick={onNext} className="mt-8 editorial-btn editorial-btn-primary px-8 py-3 tracking-widest font-bold uppercase text-[11px]">
          Continue &rarr;
        </button>
      )}
    </div>
  );
}

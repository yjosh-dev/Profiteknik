import React, { useState, useRef, useEffect } from 'react';

type AttachmentType = 'image' | 'file';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;        // MIME type
  url: string;         // object URL (or remote URL later)
  category: AttachmentType;
}

interface Message {
  id: number;
  sender: 'applicant' | 'recruiter';
  text: string;
  time: string;
  attachments?: Attachment[];
}

// Helpers
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const isImage = (file: File) => file.type.startsWith('image/');

export default function ApplicantConversation() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'applicant',
      text: 'Hi, I wanted to follow up on my application for the Frontend Developer role.',
      time: '10:30 AM',
    },
    {
      id: 2,
      sender: 'recruiter',
      text: "Hello! Thanks for reaching out. Could you share your portfolio and resume?",
      time: '10:32 AM',
    },
    {
      id: 3,
      sender: 'applicant',
      text: 'Sure! Here they are.',
      time: '10:33 AM',
      attachments: [
        {
          id: 'a1',
          name: 'resume.pdf',
          size: 245_000,
          type: 'application/pdf',
          url: '#',
          category: 'file',
        },
        {
          id: 'a2',
          name: 'portfolio-preview.png',
          size: 1_800_000,
          type: 'image/png',
          url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600',
          category: 'image',
        },
      ],
    },
    { id: 4, sender: 'recruiter', text: 'Thanks! Reviewing now.', time: '10:35 AM' },
  ]);

  const [inputValue, setInputValue] = useState<string>('');
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      category: isImage(file) ? 'image' : 'file',
    }));
    setPendingAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target && target.url.startsWith('blob:')) URL.revokeObjectURL(target.url);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSend = () => {
    if (!inputValue.trim() && pendingAttachments.length === 0) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'applicant',
      text: inputValue.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: pendingAttachments.length ? pendingAttachments : undefined,
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    setPendingAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-white rounded-lg border border-red-200 shadow-sm">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-red-200 bg-red-50 rounded-t-lg flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <h2 className="text-base font-semibold text-red-900">Conversation with Recruiter</h2>
      </div>

      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-red-50/30">
        {messages.map((msg) => {
          const isApplicant = msg.sender === 'applicant';
          const hasAttachments = msg.attachments && msg.attachments.length > 0;

          return (
            <div key={msg.id} className={`flex ${isApplicant ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg text-sm shadow-sm overflow-hidden ${
                  isApplicant
                    ? 'bg-red-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-red-100 rounded-bl-none'
                }`}
              >
                {/* Text bubble (only if text exists) */}
                {msg.text && (
                  <div className="px-3 py-2">
                    <p>{msg.text}</p>
                  </div>
                )}

                {/* Image grid (Messenger-style) */}
                {hasAttachments && (
                  <div
                    className={`grid gap-1 p-1 ${
                      msg.attachments!.filter((a) => a.category === 'image').length > 1
                        ? 'grid-cols-2'
                        : 'grid-cols-1'
                    }`}
                  >
                    {msg.attachments!
                      .filter((a) => a.category === 'image')
                      .map((att) => (
                        <button
                          key={att.id}
                          onClick={() => setLightboxUrl(att.url)}
                          className="block overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-full h-40 object-cover hover:opacity-95 transition-opacity"
                          />
                        </button>
                      ))}
                  </div>
                )}

                {/* File chips */}
                {hasAttachments && (
                  <div className="px-1 pb-1 space-y-1">
                    {msg.attachments!
                      .filter((a) => a.category === 'file')
                      .map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center gap-2 px-2 py-2 rounded-md text-xs ${
                            isApplicant
                              ? 'bg-red-700/40 hover:bg-red-700/60'
                              : 'bg-red-50 hover:bg-red-100'
                          } transition-colors`}
                        >
                          <FileIcon />
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{att.name}</p>
                            <p className={isApplicant ? 'text-red-100' : 'text-red-400'}>
                              {formatBytes(att.size)}
                            </p>
                          </div>
                          <DownloadIcon />
                        </a>
                      ))}
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`px-3 pb-1 text-xs ${
                    isApplicant ? 'text-red-200' : 'text-red-400'
                  } text-right`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Pending attachments preview strip */}
      {pendingAttachments.length > 0 && (
        <div className="flex-shrink-0 border-t border-red-200 bg-red-50 px-3 py-2 flex gap-2 overflow-x-auto">
          {pendingAttachments.map((att) => (
            <div
              key={att.id}
              className="relative flex-shrink-0 group"
            >
              {att.category === 'image' ? (
                <img
                  src={att.url}
                  alt={att.name}
                  className="w-16 h-16 object-cover rounded-md border border-red-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-md border border-red-200 bg-white flex flex-col items-center justify-center text-red-500 px-1">
                  <FileIcon />
                  <span className="text-[9px] mt-1 truncate w-full text-center text-gray-600">
                    {att.name}
                  </span>
                </div>
              )}
              <button
                onClick={() => removePendingAttachment(att.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center shadow hover:bg-red-700"
                aria-label="Remove attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-red-200 p-3 bg-red-50 rounded-b-lg">
        <div className="flex items-end gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />

          {/* Paperclip button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
            aria-label="Add attachment"
            title="Attach files"
          >
            <PaperclipIcon />
          </button>

          <textarea
            className="flex-1 resize-none rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent max-h-24"
            rows={1}
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() && pendingAttachments.length === 0}
            className="flex-shrink-0 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Send
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={lightboxUrl}
            alt="preview"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-2xl flex items-center justify-center hover:bg-white/20"
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Icons (inline SVGs, no dependency) ---------- */

function PaperclipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
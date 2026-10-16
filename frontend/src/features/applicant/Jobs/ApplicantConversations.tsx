import { useEffect, useRef, useState } from "react";

import {
  Archive,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Send,
  Star,
  X,
} from "lucide-react";

interface Attachment {
  id: number;
  name: string;
  type: "image" | "file";
  url: string;
  size?: string;
}

interface Message {
  id: number;
  sender: "applicant" | "recruiter";
  text: string;
  time: string;
  attachments?: Attachment[];
}

interface Conversation {
  id: number;
  jobTitle: string;
  jobType: string;
  status: "Pending" | "Shortlisted" | "Interview" | "Rejected";
  lastMessage: string;
  date: string;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    jobTitle: "Frontend Developer",
    jobType: "Full-time",
    status: "Shortlisted",
    lastMessage: "Thanks! Reviewing your application now.",
    date: "Oct 15",
    messages: [
      {
        id: 1,
        sender: "applicant",
        text: "Hello, I would like to ask about my application for the Frontend Developer position.",
        time: "10:21 AM",
      },
      {
        id: 2,
        sender: "recruiter",
        text: "Hi! We have received your application. Could you also send your latest portfolio and resume?",
        time: "10:24 AM",
      },
      {
        id: 3,
        sender: "applicant",
        text: "Sure. I have attached them below.",
        time: "10:27 AM",
        attachments: [
          {
            id: 1,
            name: "resume.pdf",
            type: "file",
            url: "#",
            size: "245 KB",
          },
          {
            id: 2,
            name: "portfolio-preview.png",
            type: "image",
            url: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80",
            size: "1.2 MB",
          },
        ],
      },
      {
        id: 4,
        sender: "recruiter",
        text: "Thanks! Reviewing your application now.",
        time: "10:31 AM",
      },
    ],
  },
  {
    id: 2,
    jobTitle: "Pipefitter",
    jobType: "Full-time",
    status: "Pending",
    lastMessage: "We will update you once your application is reviewed.",
    date: "Oct 14",
    messages: [
      {
        id: 1,
        sender: "applicant",
        text: "Good day. I would like to follow up regarding my Pipefitter application.",
        time: "2:15 PM",
      },
      {
        id: 2,
        sender: "recruiter",
        text: "Your application is currently under review.",
        time: "2:22 PM",
      },
      {
        id: 3,
        sender: "recruiter",
        text: "We will update you once your application is reviewed.",
        time: "2:23 PM",
      },
    ],
  },
  {
    id: 3,
    jobTitle: "Electrical Technician",
    jobType: "Full-time",
    status: "Interview",
    lastMessage: "Your interview schedule has been confirmed.",
    date: "Oct 13",
    messages: [
      {
        id: 1,
        sender: "recruiter",
        text: "Your application has progressed to the interview stage.",
        time: "9:10 AM",
      },
      {
        id: 2,
        sender: "applicant",
        text: "Thank you. When will the interview take place?",
        time: "9:15 AM",
      },
      {
        id: 3,
        sender: "recruiter",
        text: "Your interview schedule has been confirmed. We will send the meeting details shortly.",
        time: "9:19 AM",
      },
    ],
  },
];

function getStatusClass(status: Conversation["status"]) {
  switch (status) {
    case "Shortlisted":
      return "bg-gray-100 text-gray-700";
    case "Interview":
      return "bg-gray-100 text-gray-700";
    case "Rejected":
      return "bg-gray-100 text-gray-600";
    case "Pending":
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function isPdfFile(file: File) {
  return file.type === "application/pdf";
}

export default function ApplicantConversations() {
  const [selectedId, setSelectedId] = useState<number | null>(
    initialConversations[0]?.id ?? null
  );

  const [inboxFilter, setInboxFilter] = useState("Inbox");

  const [conversations, setConversations] = useState<Conversation[]>(
    initialConversations
  );

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ??
    null;

  return (
    <div className="w-full h-full min-h-[560px] p-4 md:p-5">
      <div className="w-full h-full min-h-[520px] grid grid-cols-1 lg:grid-cols-[32%_68%] gap-4">
        {/* Conversation List */}
        <div className="min-h-0 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Messages
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your job application conversations
                </p>
              </div>
            </div>

            <div className="mt-4">
              <select
                value={inboxFilter}
                onChange={(event) => setInboxFilter(event.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-400"
              >
                <option>Inbox</option>
                <option>Archived</option>
                <option>Starred</option>
              </select>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    No conversations
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Your application messages will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {conversations.map((conversation) => {
                  const isSelected = selectedId === conversation.id;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedId(conversation.id)}
                      className={`w-full text-left px-4 py-4 transition ${
                        isSelected
                          ? "bg-gray-50 border-l-2 border-gray-900"
                          : "bg-white border-l-2 border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-gray-900">
                              {conversation.jobTitle}
                            </h3>
                          </div>

                          <p className="mt-1 text-xs text-gray-500">
                            {conversation.jobType}
                          </p>

                          <p className="mt-2 truncate text-sm text-gray-600">
                            {conversation.lastMessage}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-gray-400">
                          {conversation.date}
                        </span>
                      </div>

                      <div className="mt-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(
                            conversation.status
                          )}`}
                        >
                          {conversation.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Conversation */}
        <ApplicantConversation
          conversation={selectedConversation}
          setConversations={setConversations}
        />
      </div>
    </div>
  );
}

interface ApplicantConversationProps {
  conversation: Conversation | null;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

function ApplicantConversation({
  conversation,
  setConversations,
}: ApplicantConversationProps) {
  const [inputValue, setInputValue] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>(
    []
  );
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversation?.messages.length]);

  useEffect(() => {
    setInputValue("");
    setPendingAttachments([]);
    setLightboxUrl(null);
  }, [conversation?.id]);

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const newAttachments: Attachment[] = files.map((file, index) => {
      const image = isImageFile(file);

      return {
        id: Date.now() + index,
        name: file.name,
        type: image ? "image" : "file",
        url: URL.createObjectURL(file),
        size: formatFileSize(file.size),
      };
    });

    setPendingAttachments((previous) => [
      ...previous,
      ...newAttachments,
    ]);

    event.target.value = "";
  };

  const removePendingAttachment = (id: number) => {
    setPendingAttachments((previous) =>
      previous.filter((attachment) => attachment.id !== id)
    );
  };

  const handleSendMessage = () => {
    if (!conversation) {
      return;
    }

    const text = inputValue.trim();

    if (!text && pendingAttachments.length === 0) {
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      sender: "applicant",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      attachments:
        pendingAttachments.length > 0
          ? pendingAttachments
          : undefined,
    };

    setConversations((previous) =>
      previous.map((item) =>
        item.id === conversation.id
          ? {
              ...item,
              lastMessage:
                text ||
                (pendingAttachments.length === 1
                  ? `Sent ${pendingAttachments[0].name}`
                  : `Sent ${pendingAttachments.length} attachments`),
              messages: [...item.messages, newMessage],
            }
          : item
      )
    );

    setInputValue("");
    setPendingAttachments([]);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className="min-h-0 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-base font-semibold text-gray-900">
            Select a conversation
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select a job application from the list to view its messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-0 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Conversation Header */}
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-gray-900">
                {conversation.jobTitle}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Application conversation
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                conversation.status
              )}`}
            >
              {conversation.status}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 bg-white">
          <div className="max-w-3xl mx-auto space-y-4">
            {conversation.messages.map((message) => {
              const isApplicant = message.sender === "applicant";

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isApplicant ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] ${
                      isApplicant ? "items-end" : "items-start"
                    } flex flex-col`}
                  >
                    <div
                      className={`rounded-lg px-4 py-3 text-sm ${
                        isApplicant
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {message.text && (
                        <p className="whitespace-pre-wrap break-words">
                          {message.text}
                        </p>
                      )}

                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div
                            className={`${
                              message.text ? "mt-3" : ""
                            } space-y-2`}
                          >
                            {message.attachments.map((attachment) => (
                              <MessageAttachment
                                key={attachment.id}
                                attachment={attachment}
                                isApplicant={isApplicant}
                                onImageClick={() =>
                                  attachment.type === "image" &&
                                  setLightboxUrl(attachment.url)
                                }
                              />
                            ))}
                          </div>
                        )}
                    </div>

                    <span className="mt-1 px-1 text-xs text-gray-400">
                      {message.time}
                    </span>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Pending Attachments */}
        {pendingAttachments.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {pendingAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2"
                >
                  {attachment.type === "image" ? (
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-gray-500" />
                  )}

                  <div className="max-w-[180px]">
                    <p className="truncate text-xs font-medium text-gray-700">
                      {attachment.name}
                    </p>

                    {attachment.size && (
                      <p className="text-[11px] text-gray-400">
                        {attachment.size}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removePendingAttachment(attachment.id)
                    }
                    className="ml-1 text-gray-400 hover:text-gray-700"
                    aria-label={`Remove ${attachment.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-3">
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 rounded-md border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message..."
              rows={1}
              className="min-h-[42px] max-h-32 flex-1 resize-none rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400"
            />

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={
                !inputValue.trim() &&
                pendingAttachments.length === 0
              }
              className="shrink-0 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              <span className="hidden sm:inline">Send</span>
              <Send className="h-4 w-4 sm:hidden" />
            </button>
          </div>

          <p className="mt-2 px-1 text-[11px] text-gray-400">
            Press Enter to send. Use Shift + Enter for a new line.
          </p>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute right-5 top-5 rounded-md bg-white p-2 text-gray-700 hover:bg-gray-100"
            aria-label="Close image preview"
          >
            <X className="h-5 w-5" />
          </button>

          <img
            src={lightboxUrl}
            alt="Attachment preview"
            className="max-h-[85vh] max-w-[90vw] rounded-md object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

interface MessageAttachmentProps {
  attachment: Attachment;
  isApplicant: boolean;
  onImageClick: () => void;
}

function MessageAttachment({
  attachment,
  isApplicant,
  onImageClick,
}: MessageAttachmentProps) {
  if (attachment.type === "image") {
    return (
      <button
        type="button"
        onClick={onImageClick}
        className="block overflow-hidden rounded-md border border-black/10"
      >
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-h-56 max-w-full object-cover transition hover:opacity-90"
        />
      </button>
    );
  }

  return (
    <a
      href={attachment.url}
      download={attachment.name}
      onClick={(event) => {
        if (attachment.url === "#") {
          event.preventDefault();
        }
      }}
      className={`flex items-center gap-3 rounded-md border px-3 py-2 ${
        isApplicant
          ? "border-white/20 bg-white/10"
          : "border-gray-200 bg-white"
      }`}
    >
      <FileText
        className={`h-5 w-5 shrink-0 ${
          isApplicant ? "text-white" : "text-gray-500"
        }`}
      />

      <div className="min-w-0 text-left">
        <p
          className={`truncate text-xs font-medium ${
            isApplicant ? "text-white" : "text-gray-700"
          }`}
        >
          {attachment.name}
        </p>

        {attachment.size && (
          <p
            className={`text-[11px] ${
              isApplicant ? "text-gray-300" : "text-gray-400"
            }`}
          >
            {attachment.size}
          </p>
        )}
      </div>
    </a>
  );
}
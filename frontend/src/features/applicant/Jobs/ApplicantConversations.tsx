import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Paperclip,
  Send,
  X,
} from "lucide-react";

import { applicantsMyJobService } from "../../../service/api/applicants/applicantsMyJobsService";
import {
  listenToMessages,
  sendMessage,
  type ChatMessage,
} from "../../../service/firebase/chatService";

interface Attachment {
  id: number;
  name: string;
  type: "image" | "file";
  url: string;
  size?: string;
}

interface Message {
  id: string;
  sender: "applicant" | "recruiter";
  text: string;
  time: string;
  attachments?: Attachment[];
}

interface Conversation {
  id: number;
  applicationId: number;
  jobId: number;
  jobTitle: string;
  jobType: string;
  status: "Pending" | "Shortlisted" | "Interview" | "Rejected";
  lastMessage: string;
  date: string;
  messages: Message[];
}

interface ApplicantApplication {
  application_id: number;
  applicant_id: number;
  job_id: number;
  status: string;
  date_applied: string;
  job_listing: {
    job_id: number;
    job_title: string;
    job_description: string;
    minimum_salary: number;
    maximum_salary: number;
    vacant_position: number;
    employment_type: string;
    posted_at: string;
    posted_until: string | null;
    updated_at: string | null;
  };
}

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

function formatMessageTime(value: unknown) {
  if (!value) {
    return "";
  }

  try {
    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (value as { toDate?: unknown }).toDate === "function"
    ) {
      const date = (
        value as {
          toDate: () => Date;
        }
      ).toDate();

      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    if (value instanceof Date) {
      return value.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    if (typeof value === "string" || typeof value === "number") {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
      }
    }
  } catch {
    return "";
  }

  return "";
}

function formatConversationDate(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function mapApplicationStatus(
  status: string
): Conversation["status"] {
  switch (status.toLowerCase()) {
    case "shortlisted":
      return "Shortlisted";

    case "interview":
      return "Interview";

    case "rejected":
      return "Rejected";

    case "pending":
    default:
      return "Pending";
  }
}

function mapFirestoreMessages(
  messages: ChatMessage[]
): Message[] {
  return messages.map((message) => ({
    id: message.id,
    sender:
      message.senderType === "employee"
        ? "recruiter"
        : "applicant",
    text: message.message,
    time: formatMessageTime(message.createdAt),
  }));
}

export default function ApplicantConversations() {
  const [selectedId, setSelectedId] = useState<number | null>(
    null
  );

  const [inboxFilter, setInboxFilter] = useState("Inbox");

  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [applicantId, setApplicantId] = useState<number | null>(
    null
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    let mounted = true;

    const loadApplications = async () => {
      if (!token) {
        if (mounted) {
          setLoading(false);
          setError("You are not authenticated.");
        }

        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response =
          await applicantsMyJobService.fetchPendingJobs(token);

        const applicantIdFromResponse =
          response.data?.applicant_id;

        const applications: ApplicantApplication[] =
          response.data?.applications ?? [];

        if (!mounted) {
          return;
        }

        if (applicantIdFromResponse) {
          setApplicantId(applicantIdFromResponse);
        }

        const mappedConversations: Conversation[] =
          applications.map((application) => ({
            id: application.job_id,
            applicationId: application.application_id,
            jobId: application.job_id,
            jobTitle:
              application.job_listing?.job_title ??
              "Untitled Job",
            jobType:
              application.job_listing?.employment_type ??
              "Not specified",
            status: mapApplicationStatus(application.status),
            lastMessage: "No conversation yet.",
            date: formatConversationDate(
              application.date_applied
            ),
            messages: [],
          }));

        setConversations(mappedConversations);

        if (mappedConversations.length > 0) {
          setSelectedId((current) => {
            if (
              current !== null &&
              mappedConversations.some(
                (conversation) => conversation.id === current
              )
            ) {
              return current;
            }

            return mappedConversations[0].id;
          });
        } else {
          setSelectedId(null);
        }
      } catch (err) {
        console.error(
          "Failed to load applicant applications:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load your application conversations."
          );
          setConversations([]);
          setSelectedId(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadApplications();

    return () => {
      mounted = false;
    };
  }, [token]);

  const selectedConversation =
    conversations.find(
      (conversation) => conversation.id === selectedId
    ) ?? null;

  useEffect(() => {
    if (!selectedConversation) {
      return;
    }

    const applicationId =
      selectedConversation.applicationId;

    const unsubscribe = listenToMessages(
      applicationId,
      (firestoreMessages) => {
        const messages =
          mapFirestoreMessages(firestoreMessages);

        setConversations((previous) =>
          previous.map((conversation) => {
            if (
              conversation.applicationId !== applicationId
            ) {
              return conversation;
            }

            const lastMessage =
              messages[messages.length - 1];

            return {
              ...conversation,
              messages,
              lastMessage: lastMessage
                ? lastMessage.text ||
                  (lastMessage.sender === "applicant"
                    ? "You sent a message."
                    : "Recruiter sent a message.")
                : "No conversation yet.",
              date:
                lastMessage?.time ||
                conversation.date,
            };
          })
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedConversation?.applicationId]);

  const conversationStarted =
    selectedConversation?.messages.some(
      (message) => message.sender === "recruiter"
    ) ?? false;

  return (
    <div className="w-full h-full min-h-[560px] p-4 md:p-5">
      <div className="w-full h-full min-h-[520px] grid grid-cols-1 lg:grid-cols-[32%_68%] gap-4">
        {/* Conversation List */}
        <div className="min-h-0 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
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
                onChange={(event) =>
                  setInboxFilter(event.target.value)
                }
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-400"
              >
                <option>Inbox</option>
                <option disabled>Archived</option>
                <option disabled>Starred</option>
              </select>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />

                  <p className="mt-3 text-sm text-gray-500">
                    Loading conversations...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    Unable to load conversations
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {error}
                  </p>
                </div>
              </div>
            ) : conversations.length === 0 ? (
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
                  const isSelected =
                    selectedId === conversation.id;

                  return (
                    <button
                      key={conversation.applicationId}
                      type="button"
                      onClick={() =>
                        setSelectedId(conversation.id)
                      }
                      className={`w-full text-left px-4 py-4 transition ${
                        isSelected
                          ? "bg-gray-50 border-l-2 border-gray-900"
                          : "bg-white border-l-2 border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-gray-900">
                            {conversation.jobTitle}
                          </h3>

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
          conversationStarted={conversationStarted}
          applicantId={applicantId ?? undefined}
        />
      </div>
    </div>
  );
}

interface ApplicantConversationProps {
  conversation: Conversation | null;
  conversationStarted: boolean;
  applicantId?: number;
}

function ApplicantConversation({
  conversation,
  conversationStarted,
  applicantId,
}: ApplicantConversationProps) {
  const [inputValue, setInputValue] = useState("");

  const [sending, setSending] = useState(false);

  const [pendingAttachments, setPendingAttachments] =
    useState<Attachment[]>([]);

  const [lightboxUrl, setLightboxUrl] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

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
    event.target.value = "";
  };

  const removePendingAttachment = (id: number) => {
    setPendingAttachments((previous) =>
      previous.filter(
        (attachment) => attachment.id !== id
      )
    );
  };

  const handleSendMessage = async () => {
    if (!conversation) {
      return;
    }

    if (!conversationStarted) {
      return;
    }

    if (!applicantId) {
      return;
    }

    const text = inputValue.trim();

    if (!text) {
      return;
    }

    if (sending) {
      return;
    }

    try {
      setSending(true);

      await sendMessage(
        conversation.applicationId,
        String(applicantId),
        "applicant",
        text
      );

      setInputValue("");
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      void handleSendMessage();
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
            Select a job application from the list to view its
            messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-0 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
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

        <div className="flex-1 min-h-0 overflow-y-auto p-5 bg-white">
          <div className="max-w-3xl mx-auto space-y-4">
            {conversation.messages.length === 0 ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <p className="text-sm font-medium text-gray-900">
                    No conversation yet
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    A recruiter needs to start the conversation
                    before you can send a message.
                  </p>
                </div>
              </div>
            ) : (
              conversation.messages.map((message) => {
                const isApplicant =
                  message.sender === "applicant";

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isApplicant
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] ${
                        isApplicant
                          ? "items-end"
                          : "items-start"
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
                      </div>

                      <span className="mt-1 px-1 text-xs text-gray-400">
                        {message.time}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {conversationStarted ? (
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
                disabled
                className="shrink-0 rounded-md border border-gray-200 p-2.5 text-gray-400 cursor-not-allowed"
                aria-label="Attachments are not available yet"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <textarea
                value={inputValue}
                onChange={(event) =>
                  setInputValue(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Write a message..."
                rows={1}
                disabled={sending}
                className="min-h-[42px] max-h-32 flex-1 resize-none rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 disabled:bg-gray-50"
              />

              <button
                type="button"
                onClick={() =>
                  void handleSendMessage()
                }
                disabled={
                  !inputValue.trim() || sending
                }
                className="shrink-0 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                {sending ? (
                  <span className="text-xs">
                    Sending...
                  </span>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      Send
                    </span>

                    <Send className="h-4 w-4 sm:hidden" />
                  </>
                )}
              </button>
            </div>

            <p className="mt-2 px-1 text-[11px] text-gray-400">
              Press Enter to send. Use Shift + Enter for a
              new line.
            </p>
          </div>
        ) : (
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
            <p className="text-center text-sm text-gray-500">
              A recruiter must start this conversation before
              you can reply.
            </p>
          </div>
        )}
      </div>

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
            onClick={(event) =>
              event.stopPropagation()
            }
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
          isApplicant
            ? "text-white"
            : "text-gray-500"
        }`}
      />

      <div className="min-w-0 text-left">
        <p
          className={`truncate text-xs font-medium ${
            isApplicant
              ? "text-white"
              : "text-gray-700"
          }`}
        >
          {attachment.name}
        </p>

        {attachment.size && (
          <p
            className={`text-[11px] ${
              isApplicant
                ? "text-gray-300"
                : "text-gray-400"
            }`}
          >
            {attachment.size}
          </p>
        )}
      </div>
    </a>
  );
}
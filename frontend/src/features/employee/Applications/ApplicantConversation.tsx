import {
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { applicantScreeningService } from "../../../service/api/employee/applicantScreeningService";
import { useSearchParams } from "react-router-dom";

import { Paperclip, Send } from "lucide-react";

import {
  listenToMessages,
  sendMessage,
  type ChatMessage,
} from "../../../service/firebase/chatService";

import { AuthContext } from "../../../context/AuthProvider";

interface Message {
  id: string;
  sender: "applicant" | "recruiter";
  text: string;
  time: string;
}

interface ScreeningResponse {
  data: {
    application_id: number;
    job_id: number;
    status: string;
    date_applied: string;

    job?: {
      job_id: number;
      job_title: string;
    };

    applicant?: {
      applicant_id: number;
      first_name: string;
      middle_name?: string | null;
      last_name: string;
    };
  };
}

function formatMessageTime(value: unknown): string {
  if (!value) {
    return "";
  }

  try {
    /*
     * Firebase Timestamp
     */
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

    /*
     * JavaScript Date
     */
    if (value instanceof Date) {
      return value.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    /*
     * String or number timestamp
     */
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

function mapFirestoreMessages(messages: ChatMessage[]): Message[] {
  return messages.map((message) => ({
    id: message.id,

    sender: message.senderType === "employee" ? "recruiter" : "applicant",

    text: message.message,

    time: formatMessageTime(message.createdAt),
  }));
}

export default function ApplicantConversation() {
  /*
   * ============================================================
   * AUTH
   * ============================================================
   */

  const auth = useContext(AuthContext);

  /*
   * Employee ID from AuthContext:
   *
   * auth?.userData?.userData.id
   */
  const employeeId = auth?.userData?.userData.id;

  /*
   * ============================================================
   * URL PARAMETERS
   * ============================================================
   *
   * Example:
   *
   * /employee/dash/job_listing/application/conversation
   *     ?job_id=14
   *     &applicant_id=5
   */

  const [searchParams] = useSearchParams();

  const jobId = searchParams.get("job_id");

  const applicantId = searchParams.get("applicant_id");

  /*
   * ============================================================
   * APPLICATION INFORMATION
   * ============================================================
   */

  const [applicationId, setApplicationId] = useState<number | null>(null);

  const [applicationStatus, setApplicationStatus] = useState("");

  const [jobTitle, setJobTitle] = useState("");

  const [applicantName, setApplicantName] = useState("");

  const [loadingApplication, setLoadingApplication] = useState(true);

  const [applicationError, setApplicationError] = useState("");

  /*
   * ============================================================
   * CHAT STATE
   * ============================================================
   */

  const [messages, setMessages] = useState<Message[]>([]);

  const [inputValue, setInputValue] = useState("");

  const [sending, setSending] = useState(false);

  const [sendError, setSendError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /*
   * ============================================================
   * LOAD APPLICATION
   * ============================================================
   */

  useEffect(() => {
    const fetchApplication = async () => {
      if (!jobId || !applicantId) {
        setApplicationError("Missing job_id or applicant_id.");

        setLoadingApplication(false);

        return;
      }

      try {
        setLoadingApplication(true);

        setApplicationError("");

        const token = localStorage.getItem("token");

        console.log("Fetching application:", {
          jobId,
          applicantId,
        });

        const response = await applicantScreeningService.getScreeningDetails(
          String(jobId),
          String(applicantId),
        );

        console.log("Screening response:", response.data);

        const data = response.data.data;

        /*
         * Make sure application ID
         * exists.
         */
        if (!data || !data.application_id) {
          console.error("No application_id returned:", response.data);

          setApplicationError("Application ID was not returned by the server.");

          return;
        }

        /*
         * ====================================================
         * APPLICATION STATUS
         * ====================================================
         *
         * Conversation is only available
         * when status is "onboarding".
         */

        setApplicationStatus(data.status?.toLowerCase() ?? "");

        /*
         * ====================================================
         * APPLICATION ID
         * ====================================================
         */

        const resolvedApplicationId = Number(data.application_id);

        setApplicationId(resolvedApplicationId);

        /*
         * ====================================================
         * JOB TITLE
         * ====================================================
         */

        if (data.job?.job_title) {
          setJobTitle(data.job.job_title);
        }

        /*
         * ====================================================
         * APPLICANT NAME
         * ====================================================
         */

        if (data.applicant) {
          const fullName = [
            data.applicant.first_name,

            data.applicant.middle_name,

            data.applicant.last_name,
          ]
            .filter(Boolean)
            .join(" ");

          setApplicantName(fullName);
        }

        console.log("Resolved application ID:", resolvedApplicationId);

        console.log("Application status:", data.status);

        console.log("Resolved job title:", data.job?.job_title);

        console.log("Resolved applicant name:", data.applicant);
      } catch (error) {
        console.error("Failed to fetch application:", error);

        setApplicationError("Failed to load the application.");
      } finally {
        setLoadingApplication(false);
      }
    };

    void fetchApplication();
  }, [jobId, applicantId]);

  /*
   * ============================================================
   * FIRESTORE LISTENER
   * ============================================================
   *
   * Only listen to Firestore when the application
   * is actually in onboarding.
   */

  useEffect(() => {
    if (!applicationId || applicationStatus !== "onboarding") {
      return;
    }

    console.log("Listening to conversation:", applicationId);

    const unsubscribe = listenToMessages(applicationId, (firestoreMessages) => {
      console.log("Received Firestore messages:", firestoreMessages);

      setMessages(mapFirestoreMessages(firestoreMessages));
    });

    return () => {
      unsubscribe();
    };
  }, [applicationId, applicationStatus]);

  /*
   * ============================================================
   * AUTO SCROLL
   * ============================================================
   */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
   * ============================================================
   * SEND MESSAGE
   * ============================================================
   */

  const handleSendMessage = async () => {
    console.log("=== SEND BUTTON ===");

    const text = inputValue.trim();

    console.log("message:", text);

    console.log("applicationId:", applicationId);

    console.log("employeeId:", employeeId);

    /*
     * Extra frontend guard.
     *
     * Even if somebody somehow calls
     * the send function while the UI is
     * not in onboarding, don't send.
     */
    if (applicationStatus !== "onboarding") {
      console.log("Stopped: application is not in onboarding.");

      setSendError("Messaging is only available during onboarding.");

      return;
    }

    /*
     * Empty message
     */
    if (!text) {
      console.log("Stopped: empty message");

      return;
    }

    /*
     * Application not loaded
     */
    if (!applicationId) {
      console.log("Stopped: missing applicationId");

      setSendError("The application is still loading.");

      return;
    }

    /*
     * Employee authentication
     */
    if (!employeeId) {
      console.log("Stopped: missing employeeId");

      setSendError("Employee authentication is not available.");

      return;
    }

    /*
     * Prevent duplicate messages
     */
    if (sending) {
      console.log("Stopped: already sending");

      return;
    }

    try {
      setSending(true);

      setSendError("");

      console.log("Calling sendMessage...");

      await sendMessage(applicationId, employeeId, "employee", text);

      console.log("Message sent successfully.");

      setInputValue("");
    } catch (error) {
      console.error("Failed to send recruiter message:", error);

      setSendError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  /*
   * ============================================================
   * KEYBOARD
   * ============================================================
   *
   * Enter = send
   * Shift + Enter = new line
   */

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      void handleSendMessage();
    }
  };

  /*
   * ============================================================
   * LOADING SCREEN
   * ============================================================
   */

  if (loadingApplication) {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-lg border border-gray-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

          <p className="mt-3 text-sm text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR SCREEN
   * ============================================================
   */

  if (applicationError) {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            Unable to load conversation
          </p>

          <p className="mt-1 text-sm text-red-500">{applicationError}</p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * CONVERSATION STATUS GUARD
   * ============================================================
   *
   * Only allow the conversation UI when:
   *
   * status === "onboarding"
   *
   * Examples that will be blocked:
   *
   * pending
   * shortlisted
   * interview
   * rejected
   * completed
   */

  if (applicationStatus !== "onboarding") {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-6 w-6 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0 3.75h.007M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              />
            </svg>
          </div>

          <h2 className="mt-4 text-base font-semibold text-gray-900">
            Conversation Unavailable
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Messaging is only available while the applicant is in the onboarding
            stage.
          </p>

          <div className="mt-4 inline-flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium capitalize text-gray-600">
            Current status: {applicationStatus || "Unknown"}
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * CONVERSATION UI
   * ============================================================
   */

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
            {applicantName ? applicantName.charAt(0).toUpperCase() : "A"}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-gray-900">
              {applicantName || "Applicant"}
            </h2>

            <p className="truncate text-sm text-gray-500">
              {jobTitle || `Job #${jobId}`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="max-w-sm text-center">
                <p className="text-sm font-medium text-gray-900">
                  Start the conversation
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Send the applicant a message to begin the conversation.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isRecruiter = message.sender === "recruiter";

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isRecruiter ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex max-w-[75%] flex-col ${
                      isRecruiter ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-3 text-sm ${
                        isRecruiter
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
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

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3">
        <div className="flex items-end gap-2">
          {/* Attachment */}
          <button
            type="button"
            disabled
            className="flex-shrink-0 cursor-not-allowed rounded-md border border-gray-200 p-2.5 text-gray-400"
            aria-label="Attachments are not available yet"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Text input */}
          <textarea
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);

              setSendError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            rows={1}
            disabled={sending}
            className="min-h-[42px] max-h-32 flex-1 resize-none rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 disabled:bg-gray-50"
          />

          {/* Send */}
          <button
            type="button"
            onClick={() => {
              console.log("SEND BUTTON CLICKED");

              void handleSendMessage();
            }}
            disabled={
              !inputValue.trim() ||
              sending ||
              !applicationId ||
              applicationStatus !== "onboarding"
            }
            className="flex-shrink-0 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {sending ? (
              <span className="text-xs">Sending...</span>
            ) : (
              <>
                <span className="hidden sm:inline">Send</span>

                <Send className="h-4 w-4 sm:hidden" />
              </>
            )}
          </button>
        </div>

        {/* Send error */}
        {sendError && (
          <p className="mt-2 px-1 text-xs text-red-500">{sendError}</p>
        )}

        <p className="mt-2 px-1 text-[11px] text-gray-400">
          Press Enter to send. Use Shift + Enter for a new line.
        </p>
      </div>
    </div>
  );
}

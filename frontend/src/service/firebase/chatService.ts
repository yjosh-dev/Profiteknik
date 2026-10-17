import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: "applicant" | "employee";
  message: string;
  createdAt: unknown;
}

function getMessagesCollection(
  applicationId: number | string
) {
  return collection(
    db,
    "chats",
    `application_${applicationId}`,
    "messages"
  );
}

export async function sendMessage(
  applicationId: number | string,
  senderId: string,
  senderType: "applicant" | "employee",
  message: string
) {
  console.log("=== FIREBASE SEND START ===");
  console.log("applicationId:", applicationId);
  console.log("senderId:", senderId);
  console.log("senderType:", senderType);
  console.log("message:", message);

  const messagesRef =
    getMessagesCollection(applicationId);

  console.log(
    "messagesRef:",
    messagesRef.path
  );

  const result = await addDoc(messagesRef, {
    senderId,
    senderType,
    message: message.trim(),
    createdAt: serverTimestamp(),
  });

  console.log("=== FIREBASE SEND SUCCESS ===");
  console.log("document ID:", result.id);

  return result;
}

export function listenToMessages(
  applicationId: number | string,
  callback: (messages: ChatMessage[]) => void
) {
  const messagesRef =
    getMessagesCollection(applicationId);

  const messagesQuery = query(
    messagesRef,
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];

      callback(messages);
    },
    (error) => {
      console.error(
        "Firestore listener error:",
        error
      );
    }
  );
}
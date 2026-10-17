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

function getMessagesCollection(applicationId: number | string) {
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
  const messagesRef = getMessagesCollection(applicationId);

  await addDoc(messagesRef, {
    senderId,
    senderType,
    message: message.trim(),
    createdAt: serverTimestamp(),
  });
}

export function listenToMessages(
  applicationId: number | string,
  callback: (messages: ChatMessage[]) => void
) {
  const messagesRef = getMessagesCollection(applicationId);

  const messagesQuery = query(
    messagesRef,
    orderBy("createdAt", "asc")
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];

    callback(messages);
  });
}
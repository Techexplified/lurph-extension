import axiosInstance from "../lib/axiosInstance.js";

export async function extractPdf(file) {
  const formData = new FormData();
  formData.append("pdf", file);
  const { data } = await axiosInstance.post("/api/chat/pdf/extract", formData, {
    timeout: 120000,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.attachment;
}

export async function getChatUsage() {
  const { data } = await axiosInstance.get("/api/chat/usage");
  return data.queryUsage;
}

export async function sendChatMessage(payload) {
  const { data } = await axiosInstance.post("/api/chat/completions", payload, {
    timeout: 120000,
  });
  return data;
}

export async function getConversations(search = "") {
  const { data } = await axiosInstance.get("/api/chat/conversations", {
    params: search.trim() ? { search: search.trim() } : {},
  });
  return data;
}

export async function getConversation(conversationId) {
  const { data } = await axiosInstance.get(
    `/api/chat/conversations/${encodeURIComponent(conversationId)}`,
  );
  return data;
}

export async function renameConversation(conversationId, title) {
  const { data } = await axiosInstance.patch(
    `/api/chat/conversations/${encodeURIComponent(conversationId)}`,
    { title },
  );
  return data;
}

export async function deleteConversation(conversationId) {
  const { data } = await axiosInstance.delete(
    `/api/chat/conversations/${encodeURIComponent(conversationId)}`,
  );
  return data;
}

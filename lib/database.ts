import { supabase } from "./supabaseClient";

// 새 방 생성
export async function createRoom(name: string, isPrivate: boolean) {
  const generated_key = isPrivate ? generateRandomKey() : null;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24시간 후

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      name,
      type: isPrivate ? "private" : "public",
      password_key: generated_key,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select();

  if (error) throw error;
  return data?.[0];
}

// 모든 공개 방 조회
export async function getPublicRooms() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("type", "public")
    .gt("expires_at", now)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// 모든 비공개 방 조회
export async function getPrivateRooms() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("type", "private")
    .gt("expires_at", now)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// 방 ID로 방 조회
export async function getRoomById(roomId: string) {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) throw error;
  return data;
}

// 비밀번호 확인
export async function verifyRoomPassword(roomId: string, key: string) {
  const room = await getRoomById(roomId);
  if (!room) return false;
  return room.password_key === key;
}

// 메시지 추가
export async function addMessage(roomId: string, content: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      room_id: roomId,
      content,
      created_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;
  return data?.[0];
}

// 방의 메시지 조회
export async function getRoomMessages(roomId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

// 랜덤 키 생성 (6자리 수)
export function generateRandomKey(): string {
  return Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
}

// 방 직접 삭제 (운영자용)
export async function deleteRoomById(roomId: string) {
  const { error: deleteMessagesError } = await supabase
    .from("messages")
    .delete()
    .eq("room_id", roomId);

  if (deleteMessagesError) throw deleteMessagesError;

  const { error: deleteRoomError } = await supabase
    .from("rooms")
    .delete()
    .eq("id", roomId);

  if (deleteRoomError) throw deleteRoomError;
  return true;
}

// 모든 방 조회 (운영자용)
export async function getAllRooms() {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL 및 Key가 설정되지 않았습니다.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Room = {
  id: string;
  name: string;
  type: "public" | "private";
  password_key?: string;
  created_at: string;
  expires_at: string;
};

export type Message = {
  id: string;
  room_id: string;
  content: string;
  created_at: string;
};

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * 24시간이 지난 방과 메시지를 자동으로 삭제하는 API
 * 주기적으로 호출되어야 함 (예: 1시간마다)
 */
export async function POST(request: NextRequest) {
  try {
    const now = new Date().toISOString();

    // 만료된 방의 메시지 먼저 삭제
    const { data: expiredRooms, error: fetchError } = await supabase
      .from("rooms")
      .select("id")
      .lt("expires_at", now);

    if (fetchError) {
      console.error("만료된 방 조회 실패:", fetchError);
      return NextResponse.json(
        { error: "만료된 방 조회 실패" },
        { status: 500 }
      );
    }

    // 메시지 삭제
    if (expiredRooms && expiredRooms.length > 0) {
      const roomIds = expiredRooms.map((room) => room.id);

      const { error: deleteMessagesError } = await supabase
        .from("messages")
        .delete()
        .in("room_id", roomIds);

      if (deleteMessagesError) {
        console.error("메시지 삭제 실패:", deleteMessagesError);
        return NextResponse.json(
          { error: "메시지 삭제 실패" },
          { status: 500 }
        );
      }

      // 방 삭제
      const { error: deleteRoomsError } = await supabase
        .from("rooms")
        .delete()
        .in("id", roomIds);

      if (deleteRoomsError) {
        console.error("방 삭제 실패:", deleteRoomsError);
        return NextResponse.json({ error: "방 삭제 실패" }, { status: 500 });
      }

      console.log(`${roomIds.length}개의 만료된 방이 삭제되었습니다.`);
      return NextResponse.json({
        success: true,
        deletedRooms: roomIds.length,
      });
    }

    return NextResponse.json({
      success: true,
      deletedRooms: 0,
      message: "삭제할 방이 없습니다.",
    });
  } catch (error) {
    console.error("자동 삭제 중 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

/**
 * 통계 조회
 * 만료된 방과 메시지의 수를 반환
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date().toISOString();

    // 만료될 예정인 방 조회
    const { data: expiredRooms, count: expiredCount, error: error1 } =
      await supabase
        .from("rooms")
        .select("*", { count: "exact" })
        .lt("expires_at", now);

    if (error1) {
      console.error("통계 조회 실패:", error1);
      return NextResponse.json(
        { error: "통계 조회 실패" },
        { status: 500 }
      );
    }

    // 전체 방 개수
    const { count: totalRooms, error: error2 } = await supabase
      .from("rooms")
      .select("*", { count: "exact" })
      .gt("expires_at", now);

    if (error2) {
      return NextResponse.json(
        { error: "통계 조회 실패" },
        { status: 500 }
      );
    }

    // 전체 메시지 개수
    const { count: totalMessages, error: error3 } = await supabase
      .from("messages")
      .select("*", { count: "exact" });

    if (error3) {
      return NextResponse.json(
        { error: "통계 조회 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: {
        expiredRoomsCount: expiredCount || 0,
        activeRoomsCount: totalRooms || 0,
        totalMessagesCount: totalMessages || 0,
        timestamp: now,
      },
    });
  } catch (error) {
    console.error("통계 조회 중 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

/**
 * Cron 작업을 통해 주기적으로 호출되는 엔드포인트
 * Vercel Cron Jobs 사용: https://vercel.com/docs/cron-jobs
 */
export async function POST(request: NextRequest) {
  // Vercel 환경에서는 Authorization 헤더로 검증
  const authHeader = request.headers.get("authorization");
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // cleanup API 호출
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/cleanup`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "정기 정제 작업 완료",
      result: data,
    });
  } catch (error) {
    console.error("Cron 작업 실패:", error);
    return NextResponse.json({ error: "Cron 작업 실패" }, { status: 500 });
  }
}

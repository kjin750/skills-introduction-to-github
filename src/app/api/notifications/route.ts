import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const where: any = {
      userId: session.user.id,
    }

    if (unreadOnly) {
      where.isRead = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    // 읽지 않은 알림 수
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    })

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("알림 조회 오류:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // 모든 알림을 읽음으로 처리
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // 특정 알림들을 읽음으로 처리
      await prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds,
          },
          userId: session.user.id,
        },
        data: {
          isRead: true,
        },
      })
    }

    return NextResponse.json({ message: "알림이 읽음으로 처리되었습니다." })
  } catch (error) {
    console.error("알림 읽음 처리 오류:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
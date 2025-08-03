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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {
      userId: session.user.id,
    }

    if (status && status !== "ALL") {
      where.status = status
    }

    if (startDate && endDate) {
      where.orderDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              companyName: true,
              contactPerson: true,
            },
          },
        },
        orderBy: {
          orderDate: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("주문 조회 오류:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const body = await request.json()
    const {
      orderType,
      javaraQuantity,
      returnCanQuantity,
      shippingDate,
      shippingMethod,
      specialNotes,
    } = body

    // 입력값 검증
    if (!orderType || !shippingDate || !shippingMethod) {
      return NextResponse.json(
        { error: "필수 필드를 모두 입력해주세요." },
        { status: 400 }
      )
    }

    if (javaraQuantity <= 0 && returnCanQuantity <= 0) {
      return NextResponse.json(
        { error: "자바라 수량 또는 반납통 수량 중 하나는 0보다 커야 합니다." },
        { status: 400 }
      )
    }

    // 간단한 가격 계산 (실제로는 더 복잡한 로직 필요)
    const javaraPrice = 50000 // 자바라당 5만원
    const returnCanPrice = 30000 // 반납통당 3만원
    const totalAmount = (javaraQuantity * javaraPrice) + (returnCanQuantity * returnCanPrice)

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        orderType,
        javaraQuantity: javaraQuantity || 0,
        returnCanQuantity: returnCanQuantity || 0,
        shippingDate: new Date(shippingDate),
        shippingMethod,
        specialNotes,
        totalAmount,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            companyName: true,
            contactPerson: true,
          },
        },
      },
    })

    // 알림 생성
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "새 주문이 등록되었습니다",
        message: `주문번호: ${order.id}가 성공적으로 등록되었습니다.`,
        type: "ORDER_CREATED",
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("주문 생성 오류:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
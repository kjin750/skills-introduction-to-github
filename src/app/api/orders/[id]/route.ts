import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            companyName: true,
            contactPerson: true,
            phone: true,
            address: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("주문 조회 오류:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    // 기존 주문 확인
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 })
    }

    // 출고 완료된 주문은 수정 불가
    if (existingOrder.status === "SHIPPED" || existingOrder.status === "DELIVERED") {
      return NextResponse.json(
        { error: "출고 완료된 주문은 수정할 수 없습니다." },
        { status: 400 }
      )
    }

    // 가격 재계산
    const javaraPrice = 50000
    const returnCanPrice = 30000
    const totalAmount = (javaraQuantity * javaraPrice) + (returnCanQuantity * returnCanPrice)

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        orderType,
        javaraQuantity: javaraQuantity || 0,
        returnCanQuantity: returnCanQuantity || 0,
        shippingDate: new Date(shippingDate),
        shippingMethod,
        specialNotes,
        totalAmount,
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
        title: "주문이 수정되었습니다",
        message: `주문번호: ${updatedOrder.id}가 수정되었습니다.`,
        type: "ORDER_UPDATED",
      },
    })

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error("주문 수정 오류:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 })
    }

    // 출고 완료된 주문은 삭제 불가
    if (existingOrder.status === "SHIPPED" || existingOrder.status === "DELIVERED") {
      return NextResponse.json(
        { error: "출고 완료된 주문은 삭제할 수 없습니다." },
        { status: 400 }
      )
    }

    await prisma.order.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    })

    return NextResponse.json({ message: "주문이 취소되었습니다." })
  } catch (error) {
    console.error("주문 삭제 오류:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
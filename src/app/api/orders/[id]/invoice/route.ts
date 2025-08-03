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
            businessNumber: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 })
    }

    // 출고 완료되지 않은 주문은 명세서 생성 불가
    if (order.status !== "SHIPPED" && order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "출고 완료된 주문만 거래명세서를 생성할 수 있습니다." },
        { status: 400 }
      )
    }

    // PDF 생성을 위한 데이터 반환
    const invoiceData = {
      order: {
        id: order.id,
        orderType: order.orderType,
        javaraQuantity: order.javaraQuantity,
        returnCanQuantity: order.returnCanQuantity,
        totalAmount: order.totalAmount.toString(),
        status: order.status,
        orderDate: order.orderDate.toISOString(),
        shippingDate: order.shippingDate.toISOString(),
        shippingMethod: order.shippingMethod,
        specialNotes: order.specialNotes,
      },
      user: {
        companyName: order.user.companyName,
        contactPerson: order.user.contactPerson,
        phone: order.user.phone,
        address: order.user.address,
        businessNumber: order.user.businessNumber,
      },
    }

    return NextResponse.json({ invoiceData })
  } catch (error) {
    console.error("거래명세서 데이터 조회 오류:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
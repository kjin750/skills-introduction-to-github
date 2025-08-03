import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, businessNumber } = body

    if (!email || !businessNumber) {
      return NextResponse.json(
        { error: "이메일과 사업자번호를 입력해주세요." },
        { status: 400 }
      )
    }

    // 사용자 찾기
    const user = await prisma.user.findFirst({
      where: {
        email,
        businessNumber,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "해당 정보로 등록된 사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 리셋 토큰 생성 (24시간 유효)
    const resetToken = randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // 실제 환경에서는 이메일 발송 로직 추가
    // 여기서는 토큰을 반환 (개발용)
    return NextResponse.json({
      message: "비밀번호 재설정 링크가 이메일로 발송되었습니다.",
      resetToken, // 개발용 - 실제로는 이메일로만 전송
    })
  } catch (error) {
    console.error("비밀번호 재설정 오류:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "토큰과 새 비밀번호를 입력해주세요." },
        { status: 400 }
      )
    }

    // 토큰 유효성 확인
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "유효하지 않거나 만료된 토큰입니다." },
        { status: 400 }
      )
    }

    // 새 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // 비밀번호 업데이트 및 토큰 제거
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({
      message: "비밀번호가 성공적으로 변경되었습니다.",
    })
  } catch (error) {
    console.error("비밀번호 변경 오류:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
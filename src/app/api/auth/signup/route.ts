import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { validateBusinessNumber } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      businessNumber,
      companyName,
      contactPerson,
      phone,
      address,
    } = body

    // 입력값 검증
    if (!email || !password || !businessNumber || !companyName || !contactPerson || !phone || !address) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      )
    }

    // 사업자번호 유효성 검사
    if (!validateBusinessNumber(businessNumber)) {
      return NextResponse.json(
        { error: "유효하지 않은 사업자번호입니다." },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 400 }
      )
    }

    // 사업자번호 중복 확인
    const existingUserByBusinessNumber = await prisma.user.findUnique({
      where: { businessNumber },
    })

    if (existingUserByBusinessNumber) {
      return NextResponse.json(
        { error: "이미 등록된 사업자번호입니다." },
        { status: 400 }
      )
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        businessNumber,
        companyName,
        contactPerson,
        phone,
        address,
        isVerified: true, // 실제 환경에서는 이메일 인증 프로세스 필요
      },
    })

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다.", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("회원가입 오류:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
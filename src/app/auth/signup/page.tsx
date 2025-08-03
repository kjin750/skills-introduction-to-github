"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { validateBusinessNumber, formatBusinessNumber } from "@/lib/utils"

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    businessNumber: "",
    companyName: "",
    contactPerson: "",
    phone: "",
    address: "",
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요."
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요."
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다."
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다."
    }

    if (!formData.businessNumber) {
      newErrors.businessNumber = "사업자번호를 입력해주세요."
    } else if (!validateBusinessNumber(formData.businessNumber)) {
      newErrors.businessNumber = "유효하지 않은 사업자번호입니다."
    }

    if (!formData.companyName) {
      newErrors.companyName = "회사명을 입력해주세요."
    }

    if (!formData.contactPerson) {
      newErrors.contactPerson = "담당자명을 입력해주세요."
    }

    if (!formData.phone) {
      newErrors.phone = "연락처를 입력해주세요."
    }

    if (!formData.address) {
      newErrors.address = "주소를 입력해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          businessNumber: formData.businessNumber.replace(/[^0-9]/g, ""),
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          address: formData.address,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("회원가입이 완료되었습니다. 로그인해주세요.")
        router.push("/auth/signin")
      } else {
        setErrors({ general: data.error || "회원가입 중 오류가 발생했습니다." })
      }
    } catch (error) {
      setErrors({ general: "서버 연결 오류가 발생했습니다." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            요소수 주문 관리 시스템에 가입하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessNumber">사업자번호 *</Label>
                <Input
                  id="businessNumber"
                  name="businessNumber"
                  type="text"
                  placeholder="000-00-00000"
                  value={formData.businessNumber}
                  onChange={handleChange}
                  required
                />
                {errors.businessNumber && <p className="text-red-500 text-sm">{errors.businessNumber}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">회사명 *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="회사명을 입력하세요"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
                {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPerson">담당자명 *</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  placeholder="담당자명을 입력하세요"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                />
                {errors.contactPerson && <p className="text-red-500 text-sm">{errors.contactPerson}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">연락처 *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="연락처를 입력하세요"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">주소 *</Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="주소를 입력하세요"
                value={formData.address}
                onChange={handleChange}
                required
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>

            {errors.general && (
              <div className="text-red-500 text-sm text-center">{errors.general}</div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "가입 중..." : "회원가입"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <div className="text-sm">
              이미 계정이 있으시나요?{" "}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800">
                로그인
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
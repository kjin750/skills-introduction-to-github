"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { CalendarDays, Package, Truck } from "lucide-react"

interface OrderForm {
  orderType: string
  javaraQuantity: number
  returnCanQuantity: number
  shippingDate: string
  shippingMethod: string
  specialNotes: string
}

export default function NewOrder() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<OrderForm>({
    orderType: "",
    javaraQuantity: 0,
    returnCanQuantity: 0,
    shippingDate: "",
    shippingMethod: "",
    specialNotes: "",
  })
  
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)

  // 가격 계산
  const javaraPrice = 50000
  const returnCanPrice = 30000
  const totalAmount = (formData.javaraQuantity * javaraPrice) + (formData.returnCanQuantity * returnCanPrice)

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("Quantity") ? parseInt(value) || 0 : value
    }))
    
    // 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.orderType) {
      newErrors.orderType = "주문 유형을 선택해주세요."
    }

    if (formData.javaraQuantity <= 0 && formData.returnCanQuantity <= 0) {
      newErrors.quantity = "자바라 수량 또는 반납통 수량 중 하나는 0보다 커야 합니다."
    }

    if (!formData.shippingDate) {
      newErrors.shippingDate = "출고일을 선택해주세요."
    } else {
      const selectedDate = new Date(formData.shippingDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.shippingDate = "출고일은 오늘 이후여야 합니다."
      }
    }

    if (!formData.shippingMethod) {
      newErrors.shippingMethod = "배송 방법을 입력해주세요."
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
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert("주문이 성공적으로 등록되었습니다!")
        router.push("/orders")
      } else {
        setErrors({ general: data.error || "주문 등록 중 오류가 발생했습니다." })
      }
    } catch (error) {
      setErrors({ general: "서버 연결 오류가 발생했습니다." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">새 주문 등록</h1>
            <p className="mt-2 text-gray-600">
              요소수 주문 정보를 입력해주세요.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>주문 정보</span>
              </CardTitle>
              <CardDescription>
                주문할 요소수의 종류와 수량을 선택해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 주문 유형 */}
                <div className="space-y-2">
                  <Label htmlFor="orderType">주문 유형 *</Label>
                  <Select onValueChange={(value) => handleSelectChange("orderType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="주문 유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOX">박스 포장</SelectItem>
                      <SelectItem value="BULK">벌크 납품</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.orderType && <p className="text-red-500 text-sm">{errors.orderType}</p>}
                </div>

                {/* 수량 입력 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="javaraQuantity">자바라 수량</Label>
                    <Input
                      id="javaraQuantity"
                      name="javaraQuantity"
                      type="number"
                      min="0"
                      value={formData.javaraQuantity}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500">
                      단가: {formatCurrency(javaraPrice)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="returnCanQuantity">반납통 수량</Label>
                    <Input
                      id="returnCanQuantity"
                      name="returnCanQuantity"
                      type="number"
                      min="0"
                      value={formData.returnCanQuantity}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500">
                      단가: {formatCurrency(returnCanPrice)}
                    </p>
                  </div>
                </div>
                {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}

                {/* 출고일 */}
                <div className="space-y-2">
                  <Label htmlFor="shippingDate" className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>출고 예정일 *</span>
                  </Label>
                  <Input
                    id="shippingDate"
                    name="shippingDate"
                    type="date"
                    value={formData.shippingDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.shippingDate && <p className="text-red-500 text-sm">{errors.shippingDate}</p>}
                </div>

                {/* 배송 방법 */}
                <div className="space-y-2">
                  <Label htmlFor="shippingMethod" className="flex items-center space-x-2">
                    <Truck className="h-4 w-4" />
                    <span>배송 방법 *</span>
                  </Label>
                  <Input
                    id="shippingMethod"
                    name="shippingMethod"
                    type="text"
                    value={formData.shippingMethod}
                    onChange={handleInputChange}
                    placeholder="예: 자체 배송, 택배, 직접 수령 등"
                  />
                  {errors.shippingMethod && <p className="text-red-500 text-sm">{errors.shippingMethod}</p>}
                </div>

                {/* 특이사항 */}
                <div className="space-y-2">
                  <Label htmlFor="specialNotes">특이사항</Label>
                  <textarea
                    id="specialNotes"
                    name="specialNotes"
                    rows={3}
                    value={formData.specialNotes}
                    onChange={handleInputChange}
                    placeholder="배송 시 주의사항이나 요청사항이 있으시면 입력해주세요."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* 주문 요약 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">주문 요약</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>자바라 {formData.javaraQuantity}개</span>
                      <span>{formatCurrency(formData.javaraQuantity * javaraPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>반납통 {formData.returnCanQuantity}개</span>
                      <span>{formatCurrency(formData.returnCanQuantity * returnCanPrice)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>총 금액</span>
                      <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {errors.general && (
                  <div className="text-red-500 text-sm text-center">{errors.general}</div>
                )}

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || totalAmount === 0}
                    className="flex-1"
                  >
                    {isLoading ? "등록 중..." : "주문 등록"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { formatCurrency, formatDate } from "@/lib/utils"
import { generateInvoicePDF, InvoiceData } from "@/lib/pdf"
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface Order {
  id: string
  orderType: string
  javaraQuantity: number
  returnCanQuantity: number
  totalAmount: number
  status: string
  orderDate: string
  shippingDate: string
  shippingMethod: string
  user: {
    companyName: string
    contactPerson: string
  }
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function Orders() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // 필터 상태
  const [filters, setFilters] = useState({
    status: "ALL",
    startDate: "",
    endDate: "",
    page: 1
  })

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders()
    }
  }, [status, filters])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const searchParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: "10",
        ...(filters.status !== "ALL" && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      })

      const response = await fetch(`/api/orders?${searchParams}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("주문 조회 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: {[key: string]: string} = {
      PENDING: "대기중",
      CONFIRMED: "확인됨",
      SHIPPED: "출고완료",
      DELIVERED: "배송완료",
      CANCELLED: "취소됨",
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: {[key: string]: string} = {
      PENDING: "text-yellow-600 bg-yellow-100",
      CONFIRMED: "text-blue-600 bg-blue-100",
      SHIPPED: "text-green-600 bg-green-100",
      DELIVERED: "text-green-700 bg-green-200",
      CANCELLED: "text-red-600 bg-red-100",
    }
    return colorMap[status] || "text-gray-600 bg-gray-100"
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // 필터 변경시 첫 페이지로
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const resetFilters = () => {
    setFilters({
      status: "ALL",
      startDate: "",
      endDate: "",
      page: 1
    })
  }

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`)
      if (response.ok) {
        const data = await response.json()
        generateInvoicePDF(data.invoiceData)
      } else {
        const errorData = await response.json()
        alert(errorData.error || "거래명세서를 생성할 수 없습니다.")
      }
    } catch (error) {
      console.error("거래명세서 다운로드 오류:", error)
      alert("거래명세서 다운로드 중 오류가 발생했습니다.")
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 헤더 */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
              <p className="mt-2 text-gray-600">
                주문 내역을 조회하고 관리할 수 있습니다.
              </p>
            </div>
            <Button asChild>
              <Link href="/orders/new">
                <Plus className="h-4 w-4 mr-2" />
                새 주문
              </Link>
            </Button>
          </div>

          {/* 필터 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>필터 및 검색</span>
              </CardTitle>
              <CardDescription>
                원하는 조건으로 주문을 검색해보세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>주문 상태</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">전체</SelectItem>
                      <SelectItem value="PENDING">대기중</SelectItem>
                      <SelectItem value="CONFIRMED">확인됨</SelectItem>
                      <SelectItem value="SHIPPED">출고완료</SelectItem>
                      <SelectItem value="DELIVERED">배송완료</SelectItem>
                      <SelectItem value="CANCELLED">취소됨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>시작일</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>종료일</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={resetFilters} className="flex-1">
                      초기화
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 주문 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>주문 내역</span>
                  <span className="text-sm text-gray-500">
                    (총 {pagination.total}건)
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">주문 #{order.id.slice(-8)}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {order.orderType === "BOX" ? "박스" : "벌크"}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{formatCurrency(Number(order.totalAmount))}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">수량:</span> 자바라 {order.javaraQuantity}개, 반납통 {order.returnCanQuantity}개
                        </div>
                        <div>
                          <span className="font-medium">주문일:</span> {formatDate(new Date(order.orderDate))}
                        </div>
                        <div>
                          <span className="font-medium">출고예정일:</span> {formatDate(new Date(order.shippingDate))}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-4">
                        <span className="font-medium">배송방법:</span> {order.shippingMethod}
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            상세보기
                          </Link>
                        </Button>
                        
                        {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/orders/${order.id}/edit`}>
                              <Edit className="h-4 w-4 mr-1" />
                              수정
                            </Link>
                          </Button>
                        )}
                        
                        {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadInvoice(order.id)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            명세서
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">검색 조건에 맞는 주문이 없습니다.</p>
                  <Button asChild>
                    <Link href="/orders/new">첫 주문 등록하기</Link>
                  </Button>
                </div>
              )}

              {/* 페이지네이션 */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      이전
                    </Button>
                    
                    <span className="text-sm text-gray-600">
                      {pagination.page} / {pagination.totalPages} 페이지
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      다음
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    총 {pagination.total}건 중 {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}건 표시
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
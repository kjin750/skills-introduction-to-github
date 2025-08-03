"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
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
}

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  shippedOrders: number
  totalAmount: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    totalAmount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/orders?limit=5")
      if (response.ok) {
        const data = await response.json()
        setRecentOrders(data.orders)
        
        // 통계 계산
        const allOrdersResponse = await fetch("/api/orders?limit=1000")
        if (allOrdersResponse.ok) {
          const allOrdersData = await allOrdersResponse.json()
          const orders = allOrdersData.orders
          
          const stats = {
            totalOrders: orders.length,
            pendingOrders: orders.filter((o: Order) => o.status === "PENDING").length,
            shippedOrders: orders.filter((o: Order) => o.status === "SHIPPED" || o.status === "DELIVERED").length,
            totalAmount: orders.reduce((sum: number, order: Order) => sum + Number(order.totalAmount), 0),
          }
          setStats(stats)
        }
      }
    } catch (error) {
      console.error("대시보드 데이터 로딩 오류:", error)
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
            <p className="mt-2 text-gray-600">
              안녕하세요, {session?.user?.name}님! 오늘도 좋은 하루 되세요.
            </p>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 주문</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  전체 주문 건수
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">대기중 주문</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  처리 대기중인 주문
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">출고 완료</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.shippedOrders}</div>
                <p className="text-xs text-muted-foreground">
                  출고/배송 완료된 주문
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 주문금액</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  전체 주문 총액
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 최근 주문 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>최근 주문</CardTitle>
                  <CardDescription>
                    최근 등록된 주문 내역입니다.
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button asChild>
                    <Link href="/orders/new">
                      <Plus className="h-4 w-4 mr-2" />
                      새 주문
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/orders">전체 보기</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">주문 #{order.id.slice(-8)}</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {order.orderType === "BOX" ? "박스" : "벌크"} | 
                            자바라: {order.javaraQuantity}개 | 
                            반납통: {order.returnCanQuantity}개
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            주문일: {formatDate(new Date(order.orderDate))} | 
                            출고예정일: {formatDate(new Date(order.shippingDate))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(Number(order.totalAmount))}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="mt-2"
                          >
                            <Link href={`/orders/${order.id}`}>상세보기</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">아직 주문이 없습니다.</p>
                    <Button asChild className="mt-4">
                      <Link href="/orders/new">첫 주문 등록하기</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
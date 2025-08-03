"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { 
  Megaphone, 
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle
} from "lucide-react"

interface Notice {
  id: string
  title: string
  content: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function Notices() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [notices, setNotices] = useState<Notice[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null)

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotices()
    }
  }, [status, pagination.page])

  const fetchNotices = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notices?page=${pagination.page}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setNotices(data.notices)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("공지사항 조회 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const toggleExpanded = (noticeId: string) => {
    setExpandedNotice(expandedNotice === noticeId ? null : noticeId)
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
      
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Megaphone className="h-8 w-8 mr-3 text-blue-600" />
              공지사항
            </h1>
            <p className="mt-2 text-gray-600">
              중요한 공지사항과 업데이트를 확인하세요.
            </p>
          </div>

          {/* 공지사항 목록 */}
          <div className="space-y-4">
            {notices.length > 0 ? (
              notices.map((notice) => (
                <Card key={notice.id} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpanded(notice.id)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                        {notice.title}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(new Date(notice.createdAt))}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedNotice === notice.id && (
                    <CardContent className="border-t bg-gray-50">
                      <div className="pt-4">
                        <div 
                          className="prose max-w-none text-gray-700 whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: notice.content }}
                        />
                        {notice.updatedAt !== notice.createdAt && (
                          <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                            최종 수정: {formatDate(new Date(notice.updatedAt))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">등록된 공지사항이 없습니다.</p>
                  <p className="text-gray-400 text-sm mt-2">
                    새로운 공지사항이 등록되면 이곳에 표시됩니다.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>이전</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {pagination.page} / {pagination.totalPages} 페이지
                </span>
              </div>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="flex items-center space-x-2"
              >
                <span>다음</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {notices.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              총 {pagination.total}개의 공지사항이 있습니다.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
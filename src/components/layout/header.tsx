"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "./notification-dropdown"
import { 
  LogOut, 
  User, 
  Menu,
  X
} from "lucide-react"

export function Header() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              요소수 주문관리
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/dashboard"
              className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              대시보드
            </Link>
            <Link
              href="/orders"
              className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              주문 관리
            </Link>
            <Link
              href="/orders/new"
              className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              주문 등록
            </Link>
            <Link
              href="/notices"
              className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              공지사항
            </Link>
          </nav>

          {/* 사용자 정보 및 액션 */}
          <div className="hidden md:flex items-center space-x-4">
            <NotificationDropdown />
            
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                {session?.user?.name}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>로그아웃</span>
            </Button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* 모바일 네비게이션 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/dashboard"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                대시보드
              </Link>
              <Link
                href="/orders"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                주문 관리
              </Link>
              <Link
                href="/orders/new"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                주문 등록
              </Link>
              <Link
                href="/notices"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                공지사항
              </Link>
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {session?.user?.name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="mx-3 mt-2 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
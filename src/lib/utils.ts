import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 사업자번호 유효성 검사
export function validateBusinessNumber(businessNumber: string): boolean {
  const cleaned = businessNumber.replace(/[^0-9]/g, "")
  
  if (cleaned.length !== 10) return false
  
  const digits = cleaned.split("").map(Number)
  const checkDigit = digits[9]
  
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5]
  let sum = 0
  
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i]
  }
  
  sum += Math.floor((digits[8] * 5) / 10)
  const calculatedCheckDigit = (10 - (sum % 10)) % 10
  
  return checkDigit === calculatedCheckDigit
}

// 날짜 포맷팅
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

// 통화 포맷팅
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount)
}

// 사업자번호 포맷팅 (000-00-00000)
export function formatBusinessNumber(businessNumber: string): string {
  const cleaned = businessNumber.replace(/[^0-9]/g, "")
  if (cleaned.length !== 10) return businessNumber
  
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`
}
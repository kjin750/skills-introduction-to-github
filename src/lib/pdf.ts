import jsPDF from "jspdf"
import { formatCurrency, formatDate, formatBusinessNumber } from "./utils"

// 한글 폰트 지원을 위한 설정이 필요하지만 여기서는 기본 폰트 사용
export interface InvoiceData {
  order: {
    id: string
    orderType: string
    javaraQuantity: number
    returnCanQuantity: number
    totalAmount: number
    status: string
    orderDate: string
    shippingDate: string
    shippingMethod: string
    specialNotes?: string
  }
  user: {
    companyName: string
    contactPerson: string
    phone: string
    address: string
    businessNumber: string
  }
}

export function generateInvoicePDF(data: InvoiceData): void {
  const doc = new jsPDF()
  
  // A4 크기: 210 x 297mm
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  // 헤더
  doc.setFontSize(20)
  doc.text("TRANSACTION INVOICE", pageWidth / 2, 30, { align: "center" })
  doc.text("거래명세서", pageWidth / 2, 40, { align: "center" })
  
  // 선 그리기
  doc.setLineWidth(0.5)
  doc.line(20, 45, pageWidth - 20, 45)
  
  // 주문 정보 섹션
  let yPos = 60
  doc.setFontSize(14)
  doc.text("Order Information", 20, yPos)
  yPos += 5
  doc.setLineWidth(0.2)
  doc.line(20, yPos, 90, yPos)
  
  yPos += 10
  doc.setFontSize(10)
  doc.text(`Order ID: ${data.order.id}`, 20, yPos)
  yPos += 8
  doc.text(`Order Type: ${data.order.orderType === "BOX" ? "Box Package" : "Bulk Delivery"}`, 20, yPos)
  yPos += 8
  doc.text(`Order Date: ${formatDate(new Date(data.order.orderDate))}`, 20, yPos)
  yPos += 8
  doc.text(`Shipping Date: ${formatDate(new Date(data.order.shippingDate))}`, 20, yPos)
  yPos += 8
  doc.text(`Shipping Method: ${data.order.shippingMethod}`, 20, yPos)
  yPos += 8
  doc.text(`Status: ${data.order.status}`, 20, yPos)
  
  // 고객 정보 섹션
  yPos = 60
  doc.setFontSize(14)
  doc.text("Customer Information", 110, yPos)
  yPos += 5
  doc.setLineWidth(0.2)
  doc.line(110, yPos, 190, yPos)
  
  yPos += 10
  doc.setFontSize(10)
  doc.text(`Company: ${data.user.companyName}`, 110, yPos)
  yPos += 8
  doc.text(`Contact: ${data.user.contactPerson}`, 110, yPos)
  yPos += 8
  doc.text(`Phone: ${data.user.phone}`, 110, yPos)
  yPos += 8
  doc.text(`Business No: ${formatBusinessNumber(data.user.businessNumber)}`, 110, yPos)
  yPos += 8
  // 주소가 길 수 있으므로 분할
  const addressLines = doc.splitTextToSize(`Address: ${data.user.address}`, 80)
  doc.text(addressLines, 110, yPos)
  
  // 주문 상세 테이블
  yPos = 140
  doc.setFontSize(14)
  doc.text("Order Details", 20, yPos)
  yPos += 5
  doc.setLineWidth(0.2)
  doc.line(20, yPos, pageWidth - 20, yPos)
  
  // 테이블 헤더
  yPos += 15
  doc.setFontSize(10)
  doc.setFont(undefined, "bold")
  doc.text("Item", 20, yPos)
  doc.text("Quantity", 80, yPos)
  doc.text("Unit Price", 120, yPos)
  doc.text("Amount", 160, yPos)
  
  // 테이블 헤더 밑줄
  yPos += 2
  doc.line(20, yPos, pageWidth - 20, yPos)
  
  // 테이블 데이터
  yPos += 10
  doc.setFont(undefined, "normal")
  
  const javaraPrice = 50000
  const returnCanPrice = 30000
  
  if (data.order.javaraQuantity > 0) {
    doc.text("Javara", 20, yPos)
    doc.text(`${data.order.javaraQuantity}`, 80, yPos)
    doc.text(formatCurrency(javaraPrice), 120, yPos)
    doc.text(formatCurrency(data.order.javaraQuantity * javaraPrice), 160, yPos)
    yPos += 10
  }
  
  if (data.order.returnCanQuantity > 0) {
    doc.text("Return Can", 20, yPos)
    doc.text(`${data.order.returnCanQuantity}`, 80, yPos)
    doc.text(formatCurrency(returnCanPrice), 120, yPos)
    doc.text(formatCurrency(data.order.returnCanQuantity * returnCanPrice), 160, yPos)
    yPos += 10
  }
  
  // 총액 라인
  yPos += 5
  doc.line(120, yPos, pageWidth - 20, yPos)
  yPos += 10
  doc.setFont(undefined, "bold")
  doc.text("Total Amount:", 120, yPos)
  doc.text(formatCurrency(Number(data.order.totalAmount)), 160, yPos)
  
  // 특이사항
  if (data.order.specialNotes) {
    yPos += 20
    doc.setFont(undefined, "bold")
    doc.text("Special Notes:", 20, yPos)
    yPos += 8
    doc.setFont(undefined, "normal")
    const notesLines = doc.splitTextToSize(data.order.specialNotes, pageWidth - 40)
    doc.text(notesLines, 20, yPos)
  }
  
  // 푸터
  yPos = pageHeight - 30
  doc.setFontSize(8)
  doc.text(`Generated on: ${formatDate(new Date())}`, 20, yPos)
  doc.text("Urea Solution Order Management System", pageWidth / 2, yPos, { align: "center" })
  
  // PDF 다운로드
  doc.save(`invoice-${data.order.id}.pdf`)
}

export function generateBulkInvoicePDF(orders: InvoiceData[]): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  // 헤더
  doc.setFontSize(20)
  doc.text("BULK TRANSACTION REPORT", pageWidth / 2, 30, { align: "center" })
  doc.text("대량 거래 보고서", pageWidth / 2, 40, { align: "center" })
  
  // 선 그리기
  doc.setLineWidth(0.5)
  doc.line(20, 45, pageWidth - 20, 45)
  
  let yPos = 60
  
  // 요약 정보
  const totalAmount = orders.reduce((sum, order) => sum + Number(order.order.totalAmount), 0)
  const totalJavara = orders.reduce((sum, order) => sum + order.order.javaraQuantity, 0)
  const totalReturnCan = orders.reduce((sum, order) => sum + order.order.returnCanQuantity, 0)
  
  doc.setFontSize(12)
  doc.text(`Total Orders: ${orders.length}`, 20, yPos)
  yPos += 10
  doc.text(`Total Javara: ${totalJavara}`, 20, yPos)
  yPos += 10
  doc.text(`Total Return Cans: ${totalReturnCan}`, 20, yPos)
  yPos += 10
  doc.text(`Total Amount: ${formatCurrency(totalAmount)}`, 20, yPos)
  yPos += 10
  doc.text(`Report Date: ${formatDate(new Date())}`, 20, yPos)
  
  yPos += 20
  
  // 주문 목록 (간단한 형태)
  doc.setFontSize(10)
  doc.setFont(undefined, "bold")
  doc.text("Order ID", 20, yPos)
  doc.text("Date", 60, yPos)
  doc.text("Company", 100, yPos)
  doc.text("Amount", 150, yPos)
  
  yPos += 5
  doc.line(20, yPos, pageWidth - 20, yPos)
  yPos += 5
  
  doc.setFont(undefined, "normal")
  
  orders.forEach((orderData, index) => {
    if (yPos > pageHeight - 40) {
      doc.addPage()
      yPos = 40
    }
    
    doc.text(orderData.order.id.slice(-8), 20, yPos)
    doc.text(formatDate(new Date(orderData.order.orderDate)), 60, yPos)
    doc.text(orderData.user.companyName.slice(0, 20), 100, yPos)
    doc.text(formatCurrency(Number(orderData.order.totalAmount)), 150, yPos)
    yPos += 8
  })
  
  // PDF 다운로드
  doc.save(`bulk-invoice-${new Date().toISOString().slice(0, 10)}.pdf`)
}
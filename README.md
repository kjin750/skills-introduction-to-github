# 요소수 주문 관리 시스템

현대적이고 사용하기 쉬운 요소수 주문 관리 웹 애플리케이션입니다.

## 주요 기능

### 🔐 인증 시스템
- **회원가입 및 로그인**: 사업자번호 기반 인증
- **사업자번호 검증**: 실시간 사업자번호 유효성 검사
- **비밀번호 재설정**: 이메일 및 사업자번호 기반 재설정

### 📦 주문 관리
- **주문 등록**: 박스/벌크 포장 선택, 자바라/반납통 수량 설정
- **주문 수정**: 출고 전 주문 내용 수정 가능
- **출고일 선택**: 배송 일정 관리
- **배송 방법 기입**: 다양한 배송 옵션 지원

### 📊 주문 내역 관리
- **전체 주문 조회**: 페이지네이션 지원
- **상태별 필터링**: 대기중, 확인됨, 출고완료, 배송완료, 취소됨
- **기간별 조회**: 시작일/종료일 기반 검색
- **실시간 상태 업데이트**: 주문 진행 상황 추적

### 📄 거래명세서
- **PDF 생성**: 출고 완료된 주문의 거래명세서 자동 생성
- **다운로드**: 브라우저에서 즉시 PDF 다운로드
- **상세 정보**: 주문 정보, 고객 정보, 결제 금액 포함

### 🔔 알림 시스템
- **실시간 알림**: 주문 등록/수정/출고 시 자동 알림
- **알림 센터**: 헤더의 알림 아이콘으로 쉬운 접근
- **읽음 처리**: 개별 및 일괄 읽음 처리 기능

### 📢 공지사항
- **공지사항 조회**: 중요한 업데이트 및 공지사항 확인
- **확장 가능한 UI**: 클릭으로 상세 내용 펼치기/접기

## 기술 스택

### Frontend
- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성을 위한 정적 타입 언어
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **Lucide React**: 아이콘 라이브러리

### Backend
- **Next.js API Routes**: 서버리스 API 엔드포인트
- **Prisma**: 타입 안전한 데이터베이스 ORM
- **PostgreSQL**: 관계형 데이터베이스

### 인증
- **NextAuth.js**: 인증 및 세션 관리
- **bcryptjs**: 비밀번호 해싱

### UI 컴포넌트
- **Radix UI**: 접근성이 뛰어난 컴포넌트 라이브러리
- **class-variance-authority**: 컴포넌트 변형 관리
- **clsx & tailwind-merge**: CSS 클래스 유틸리티

### PDF 생성
- **jsPDF**: 클라이언트 사이드 PDF 생성

## 설치 및 실행

### 환경 요구사항
- Node.js 18 이상
- PostgreSQL 데이터베이스

### 1. 리포지토리 클론
```bash
git clone <repository-url>
cd urea-order-system
```

### 2. 종속성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 설정합니다:

```env
# 데이터베이스
DATABASE_URL="postgresql://username:password@localhost:5432/urea_order_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# 이메일 (선택사항)
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_FROM=""
```

### 4. 데이터베이스 설정
```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev

# (선택사항) 데이터베이스 시드
npx prisma db seed
```

### 5. 개발 서버 실행
```bash
npm run dev
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 데이터베이스 스키마

### 주요 테이블
- **users**: 사용자 정보 (회사명, 사업자번호, 연락처 등)
- **orders**: 주문 정보 (수량, 금액, 상태, 배송정보 등)
- **notices**: 공지사항
- **notifications**: 사용자 알림

### 주문 상태
- `PENDING`: 대기중
- `CONFIRMED`: 확인됨
- `SHIPPED`: 출고완료
- `DELIVERED`: 배송완료
- `CANCELLED`: 취소됨

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── auth/              # 인증 페이지
│   ├── dashboard/         # 대시보드
│   ├── orders/            # 주문 관리
│   └── notices/           # 공지사항
├── components/            # React 컴포넌트
│   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                  # 유틸리티 및 설정
└── types/                # TypeScript 타입 정의
```

## 기여하기

1. 이 리포지토리를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 지원

문제가 발생하거나 기능 요청이 있으시면 GitHub Issues를 통해 알려주세요.
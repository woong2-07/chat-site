# 🗨️ 익명 채팅 사이트

24시간이 지나면 자동으로 삭제되는 익명 채팅 사이트입니다!

## ✨ 주요 기능

- **🌐 공개방**: 누구나 자유롭게 입장 가능한 공개 채팅방
- **🔒 비공개방**: 랜덤 비밀번호로 보호되는 프라이빗 채팅방
- **⏰ 자동 삭제**: 24시간 후 방과 메시지 자동 삭제
- **💬 실시간 채팅**: 익명으로 자유롭게 소통
- **📱 반응형 UI**: 모바일/데스크톱 모두 지원
- **📢 광고 배너**: 수익화 가능한 광고 영역
- **⌨️ 텍스트만 지원**: 이미지는 불가능, 오직 텍스트만 입력 가능

## 🚀 시작하기

### 1. Supabase 설정

[SETUP.md](./SETUP.md)를 따라 Supabase 데이터베이스를 설정하세요.

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음을 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CRON_SECRET=your_secret_key_for_cron_jobs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 개발 서버 시작

```bash
npm install
npm run dev
```

http://localhost:3000 (또는 3001)에서 접속하세요!

## 📂 프로젝트 구조

```
chat-site/
├── app/
│   ├── api/
│   │   ├── cleanup/
│   │   │   └── route.ts         # 24시간 만료 방 삭제 API
│   │   └── cron/
│   │       └── cleanup/
│   │           └── route.ts     # Cron 정기 작업
│   ├── chatComponent.tsx        # 메인 채팅 컴포넌트
│   ├── page.tsx                 # 홈페이지
│   ├── layout.tsx               # 레이아웃
│   └── globals.css              # 전역 스타일
├── lib/
│   ├── supabaseClient.ts        # Supabase 클라이언트 설정
│   └── database.ts              # 데이터베이스 함수들
├── sql/
│   └── schema.sql               # Supabase 테이블 스키마
├── public/                      # 공개 파일
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── vercel.json                  # Vercel Cron 설정
└── SETUP.md                     # 상세 설정 가이드
```

## 💡 사용 예시

### 공개방 만들기
1. 좌측 "🌐 공개방" 영역 → "➕ 공개방 만들기"
2. 방 이름 입력
3. "✓ 만들기" 클릭

### 비공개방 만들기
1. 우측 "🔒 비공개방" 영역 → "➕ 비공개방 만들기"
2. 방 이름 입력
3. 생성 후 표시되는 비밀번호 저장 (6자리 숫자)
4. 비밀번호를 공유하여 다른 사람 초대

### 메시지 전송
1. 방을 클릭하여 입장
2. 텍스트 입력 (이미지는 안 됨)
3. "📤 전송" 버튼 또는 Enter 키로 전송

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js 16 App Router, API Routes
- **Database**: Supabase (PostgreSQL)
- **Real-time**: 폴링 기반 실시간 업데이트 (2-5초 간격)
- **Deployment**: Vercel (Cron Jobs 지원)

## ⏰ 24시간 자동 삭제

모든 방은 생성 후 정확히 24시간 후에 자동으로 삭제됩니다.
- 방의 모든 메시지도 함께 삭제됨
- 방을 삭제할 수 없음 (24시간 대기만 가능)

### 로컬 테스트
```bash
curl -X POST http://localhost:3000/api/cleanup
```

### 프로덕션 배포
Vercel에 배포하면 `vercel.json`의 cron 설정에 따라 매시간 자동 정제됩니다.

## ⚙️ 설정 커스터마이징

### 색상 변경
`app/chatComponent.tsx`에서 Tailwind 클래스 수정:
- `from-blue-500` → 공개방 색상
- `from-purple-500` → 비공개방 색상
- `from-yellow-400` → 광고 색상

### 광고 변경
`app/chatComponent.tsx` 파일의 광고 배너 섹션을 수정하세요:
```tsx
<div className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 ...">
  {/* 여기를 수정 */}
</div>
```

### 업데이트 주기 조정
`app/chatComponent.tsx`의 useEffect에서:
```tsx
const interval = setInterval(loadRooms, 5000); // 5초 → 원하는 시간으로 변경
```

## 🔒 보안 사항

- **Row Level Security (RLS)**: Supabase RLS 정책 적용
- **익명성**: 사용자 ID/IP 저장 안 함
- **API 보안**: 환경 변수로 민감 정보 보호
- **CORS**: 크로스 도메인 요청 관리

⚠️ **현재 구현 주의사항**: 모든 사용자에게 읽기/쓰기 권한을 부여합니다. 
프로덕션에서 스팸/악의적 행동 방지를 원한다면 추가 검증이 필요합니다.

## 📊 성능 최적화

- **메시지 폴링**: 2초 간격 자동 업데이트
- **방 목록 폴링**: 5초 간격 자동 업데이트
- **데이터베이스 인덱스**: 빠른 쿼리 성능
- **자동 스크롤**: 새 메시지 자동 스크롤

## 🚀 배포하기

### Vercel에 배포 (권장)

1. GitHub에 푸시:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Vercel 대시보드에서 Git 저장소 연동

3. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CRON_SECRET` (Cron 작업용)
   - `NEXT_PUBLIC_APP_URL`

4. 배포 완료!

### 다른 플랫폼 배포

Next.js를 지원하는 모든 플랫폼에서 배포 가능합니다:
- Netlify
- AWS Amplify
- Railway
- Render

## 📝 사용 주의사항

⚠️ **금지 사항:**
- ❌ 음담패설 금지
- ❌ 욕설 금지
- ❌ 광고/스팸 금지
- ❌ 불법 내용 금지

✅ **권장 사항:**
- ✓ 존중하는 마음으로 소통
- ✓ 건전한 대화 분위기 조성
- ✓ 개인정보 공유 금지 (익명 유지)

## 🐛 트러블슈팅

| 문제 | 해결 방법 |
|------|---------|
| "Supabase URL이 설정되지 않았습니다" | `.env.local` 파일 생성 후 값 입력 및 서버 재시작 |
| 채팅이 로드되지 않음 | 개발자 도구(F12) → Console에서 오류 확인 |
| 메시지 전송 실패 | 네트워크 연결 확인, Supabase 상태 확인 |
| 포트 3000이 이미 사용 중 | 자동으로 3001 사용, 또는 `lsof -i :3000` 실행 후 프로세스 종료 |

## 📞 지원

- 이슈는 GitHub Issues에 등록해주세요
- PR은 언제나 환영합니다!

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다!

---

**행복한 소통을 기원합니다! 😊**

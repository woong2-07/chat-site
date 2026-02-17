# 🚀 익명 채팅 사이트 설정 가이드

## 프로젝트 개요

익명으로 자유롭게 소통할 수 있는 채팅 사이트입니다.
- ⏰ 24시간 후 자동 삭제
- 🌐 공개방 (자유로운 소통)
- 🔒 비공개방 (랜덤 비밀번호로 보호)
- 📢 광고 배너

---

## 1️⃣ Supabase 설정

### 계정 만들기
1. [supabase.com](https://supabase.com) 방문
2. 회원가입 및 로그인
3. 새 프로젝트 생성 (Region: Singapore 또는 가까운 지역 선택)

### 환경 변수 설정
1. Supabase 대시보드 → Settings → API
2. `NEXT_PUBLIC_SUPABASE_URL` 복사
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 복사
4. `.env.local` 파일에 입력:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## 2️⃣ 데이터베이스 설정

### SQL 스크립트 실행
1. Supabase 대시보드 → SQL Editor
2. "New Query" 클릭
3. `sql/schema.sql` 파일의 코드 전부 복사 + 붙여넣기
4. "Run" 클릭

### 테이블 확인
1. Supabase 대시보드 → Database → Tables
2. `rooms`, `messages` 테이블이 생성되었는지 확인

---

## 3️⃣ 프로젝트 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# http://localhost:3000 접속
```

---

## 📱 기능 사용법

### 공개방 만들기
1. 왼쪽 "공개방" → "➕ 공개방 만들기"
2. 방 이름 입력 후 생성
3. 방을 클릭하여 입장

### 비공개방 만들기
1. 오른쪽 "비공개방" → "➕ 비공개방 만들기"
2. 방 이름 입력 후 생성
3. 랜덤 비밀번호 확인 (팝업에 표시됨)
4. 비밀번호를 공유하여 초대

### 메시지 전송
1. 방에 입장
2. 텍스트 입력
3. "📤 전송" 버튼 클릭 또는 Enter 키

---

## 🛡️ 보안 설정

### RLS (Row Level Security)
- 모든 사용자가 모든 데이터를 읽을 수 있음
- 모든 사용자가 데이터를 생성할 수 있음
- 스팸/악의적 행동은 별도의 관리 시스템이 필요함

---

## 🧹 자동 삭제 설정

### 방법 1: Supabase 함수 호출 (권장)
클라이언트 코드에서 주기적으로:
```typescript
await supabase.rpc('delete_expired_rooms');
```

### 방법 2: Cron 작업
Supabase → Database → Functions → 스케줄 설정
- 시간마다 한 번씩 실행

---

## 🎨 UI 커스터마이징

### 색상 변경
`app/chatComponent.tsx`에서:
- `from-blue-500`: 공개방 색상
- `from-purple-500`: 비공개방 색상
- `bg-yellow-400`: 광고 색상

### 광고 변경
`app/chatComponent.tsx`의 광고 섹션 수정:
```tsx
<div className="fixed bottom-4 right-4 ...">
  {/* 여기를 수정하세요 */}
</div>
```

---

## 📊 성능 최적화

- 메시지 5초마다 자동 갱신
- 방 목록 2초마다 자동 갱신
- 인덱스 설정으로 빠른 쿼리
- 만료된 데이터 자동 삭제

---

## 🚀 배포

### Vercel에 배포
1. GitHub에 푸시
2. Vercel 연동
3. 환경 변수 설정
4. 자동 배포

---

## ❓ 트러블슈팅

### "Supabase URL이 설정되지 않았습니다" 에러
→ `.env.local` 파일 확인 및 재시작

### 데이터가 로드되지 않음
→ Supabase RLS 정책 확인
→ 네트워크 연결 확인

### 메시지가 전송되지 않음
→ 콘솔 오류 확인 (F12 개발자 도구)
→ room_id가 올바른지 확인

---

## 📝 라이선스

자유롭게 수정하여 사용하세요!

---

**행복한 소통을 기원합니다! 😊**

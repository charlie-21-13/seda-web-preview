# 커뮤니티 탭 — 개발자 핸드오프

프로토타입 경로: `workspace/design/index.html` (브라우저에서 직접 열기)

---

## 커뮤니티 메인 (피드)

### 역할
Threads형 세로 피드로 학습자 게시글을 탐색한다. 하단 GNB 5번째 탭(마이 왼쪽)으로 진입한다.

### 구조 (상 → 하)
1. **Top bar** — 기존 SEDA 앱과 동일: 상태바(9:30) + 로고(SEDA) · 스트릭 배지(🔥 1) · 알림 벨
2. **유형 필터 칩** — 전체 · 학습 질문 · 한국 생활 · 취업 정보 (가로 스크롤)
3. **피드** — 게시글 카드 리스트 (최신순, 무한 스크롤은 네이티브에서 구현)
4. **FAB** — 글쓰기 진입 (우하단, GNB 위)
5. **Bottom GNB** — 홈 · 학습 · 활동 · **커뮤니티(활성)** · 마이 / 흰 배경 · 상단 라운드 24px · 비활성 `#94A3B8` · 활성 `#2563EB`

### 게시글 카드 (Threads 레이아웃)
| 영역 | 요소 |
|------|------|
| Header | 아바타(이니셜 fallback) · 닉네임 · 상대 시간 · 유형 배지 · 더보기 |
| Body | 제목(필수) · 본문 미리보기 2줄 말줄임 (**SF Pro Text 14px**, `lang` 속성으로 en/ko 분기) · 번역 보기/원문 보기 |
| Media | 이미지 1장 (선택) |
| Actions | 좋아요(토글) · 댓글 수 · 공유(시각만) |

### 상태
| 상태 | 처리 |
|------|------|
| 기본 | 피드 목록 표시 |
| 필터 적용 | 선택 칩에 맞는 유형만 노출, 빈 목록 시 안내 문구 |
| 번역 ON | 카드 내 본문 인라인 교체, 버튼 → "원문 보기" |
| 좋아요 ON | 하트 filled + Primary/error 컬러, 카운트 ±1 |
| FAB 탭 | 글쓰기 시트(진입만, 전체 화면은 범위 외) |

### 스타일 기준 (SEDA 토큰)
| Token | Value |
|-------|-------|
| primary | `#2563EB` |
| background | `#F9FAFB` |
| card | `#FFFFFF` |
| text-default | `#0F172A` |
| text-sub | `#475569` |
| border | `#E5E7EB` |
| 폰트 (영문 body ≤19px) | SF Pro Text + Pretendard |
| 폰트 (영문 display ≥20px) | Poppins + Pretendard |
| GNB 높이 | 56px + safe-area |
| 카드 radius | 12px |
| 칩 radius | pill (999px) |

유형 배지:
- 학습 질문: bg `#E0F2FE` / text `#0369A1`
- 한국 생활: bg `#FEF3C7` / text `#D97706`
- 취업 정보: bg `#EDE9FE` / text `#6D28D9`

### 엣지케이스
- **프로필 이미지 없음** → 이니셜 아바타 + Primary 계열 배경
- **긴 본문** → 피드에서 2줄 `-webkit-line-clamp: 2`, 상세 화면에서 전체 노출
- **번역** → 카드 높이 고정 금지, 텍스트 길이에 따라 가변
- **11개 언어** → UI 라벨은 i18n, 게시글 원문은 작성 언어 유지
- **이미지 없음** → media 영역 미렌더

### 구현 메모
- **iOS**: `TabView` 5탭, 커뮤니티는 `NavigationStack` + `LazyVStack` 피드, FAB `overlay` alignment `.bottomTrailing`
- **Android**: `Scaffold` + `NavigationBar` 5 destinations, `FloatingActionButton`, 피드는 `LazyColumn`
- 기존 4탭(홈·학습·활동·마이)은 본 프로토타입에서 플레이스홀더만 표시
- 과제 범위 외: 게시글 상세, 글쓰기 전체 화면, 알림, 검색 결과

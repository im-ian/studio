# Studio - Modern Image Editor

Studio는 React 19와 StyleX를 활용하여 구축된 현대적이고 세련된 웹 기반 이미지 에디터입니다. 직관적인 UI와 강력한 편집 기능을 제공하며, 효율적인 성능을 위해 원자적 상태 관리(Jotai)와 고성능 스타일링 엔진(StyleX)을 사용합니다.

## ✨ 주요 기능

### 1. 이미지 선택 및 편집 (Selection & Edit)
- **복합 선택 (Compound Selection)**: 여러 개의 사각형 영역을 선택하여 합치거나 뺄 수 있습니다.
- **마칭 앤츠(Marching Ants) 애니메이션**: 선택된 영역의 경계선을 생동감 있게 표시합니다.
- **클리핑 드로잉(Clipping Drawing)**: 선택된 영역 내부에서만 드로잉이 가능하도록 제한할 수 있습니다.
- **키보드 단축키**: 
  - `Shift`: 선택 영역 추가 (Add mode)
  - `Alt`: 선택 영역 빼기 (Subtract mode)
  - `Esc` / `Backspace`: 선택 취소

### 2. 드로잉 도구 (Drawing Tools)
- **다양한 브러시**: 펜(Pen), 브러시(Brush), 지우개(Eraser) 모드를 지원합니다.
- **도구별 설정**: 각 도구마다 독립적인 브러시 크기와 색상을 기억합니다.
- **배경 삭제 지우개**: 드로잉 레이어뿐만 아니라 원본 이미지 배경까지 지울 수 있는 기능을 제공합니다.
- **실시간 프리뷰**: 브러시 크기와 위치를 캔버스 위에서 실시간으로 확인할 수 있습니다.

### 3. 필터 및 효과 (Filters)
- **원클릭 필터**: 선명하게(Sharpen), 흑백(Grayscale), 세피아(Sepia) 등 자주 사용되는 필터를 즉시 적용할 수 있습니다.

### 4. 사용자 경험 (UX)
- **스페이스바 팬(Pan)**: 스페이스바를 누른 상태에서 마우스 드래그로 캔버스를 자유롭게 이동할 수 있습니다.
- **팬 리셋**: 캔버스 위치가 변경되었을 때 클릭 한 번으로 중앙으로 복귀하는 기능을 제공합니다.
- **세션 복구**: 작업 중이던 내용을 `localStorage`에 자동 저장하고, 다시 방문했을 때 이어서 작업할 수 있습니다.
- **실행 취소(Undo)**: 작업 내역을 관리하여 이전 상태로 되돌릴 수 있습니다.

## 🛠 기술 스택

- **Core**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: StyleX (Facebook's zero-runtime CSS-in-JS)
- **State Management**: Jotai (Atomic state)
- **Icons**: React Feather
- **Linting & Formatting**: Biome

## 🚀 시작하기

### 설치
```bash
yarn install
```

### 로컬 개발 서버 실행
```bash
yarn dev
```

### 빌드
```bash
yarn build
```

## 📁 프로젝트 구조

```text
src/
├── components/
│   ├── features/      # 주요 기능 컴포넌트 (ImageEditor, Toolbar 등)
│   ├── shared/        # 공통 레이아웃 (Header 등)
│   └── ui/            # 기본 UI 컴포넌트 (Button, Modal, Range 등)
├── hooks/             # 커스텀 훅
├── store/             # Jotai 아톰 및 상태 관리 로직
├── tokens.stylex.ts   # StyleX 디자인 토큰
└── App.tsx            # 메인 애플리케이션 진입점
```

---

이 프로젝트는 Vite + React 19 + StyleX를 사용하여 최상의 개발 경험과 성능을 목표로 합니다.

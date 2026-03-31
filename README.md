# inament

Inament demo page implemented in React + Vite.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages 배포

- 워크플로우 파일: `.github/workflows/deploy-pages.yml`
- `main` 브랜치에 push 하면 자동 배포됩니다.
- Vite Pages 빌드 명령: `npm run build:pages` (`/inament/` base 경로 사용)

최초 1회 GitHub 설정:
1. GitHub 저장소 → **Settings** → **Pages**
2. **Build and deployment** 의 Source를 **GitHub Actions** 로 선택

배포 후 URL:
- `https://kurkim0661.github.io/inament/`

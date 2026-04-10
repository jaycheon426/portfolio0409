이 폴더에 이미지를 넣으세요.

중요: HTML·script.js에 적힌 경로와 실제 파일명(확장자·대소문자·한글)이 정확히 같아야 합니다.
파일이 없으면 img onerror로 project-placeholder.svg(또는 avatar)가 대신 보입니다.

프로필
  - profile.jpg 또는 profile.png 를 넣은 뒤 index.html 의 프로필 img src 를 해당 파일명으로 바꾸면 됩니다.
  - 기본값은 avatar.svg (플레이스홀더)입니다.

현재 프로젝트 썸네일 (index.html)
  - taxonomy → images/대시보드1.jpg
  - funnel → images/퍼널분석.jpg
  - segment → images/RFM.jpg
  - market → images/slide-brand-positioning-trimmed.png (여백 자동 트림본)
  - finance-campaign → images/finance-detail-1.jpg
  - beauty-rfm → images/beauty-detail-1.jpg
  - auto-ga → images/auto-ga-detail-1.jpg
  - auto-dashboard → images/화면설계서.jpg
  - commerce-behavior → images/리텐션.jpg
  - sql-samples → images/sql샘플.jpg
  - youtube-api-nlp → images/크롤링1.jpg
  - python-outlier-preprocess → images/이상치제거1.jpg

프로젝트 상세 모달 (script.js PROJECT_MODAL_DATA 의 images 배열)
  - taxonomy: taxonomy-detail-1.jpg, taxonomy-detail-2.jpg
  - funnel: 퍼널분석.jpg, 리텐션2.jpg
  - segment: RFM.jpg, 리포트2.jpg
  - market: slide-brand-positioning-trimmed.png, 대시보드3.jpg
  - finance-campaign: finance-detail-1.jpg, finance-detail-2.jpg
  - beauty-rfm: beauty-detail-1.jpg, beauty-detail-2.jpg
  - auto-ga: auto-ga-detail-1.jpg, auto-ga-detail-2.jpg
  - auto-dashboard: 테이블설계.jpg, 화면설계서.jpg
  - commerce-behavior: 리텐션.jpg, 리텐션2.jpg
  - sql-samples: sql샘플.jpg, SQL3.jpg
  - youtube-api-nlp: project-youtube-nlp.png, 크롤링2.jpg
  - python-outlier-preprocess: 이상치제거1.jpg, 이상치제거2.jpg, 이상치제거3.jpg
  - 파일명·경로는 index.html / script.js 에서 수정할 수 있습니다.
  - 없으면 모달 안에서도 project-placeholder.svg 로 대체됩니다.

슬라이드 캡처 하단·우측 여백 제거
  - 프로젝트 루트에서: python3 scripts/trim_whitespace.py 원본.png 결과.png
  - 여백이 남으면 --fuzz 값을 올려보세요 (예: --fuzz 30). 기본 18.
  - Pillow 필요: python3 -m venv .venv && . .venv/bin/activate && pip install Pillow

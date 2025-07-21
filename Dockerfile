# 빌드
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install

# Jenkins에서 전달받은 빌드 시점 환경변수 설정
ARG VITE_KAKAO_JAVASCRIPT_KEY
ARG VITE_NAVER_CLIENT_ID
ARG VITE_GOOGLE_CLIENT_ID

ENV VITE_KAKAO_JAVASCRIPT_KEY=$VITE_KAKAO_JAVASCRIPT_KEY
ENV VITE_NAVER_CLIENT_ID=$VITE_NAVER_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY . .
RUN npm run build

# 실행
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]

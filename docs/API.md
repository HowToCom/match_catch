# API Specification

Match Catch 백엔드 API 명세서입니다.
본 문서는 실제 백엔드 구현 기준으로 주요 REST API의 요청 방식, 인증 여부, 요청 데이터, 응답 데이터, 주요 예외 상황을 정리합니다.

---

## 1. API 기본 정보

### Base URL

```text
/api
```

로컬 개발 환경 예시:

```text
http://localhost:3000/api
```

---

## 2. 공통 응답 형식

### Success Response

모든 성공 응답은 기본적으로 다음 구조를 따릅니다.

```json
{
  "success": true,
  "message": "요청 처리 성공 메시지",
  "data": {}
}
```

### Error Response

예외 발생 시 다음과 같은 형식으로 응답합니다.

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

---

## 3. 인증 방식

인증이 필요한 API는 JWT Access Token을 사용합니다.

### Header

```http
Authorization: Bearer {access_token}
```

로그인 성공 시 발급받은 `access_token`을 이후 인증 필요 API 요청에 포함해야 합니다.

---

## 4. 상태값 정의

### Lost Item Status

| 상태                | 설명              |
| ----------------- | --------------- |
| `REGISTERED`      | 분실물 등록 완료       |
| `MATCH_REQUESTED` | 매칭 요청 진행 중      |
| `MATCHING`        | 매칭 수락 후 거래 진행 중 |
| `DELIVERED`       | 인도 완료           |

### Found Item Status

| 상태           | 설명              |
| ------------ | --------------- |
| `REGISTERED` | 습득물 등록 완료       |
| `MATCHING`   | 매칭 수락 후 거래 진행 중 |
| `DELIVERED`  | 인도 완료           |

### Match Status

| 상태          | 설명       |
| ----------- | -------- |
| `PENDING`   | 매칭 요청 대기 |
| `ACCEPTED`  | 매칭 요청 수락 |
| `REJECTED`  | 매칭 요청 거절 |
| `DELIVERED` | 인도 완료    |

### Review Type

| 값          | 설명    |
| ---------- | ----- |
| `POSITIVE` | 긍정 후기 |
| `NEGATIVE` | 부정 후기 |

---

# 5. Auth API

## 5.1 회원가입

```http
POST /api/auth/register
```

### Auth

불필요

### Description

학번, 아이디, 비밀번호를 이용하여 회원가입을 수행합니다.
비밀번호는 bcrypt로 암호화되어 저장됩니다.

### Request Body

```json
{
  "student_id": "202600000",
  "username": "user1",
  "password": "1234"
}
```

### Success Response `201 Created`

```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "user_id": 1,
    "student_id": "202600000",
    "username": "user1",
    "temperature": 36.5,
    "created_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 주요 예외

| 상태 코드 | 상황              |
| ----- | --------------- |
| `400` | 입력값 누락 또는 형식 오류 |
| `409` | 중복 학번           |
| `409` | 중복 아이디          |
| `500` | 서버 내부 오류        |

---

## 5.2 로그인

```http
POST /api/auth/login
```

### Auth

불필요

### Description

아이디와 비밀번호를 검증하고, 성공 시 JWT Access Token을 발급합니다.

### Request Body

```json
{
  "username": "user1",
  "password": "1234"
}
```

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "로그인에 성공했습니다.",
  "data": {
    "access_token": "JWT_ACCESS_TOKEN",
    "user_id": 1,
    "username": "user1"
  }
}
```

### 주요 예외

| 상태 코드 | 상황              |
| ----- | --------------- |
| `400` | 입력값 누락          |
| `401` | 아이디 또는 비밀번호 불일치 |
| `500` | 서버 내부 오류        |

---

# 6. Profile API

## 6.1 내 프로필 조회

```http
GET /api/profile/me
```

### Auth

필요

### Description

로그인한 사용자의 프로필 정보를 조회합니다.

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "프로필 조회에 성공했습니다.",
  "data": {
    "user_id": 1,
    "student_id": "202600000",
    "username": "user1",
    "temperature": 36.5
  }
}
```

### 주요 예외

| 상태 코드 | 상황                     |
| ----- | ---------------------- |
| `401` | 인증 토큰 없음 또는 유효하지 않은 토큰 |
| `404` | 사용자 정보 없음              |
| `500` | 서버 내부 오류               |

---

## 6.2 내 프로필 수정

```http
PATCH /api/profile/me
```

### Auth

필요

### Description

로그인한 사용자의 아이디, 학번, 비밀번호를 수정합니다.
비밀번호가 전달된 경우 bcrypt로 암호화하여 저장합니다.

### Request Body

```json
{
  "username": "new_user",
  "student_id": "202600001",
  "password": "new_password"
}
```

### Request Body Rules

| 필드           | 필수 여부 | 설명          |
| ------------ | ----- | ----------- |
| `username`   | 선택    | 변경할 사용자 아이디 |
| `student_id` | 선택    | 변경할 학번      |
| `password`   | 선택    | 변경할 비밀번호    |

하나 이상의 수정 필드가 필요합니다.

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "프로필 수정에 성공했습니다.",
  "data": {
    "user_id": 1,
    "student_id": "202600001",
    "username": "new_user",
    "temperature": 36.5,
    "updated_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 주요 예외

| 상태 코드 | 상황              |
| ----- | --------------- |
| `400` | 수정할 데이터 없음      |
| `401` | 인증 실패           |
| `409` | 중복 아이디 또는 중복 학번 |
| `500` | 서버 내부 오류        |

---

## 6.3 내 활동 내역 조회

```http
GET /api/profile/me/activities
```

### Auth

필요

### Description

로그인한 사용자의 활동 내역을 최신순으로 조회합니다.

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "활동 내역 조회에 성공했습니다.",
  "data": [
    {
      "activity_id": 1,
      "activity_type": "DELIVERY_COMPLETED",
      "description": "매칭 ID 1의 분실물 인도가 완료되었습니다.",
      "created_at": "2026-06-18T00:00:00.000Z"
    }
  ]
}
```

### 주요 예외

| 상태 코드 | 상황       |
| ----- | -------- |
| `401` | 인증 실패    |
| `500` | 서버 내부 오류 |

---

## 6.4 내 온도 조회

```http
GET /api/profile/me/temperature
```

### Auth

필요

### Description

로그인한 사용자의 현재 온도를 조회합니다.

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "온도 조회에 성공했습니다.",
  "data": {
    "user_id": 1,
    "temperature": 36.5
  }
}
```

### 주요 예외

| 상태 코드 | 상황        |
| ----- | --------- |
| `401` | 인증 실패     |
| `404` | 사용자 정보 없음 |
| `500` | 서버 내부 오류  |

---

# 7. Lost Item API

## 7.1 분실물 등록

```http
POST /api/lost-items
```

### Auth

필요

### Content-Type

```http
multipart/form-data
```

### Description

로그인한 사용자가 분실물을 등록합니다.
분실물은 제목, 설명, 특징 키워드, 분실 장소, 분실 시간, 참고 이미지를 포함할 수 있습니다.

### Request Form Data

| 필드              | 타입                | 필수 여부 | 설명         |
| --------------- | ----------------- | ----- | ---------- |
| `title`         | String            | 필수    | 분실물 제목     |
| `description`   | String            | 선택    | 분실물 설명     |
| `keywords`      | JSON Array String | 필수    | 특징 키워드 배열  |
| `lost_location` | String            | 필수    | 분실 장소      |
| `lost_time`     | DateTime          | 필수    | 분실 시간      |
| `image`         | File              | 선택    | 분실물 참고 이미지 |

### Request Example

```text
title=검은색 지갑
description=학생증이 들어있는 검은색 지갑
keywords=["검은색","지갑","학생증"]
lost_location=공학5호관
lost_time=2026-06-18T10:00:00.000Z
image=file
```

### Success Response `201 Created`

```json
{
  "success": true,
  "message": "분실물 등록이 완료되었습니다.",
  "data": {
    "lost_item_id": 1,
    "title": "검은색 지갑",
    "description": "학생증이 들어있는 검은색 지갑",
    "image_url": "/uploads/lost-image.png",
    "lost_location": "공학5호관",
    "lost_time": "2026-06-18T10:00:00.000Z",
    "status": "REGISTERED",
    "keywords": ["검은색", "지갑", "학생증"],
    "created_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 주요 예외

| 상태 코드 | 상황                      |
| ----- | ----------------------- |
| `400` | 제목 누락                   |
| `400` | 키워드 누락 또는 JSON 배열 형식 오류 |
| `400` | 분실 장소 또는 분실 시간 누락       |
| `401` | 인증 실패                   |
| `413` | 파일 용량 초과                |
| `500` | 서버 내부 오류                |

---

## 7.2 분실물 목록 조회

```http
GET /api/lost-items
```

### Auth

필요

### Description

등록된 분실물 목록을 최신순으로 조회합니다.

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "분실물 목록 조회에 성공했습니다.",
  "data": [
    {
      "lost_item_id": 1,
      "title": "검은색 지갑",
      "description": "학생증이 들어있는 검은색 지갑",
      "image_url": "/uploads/lost-image.png",
      "lost_location": "공학5호관",
      "lost_time": "2026-06-18T10:00:00.000Z",
      "status": "REGISTERED",
      "created_at": "2026-06-18T00:00:00.000Z"
    }
  ]
}
```

### 주요 예외

| 상태 코드 | 상황       |
| ----- | -------- |
| `401` | 인증 실패    |
| `500` | 서버 내부 오류 |

---

## 7.3 분실물 상세 조회

```http
GET /api/lost-items/:lost_item_id
```

### Auth

필요

### Description

특정 분실물의 상세 정보를 조회합니다.

### Path Parameter

| 파라미터           | 설명         |
| -------------- | ---------- |
| `lost_item_id` | 조회할 분실물 ID |

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "분실물 상세 조회에 성공했습니다.",
  "data": {
    "lost_item_id": 1,
    "owner_id": 1,
    "title": "검은색 지갑",
    "description": "학생증이 들어있는 검은색 지갑",
    "image_url": "/uploads/lost-image.png",
    "lost_location": "공학5호관",
    "lost_time": "2026-06-18T10:00:00.000Z",
    "status": "REGISTERED",
    "keywords": ["검은색", "지갑", "학생증"],
    "created_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 주요 예외

| 상태 코드 | 상황          |
| ----- | ----------- |
| `401` | 인증 실패       |
| `404` | 존재하지 않는 분실물 |
| `500` | 서버 내부 오류    |

---

## 7.4 분실물 수정

```http
PATCH /api/lost-items/:lost_item_id
```

### Auth

필요

### Content-Type

```http
multipart/form-data
```

### Description

로그인한 사용자가 본인이 등록한 분실물을 수정합니다.
분실물 상태가 `REGISTERED`일 때만 수정할 수 있습니다.

### Path Parameter

| 파라미터           | 설명         |
| -------------- | ---------- |
| `lost_item_id` | 수정할 분실물 ID |

### Request Form Data

| 필드              | 타입                | 필수 여부 | 설명         |
| --------------- | ----------------- | ----- | ---------- |
| `title`         | String            | 선택    | 수정할 제목     |
| `description`   | String            | 선택    | 수정할 설명     |
| `keywords`      | JSON Array String | 선택    | 수정할 키워드 배열 |
| `lost_location` | String            | 선택    | 수정할 분실 장소  |
| `lost_time`     | DateTime          | 선택    | 수정할 분실 시간  |
| `image`         | File              | 선택    | 수정할 이미지    |

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "분실물 수정에 성공했습니다.",
  "data": {
    "lost_item_id": 1,
    "title": "검은색 카드지갑",
    "description": "학생증과 카드가 들어있는 지갑",
    "image_url": "/uploads/lost-image-new.png",
    "lost_location": "공학5호관",
    "lost_time": "2026-06-18T10:00:00.000Z",
    "status": "REGISTERED",
    "keywords": ["검은색", "카드지갑", "학생증"],
    "updated_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 주요 예외

| 상태 코드 | 상황                          |
| ----- | --------------------------- |
| `400` | 수정할 데이터 없음                  |
| `400` | 키워드 형식 오류                   |
| `401` | 인증 실패                       |
| `403` | 본인이 등록한 분실물이 아님             |
| `404` | 존재하지 않는 분실물                 |
| `409` | 매칭 진행 중이거나 인도 완료된 분실물 수정 요청 |
| `500` | 서버 내부 오류                    |

---

## 7.5 유사 습득물 조회

```http
GET /api/lost-items/:lost_item_id/similar-found-items
```

### Auth

필요

### Description

분실물의 특징 키워드와 `REGISTERED` 상태의 습득물 키워드를 비교하여 유사 습득물을 조회합니다.
요청 사용자는 해당 분실물의 등록자여야 합니다.

### Path Parameter

| 파라미터           | 설명            |
| -------------- | ------------- |
| `lost_item_id` | 기준이 되는 분실물 ID |

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "유사 습득물 조회에 성공했습니다.",
  "data": [
    {
      "found_item_id": 3,
      "image_url": "/uploads/found-image.png",
      "description": "검은색 지갑",
      "found_location": "공학5호관 1층",
      "found_time": "2026-06-18T11:00:00.000Z",
      "status": "REGISTERED",
      "similarity_score": 0.67,
      "matched_keywords": ["검은색", "지갑"]
    }
  ]
}
```

### 주요 예외

| 상태 코드 | 상황              |
| ----- | --------------- |
| `401` | 인증 실패           |
| `403` | 본인이 등록한 분실물이 아님 |
| `404` | 존재하지 않는 분실물     |
| `500` | 서버 내부 오류        |

---

# 8. Found Item API

## 8.1 습득물 등록

```http
POST /api/found-items
```

### Auth

필요

### Content-Type

```http
multipart/form-data
```

### Description

로그인한 사용자가 습득물을 등록합니다.
습득물 등록 시 이미지는 필수이며, 이미지 분석 결과를 기반으로 특징 키워드를 저장합니다.

### Request Form Data

| 필드               | 타입                | 필수 여부 | 설명                  |
| ---------------- | ----------------- | ----- | ------------------- |
| `image`          | File              | 필수    | 습득물 이미지             |
| `description`    | String            | 선택    | 습득물 설명              |
| `found_location` | String            | 필수    | 습득 장소               |
| `found_time`     | DateTime          | 필수    | 습득 시간               |
| `keywords`       | JSON Array String | 선택    | 프론트에서 미리 분석한 키워드 배열 |

### Success Response `201 Created`

```json
{
  "success": true,
  "message": "습득물 등록이 완료되었습니다.",
  "data": {
    "found_item_id": 1,
    "image_url": "/uploads/found-image.png",
    "description": "검은색 지갑으로 보입니다.",
    "found_location": "공학5호관 1층",
    "found_time": "2026-06-18T11:00:00.000Z",
    "status": "REGISTERED",
    "ai_status": "SUCCESS",
    "keywords": ["검은색", "지갑", "카드지갑"],
    "created_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 주요 예외

| 상태 코드 | 상황                |
| ----- | ----------------- |
| `400` | 이미지 누락            |
| `400` | 습득 장소 또는 습득 시간 누락 |
| `401` | 인증 실패             |
| `413` | 파일 용량 초과          |
| `500` | 서버 내부 오류          |

---

## 8.2 습득물 목록 조회

```http
GET /api/found-items
```

### Auth

필요

### Description

등록된 습득물 목록을 최신순으로 조회합니다.

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "습득물 목록 조회에 성공했습니다.",
  "data": [
    {
      "found_item_id": 1,
      "image_url": "/uploads/found-image.png",
      "description": "검은색 지갑으로 보입니다.",
      "found_location": "공학5호관 1층",
      "found_time": "2026-06-18T11:00:00.000Z",
      "status": "REGISTERED",
      "ai_status": "SUCCESS",
      "created_at": "2026-06-18T00:00:00.000Z"
    }
  ]
}
```

### 주요 예외

| 상태 코드 | 상황       |
| ----- | -------- |
| `401` | 인증 실패    |
| `500` | 서버 내부 오류 |

---

## 8.3 습득물 상세 조회

```http
GET /api/found-items/:found_item_id
```

### Auth

필요

### Description

특정 습득물의 상세 정보를 조회합니다.

### Path Parameter

| 파라미터            | 설명         |
| --------------- | ---------- |
| `found_item_id` | 조회할 습득물 ID |

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "습득물 상세 조회에 성공했습니다.",
  "data": {
    "found_item_id": 1,
    "owner_id": 2,
    "image_url": "/uploads/found-image.png",
    "description": "검은색 지갑으로 보입니다.",
    "found_location": "공학5호관 1층",
    "found_time": "2026-06-18T11:00:00.000Z",
    "status": "REGISTERED",
    "ai_status": "SUCCESS",
    "created_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 주요 예외

| 상태 코드 | 상황          |
| ----- | ----------- |
| `401` | 인증 실패       |
| `404` | 존재하지 않는 습득물 |
| `500` | 서버 내부 오류    |

---

## 8.4 습득물 수정

```http
PATCH /api/found-items/:found_item_id
```

### Auth

필요

### Content-Type

```http
multipart/form-data
```

### Description

로그인한 사용자가 본인이 등록한 습득물을 수정합니다.
습득물 상태가 `REGISTERED`일 때만 수정할 수 있습니다.

### Path Parameter

| 파라미터            | 설명         |
| --------------- | ---------- |
| `found_item_id` | 수정할 습득물 ID |

### Request Form Data

| 필드               | 타입       | 필수 여부 | 설명        |
| ---------------- | -------- | ----- | --------- |
| `description`    | String   | 선택    | 수정할 설명    |
| `found_location` | String   | 선택    | 수정할 습득 장소 |
| `found_time`     | DateTime | 선택    | 수정할 습득 시간 |
| `image`          | File     | 선택    | 수정할 이미지   |

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "습득물 수정에 성공했습니다.",
  "data": {
    "found_item_id": 1,
    "image_url": "/uploads/found-image-new.png",
    "description": "검은색 카드지갑으로 보입니다.",
    "found_location": "공학5호관 1층",
    "found_time": "2026-06-18T11:00:00.000Z",
    "status": "REGISTERED",
    "ai_status": "PENDING",
    "updated_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 주요 예외

| 상태 코드 | 상황                          |
| ----- | --------------------------- |
| `400` | 수정할 데이터 없음                  |
| `401` | 인증 실패                       |
| `403` | 본인이 등록한 습득물이 아님             |
| `404` | 존재하지 않는 습득물                 |
| `409` | 매칭 진행 중이거나 인도 완료된 습득물 수정 요청 |
| `500` | 서버 내부 오류                    |

---

# 9. AI API

## 9.1 이미지 분석

```http
POST /api/ai/analyze
```

### Auth

필요

### Content-Type

```http
application/json
```

### Description

base64 이미지 데이터를 OpenAI API로 분석하여 물건명, 설명, 특징 키워드를 추출합니다.
프론트엔드에서 분실물 또는 습득물 등록 양식을 자동완성할 때 사용할 수 있습니다.

### Request Body

```json
{
  "image": "BASE64_IMAGE_STRING",
  "mime_type": "image/jpeg"
}
```

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "이미지 분석 성공",
  "data": {
    "object_name": "검은색 지갑",
    "general_keywords": ["지갑", "검은색"],
    "unique_keywords": ["카드지갑", "학생증"],
    "description": "검은색 카드지갑으로 보입니다.",
    "title": "검은색 지갑",
    "keywords": "지갑, 검은색, 카드지갑, 학생증"
  }
}
```

### 주요 예외

| 상태 코드 | 상황                   |
| ----- | -------------------- |
| `400` | 이미지 데이터 누락           |
| `401` | 인증 실패                |
| `500` | AI 분석 실패 또는 서버 내부 오류 |

---

# 10. Match API

## 10.1 매칭 요청

```http
POST /api/matches
```

### Auth

필요

### Description

분실자가 유사 습득물에 대해 매칭 요청을 생성합니다.
요청자는 해당 분실물의 등록자여야 하며, 본인이 등록한 습득물에는 매칭 요청할 수 없습니다.

### Request Body

```json
{
  "lost_item_id": 1,
  "found_item_id": 3
}
```

### Success Response `201 Created`

```json
{
  "success": true,
  "message": "매칭 요청이 완료되었습니다.",
  "data": {
    "match_id": 1,
    "lost_item_id": 1,
    "found_item_id": 3,
    "requester_id": 1,
    "receiver_id": 2,
    "status": "PENDING",
    "created_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 상태 변화

| 대상        | 변경                             |
| --------- | ------------------------------ |
| Match     | `PENDING` 생성                   |
| Lost Item | `REGISTERED → MATCH_REQUESTED` |

### 주요 예외

| 상태 코드 | 상황                  |
| ----- | ------------------- |
| `400` | 분실물 ID 또는 습득물 ID 누락 |
| `400` | 본인이 등록한 습득물에 요청     |
| `401` | 인증 실패               |
| `403` | 본인이 등록한 분실물이 아님     |
| `404` | 분실물 또는 습득물 없음       |
| `409` | 이미 진행 중인 매칭 요청 존재   |
| `409` | 매칭 요청이 불가능한 상태      |
| `500` | 서버 내부 오류            |

---

## 10.2 내 매칭 목록 조회

```http
GET /api/matches
```

### Auth

필요

### Description

로그인한 사용자가 요청자 또는 수신자로 포함된 매칭 목록을 조회합니다.

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "매칭 목록 조회에 성공했습니다.",
  "data": [
    {
      "match_id": 1,
      "status": "PENDING",
      "lost_item": {
        "lost_item_id": 1,
        "title": "검은색 지갑",
        "description": "학생증이 들어있는 지갑",
        "status": "MATCH_REQUESTED"
      },
      "found_item": {
        "found_item_id": 3,
        "image_url": "/uploads/found-image.png",
        "description": "검은색 지갑",
        "status": "REGISTERED"
      },
      "requester": {
        "user_id": 1,
        "username": "lost_user"
      },
      "receiver": {
        "user_id": 2,
        "username": "found_user"
      },
      "chat_room_id": null,
      "created_at": "2026-06-18T00:00:00.000Z"
    }
  ]
}
```

### 주요 예외

| 상태 코드 | 상황       |
| ----- | -------- |
| `401` | 인증 실패    |
| `500` | 서버 내부 오류 |

---

## 10.3 매칭 상세 조회

```http
GET /api/matches/:match_id
```

### Auth

필요

### Description

특정 매칭의 상세 정보를 조회합니다.
매칭 요청자 또는 수신자만 조회할 수 있습니다.

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "매칭 상세 조회에 성공했습니다.",
  "data": {
    "match_id": 1,
    "status": "PENDING",
    "lost_item": {
      "lost_item_id": 1,
      "title": "검은색 지갑",
      "description": "학생증이 들어있는 지갑",
      "status": "MATCH_REQUESTED"
    },
    "found_item": {
      "found_item_id": 3,
      "image_url": "/uploads/found-image.png",
      "description": "검은색 지갑",
      "status": "REGISTERED"
    },
    "requester": {
      "user_id": 1,
      "username": "lost_user"
    },
    "receiver": {
      "user_id": 2,
      "username": "found_user"
    },
    "chat_room_id": null,
    "created_at": "2026-06-18T00:00:00.000Z",
    "updated_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 주요 예외

| 상태 코드 | 상황         |
| ----- | ---------- |
| `401` | 인증 실패      |
| `403` | 거래 당사자가 아님 |
| `404` | 존재하지 않는 매칭 |
| `500` | 서버 내부 오류   |

---

## 10.4 매칭 수락

```http
PATCH /api/matches/:match_id/accept
```

### Auth

필요

### Description

습득자가 받은 매칭 요청을 수락합니다.
매칭 요청이 수락되면 분실물과 습득물 상태가 `MATCHING`으로 변경되고, 채팅방이 생성됩니다.

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "매칭 요청을 수락했습니다.",
  "data": {
    "match_id": 1,
    "lost_item_id": 1,
    "found_item_id": 3,
    "requester_id": 1,
    "receiver_id": 2,
    "status": "ACCEPTED",
    "chat_room_id": 1,
    "updated_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 상태 변화

| 대상         | 변경                           |
| ---------- | ---------------------------- |
| Match      | `PENDING → ACCEPTED`         |
| Lost Item  | `MATCH_REQUESTED → MATCHING` |
| Found Item | `REGISTERED → MATCHING`      |
| Chat Room  | 생성                           |

### 주요 예외

| 상태 코드 | 상황                    |
| ----- | --------------------- |
| `401` | 인증 실패                 |
| `403` | 매칭 요청을 받은 사용자가 아님     |
| `404` | 존재하지 않는 매칭            |
| `409` | 수락할 수 없는 매칭 상태        |
| `409` | 분실물 또는 습득물 상태가 수락 불가능 |
| `500` | 서버 내부 오류              |

---

## 10.5 매칭 거절

```http
PATCH /api/matches/:match_id/reject
```

### Auth

필요

### Description

습득자가 받은 매칭 요청을 거절합니다.
매칭 요청이 거절되면 매칭 상태는 `REJECTED`가 되고, 분실물은 다시 `REGISTERED` 상태로 되돌아갑니다.

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "매칭 요청을 거절했습니다.",
  "data": {
    "match_id": 1,
    "lost_item_id": 1,
    "found_item_id": 3,
    "requester_id": 1,
    "receiver_id": 2,
    "status": "REJECTED",
    "updated_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 상태 변화

| 대상         | 변경                             |
| ---------- | ------------------------------ |
| Match      | `PENDING → REJECTED`           |
| Lost Item  | `MATCH_REQUESTED → REGISTERED` |
| Found Item | 변경 없음                          |

### 주요 예외

| 상태 코드 | 상황                |
| ----- | ----------------- |
| `401` | 인증 실패             |
| `403` | 매칭 요청을 받은 사용자가 아님 |
| `404` | 존재하지 않는 매칭        |
| `409` | 거절할 수 없는 매칭 상태    |
| `500` | 서버 내부 오류          |

---

## 10.6 인도 완료 처리

```http
PATCH /api/matches/:match_id/deliver
```

### Auth

필요

### Description

거래 당사자가 물건 인도 완료를 처리합니다.
인도 완료 시 매칭, 분실물, 습득물 상태가 모두 `DELIVERED`로 변경되며 양쪽 사용자 활동 내역이 생성됩니다.

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "인도 완료 처리되었습니다.",
  "data": {
    "match_id": 1,
    "lost_item_id": 1,
    "found_item_id": 3,
    "requester_id": 1,
    "receiver_id": 2,
    "status": "DELIVERED",
    "updated_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 상태 변화

| 대상         | 변경                     |
| ---------- | ---------------------- |
| Match      | `ACCEPTED → DELIVERED` |
| Lost Item  | `MATCHING → DELIVERED` |
| Found Item | `MATCHING → DELIVERED` |
| Activity   | 양쪽 사용자 활동 내역 생성        |

### 주요 예외

| 상태 코드 | 상황                       |
| ----- | ------------------------ |
| `401` | 인증 실패                    |
| `403` | 거래 당사자가 아님               |
| `404` | 존재하지 않는 매칭               |
| `409` | 인도 완료할 수 없는 매칭 상태        |
| `409` | 분실물 또는 습득물 상태가 인도 완료 불가능 |
| `500` | 서버 내부 오류                 |

---

# 11. Chat API

## 11.1 메시지 전송

```http
POST /api/chat-rooms/:chat_room_id/messages
```

### Auth

필요

### Description

채팅방에 메시지를 전송합니다.
해당 채팅방의 거래 당사자만 메시지를 보낼 수 있습니다.

### Path Parameter

| 파라미터           | 설명     |
| -------------- | ------ |
| `chat_room_id` | 채팅방 ID |

### Request Body

```json
{
  "message": "언제 어디서 받을 수 있을까요?"
}
```

### Success Response `201 Created`

```json
{
  "success": true,
  "message": "메시지 전송에 성공했습니다.",
  "data": {
    "message_id": 1,
    "chat_room_id": 1,
    "sender_id": 1,
    "message": "언제 어디서 받을 수 있을까요?",
    "created_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 주요 예외

| 상태 코드 | 상황                 |
| ----- | ------------------ |
| `400` | 메시지 내용 누락          |
| `401` | 인증 실패              |
| `403` | 채팅방 참여자가 아님        |
| `404` | 존재하지 않는 채팅방        |
| `409` | 채팅을 사용할 수 없는 매칭 상태 |
| `500` | 서버 내부 오류           |

---

## 11.2 메시지 목록 조회

```http
GET /api/chat-rooms/:chat_room_id/messages
```

### Auth

필요

### Description

채팅방의 메시지 목록을 조회합니다.
커서 기반 페이지네이션을 지원합니다.

### Query Parameters

| 파라미터     | 필수 여부 | 설명                         |
| -------- | ----- | -------------------------- |
| `cursor` | 선택    | 마지막으로 조회한 메시지 ID           |
| `size`   | 선택    | 조회할 메시지 개수, 기본값 20, 최대 100 |

### Request Example

```http
GET /api/chat-rooms/1/messages?size=20&cursor=50
```

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "메시지 목록 조회에 성공했습니다.",
  "data": {
    "messages": [
      {
        "message_id": 1,
        "chat_room_id": 1,
        "sender_id": 1,
        "message": "언제 어디서 받을 수 있을까요?",
        "created_at": "2026-06-18T00:00:00.000Z"
      }
    ],
    "next_cursor": 1,
    "has_next": false
  }
}
```

### 주요 예외

| 상태 코드 | 상황                 |
| ----- | ------------------ |
| `400` | 잘못된 페이지네이션 값       |
| `401` | 인증 실패              |
| `403` | 채팅방 참여자가 아님        |
| `404` | 존재하지 않는 채팅방        |
| `409` | 채팅을 사용할 수 없는 매칭 상태 |
| `500` | 서버 내부 오류           |

---

# 12. Review API

## 12.1 후기 작성

```http
POST /api/reviews
```

### Auth

필요

### Description

인도 완료된 매칭에 대해 거래 상대방에게 후기를 작성합니다.
후기 유형에 따라 대상 사용자의 온도가 변경됩니다.

### Request Body

```json
{
  "match_id": 1,
  "target_user_id": 2,
  "review_type": "POSITIVE",
  "content": "친절하게 물건을 돌려주셨습니다."
}
```

### Request Body Rules

| 필드               | 필수 여부 | 설명                       |
| ---------------- | ----- | ------------------------ |
| `match_id`       | 필수    | 후기 대상 매칭 ID              |
| `target_user_id` | 필수    | 후기 대상 사용자 ID             |
| `review_type`    | 필수    | `POSITIVE` 또는 `NEGATIVE` |
| `content`        | 선택    | 후기 내용                    |

### Success Response `201 Created`

```json
{
  "success": true,
  "message": "후기 작성이 완료되었습니다.",
  "data": {
    "review_id": 1,
    "match_id": 1,
    "writer_id": 1,
    "target_user_id": 2,
    "review_type": "POSITIVE",
    "content": "친절하게 물건을 돌려주셨습니다.",
    "temperature_change": 5,
    "target_user_temperature": 41.5,
    "created_at": "2026-06-18T00:00:00.000Z"
  }
}
```

### 주요 예외

| 상태 코드 | 상황              |
| ----- | --------------- |
| `400` | 필수값 누락          |
| `400` | 후기 유형 오류        |
| `400` | 자기 자신에게 후기 작성   |
| `401` | 인증 실패           |
| `403` | 거래 당사자가 아님      |
| `404` | 존재하지 않는 매칭      |
| `409` | 인도 완료 전 후기 작성   |
| `409` | 이미 해당 거래에 후기 작성 |
| `500` | 서버 내부 오류        |

---

# 13. Health Check

## 13.1 서버 상태 확인

```http
GET /health
```

### Auth

불필요

### Description

백엔드 서버가 정상 실행 중인지 확인합니다.

### Success Response `200 OK`

```json
{
  "success": true,
  "message": "Lost Found Backend Server is running"
}
```

---

# 14. API Test Scenario

Postman 테스트는 다음 순서로 진행하는 것을 권장합니다.

```text
1. 회원가입 - 분실자 계정
2. 회원가입 - 습득자 계정
3. 분실자 로그인 및 JWT 발급
4. 습득자 로그인 및 JWT 발급
5. 습득자 습득물 등록
6. 분실자 분실물 등록
7. 분실자 유사 습득물 조회
8. 분실자 매칭 요청
9. 습득자 매칭 목록 조회
10. 습득자 매칭 수락 또는 거절
11. 매칭 수락 시 채팅방 생성 확인
12. 채팅 메시지 전송
13. 채팅 메시지 목록 조회
14. 인도 완료 처리
15. 후기 작성
16. 온도 변경 및 활동 내역 확인
```

---

# 15. Notes

* 인증 필요 API는 반드시 `Authorization: Bearer {access_token}` 헤더를 포함해야 합니다.
* 이미지 업로드가 포함된 API는 `multipart/form-data` 형식을 사용합니다.
* `keywords`는 JSON 배열 문자열 형태로 전달합니다.
* 분실물과 습득물 수정은 `REGISTERED` 상태에서만 가능합니다.
* 매칭 수락 후 채팅방이 생성됩니다.
* 채팅은 매칭 상태가 `ACCEPTED`일 때만 사용할 수 있습니다.
* 인도 완료 이후 후기 작성이 가능합니다.
* 후기 작성 결과에 따라 대상 사용자의 온도가 변경됩니다.

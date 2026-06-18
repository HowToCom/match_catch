const fs = require("fs");
const OpenAI = require("openai");

const AppError = require("../utils/AppError");

const MODEL = process.env.OPENAI_MODEL || "gpt-4.1";

const PROMPT = `
당신은 분실물 분석 전문 AI이다.
사진 속 물건을 분석하고 반드시 JSON 형식으로만 응답하라.
{
  "object_name": "",
  "general_keywords": [],
  "unique_keywords": [],
  "description": ""
}
규칙:
1. object_name
- 가능한 한 구체적인 물건명을 작성
2. general_keywords
- 브랜드
- 제품 종류
- 색상
- 형태
- 재질
- 용도
등의 일반 특징을 추출
3. unique_keywords
- 긁힘
- 찍힘
- 마모
- 균열
- 변색
- 먼지
- 오염
- 스티커
- 각인
- 사용 흔적
등 개체 식별에 도움이 되는 특징을 최대한 자세히 추출
4. description
- 사람이 분실물을 찾는 데 도움이 되도록 자연어로 설명
5. 한국어 사용
6. 특징이 명확히 보이지 않으면 추측하지 말 것
`;

let client = null;

function getClient() {
  if (client) {
    return client;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AppError("OPENAI_API_KEY가 설정되지 않았습니다.", 500);
  }

  client = new OpenAI({ apiKey });
  return client;
}

function extractJson(text) {
  if (!text) {
    return null;
  }

  let cleaned = text.trim();

  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    return null;
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (err) {
    return null;
  }
}

function normalize(parsed) {
  const toArray = (value) =>
    Array.isArray(value)
      ? value.map((item) => String(item).trim()).filter(Boolean)
      : [];

  return {
    object_name: parsed.object_name ? String(parsed.object_name).trim() : "",
    general_keywords: toArray(parsed.general_keywords),
    unique_keywords: toArray(parsed.unique_keywords),
    description: parsed.description ? String(parsed.description).trim() : "",
  };
}

async function analyzeImageBase64(base64Image, mimeType = "image/jpeg") {
  if (!base64Image) {
    throw new AppError("이미지 데이터가 없습니다.", 400);
  }

  const openai = getClient();

  let response;

  try {
    response = await openai.responses.create({
      model: MODEL,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: PROMPT },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${base64Image}`,
            },
          ],
        },
      ],
    });
  } catch (err) {
    throw new AppError("AI 이미지 분석 요청에 실패했습니다.", 502);
  }

  const parsed = extractJson(response.output_text);

  if (!parsed) {
    throw new AppError("AI 응답을 해석하지 못했습니다.", 502);
  }

  return normalize(parsed);
}

async function analyzeImageFile(filePath, mimeType = "image/jpeg") {
  const buffer = await fs.promises.readFile(filePath);
  const base64Image = buffer.toString("base64");
  return analyzeImageBase64(base64Image, mimeType);
}

module.exports = {
  analyzeImageBase64,
  analyzeImageFile,
};

import { config } from '../config.js';
import { badRequest } from '../lib/httpError.js';

const extractJsonPayload = (str) => {
  const cleaned = String(str || '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const start = cleaned.search(/[\{\[]/);
  if (start === -1) return '';

  const openChar = cleaned[start];
  const closeChar = openChar === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < cleaned.length; index += 1) {
    const char = cleaned[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return cleaned.slice(start, index + 1);
    }
  }

  return '';
};

const parseAiJson = (content) => {
  const payload = extractJsonPayload(content);
  if (!payload) {
    throw badRequest('AI 返回内容不是合法 JSON');
  }

  try {
    return JSON.parse(payload);
  } catch (error) {
    throw badRequest('AI 返回 JSON 解析失败', error.message);
  }
};

export const generateHealthGuidance = async (patientPayload) => {
  if (!config.ai.apiKey) {
    throw badRequest('服务端未配置 AI_API_KEY');
  }

  const systemPrompt = '你是一名严谨的健康管理顾问，需要基于真实检测数据给出科学、温和、可执行的生活方式建议。你不是临床诊断医生，不输出诊断结论，不夸大风险，不编造不存在的数据。只返回 JSON。';
  const userPrompt = `请根据以下用户健康档案，生成更完整的健康建议、饮食指南和运动建议。

返回 JSON 结构如下：
{
  "summary": "1段 40-80 字的综合结论",
  "healthAdvice": [
    { "title": "", "text": "" }
  ],
  "dietAdvice": [
    { "title": "", "text": "" }
  ],
  "exerciseAdvice": [
    { "title": "", "text": "" }
  ],
  "dietTags": ["", ""]
}

要求：
1. 必须结合用户所有可见资料，包括基础信息、睡眠、自律神经、人体成分、肥胖分析、综合评分、异常项。
2. healthAdvice、dietAdvice、exerciseAdvice 每类返回 4-6 条，内容具体，可执行，避免空泛。
3. 每条 text 控制在 45-100 字之间，明确频率、时长、控制方式或注意事项。
4. 若某项数据缺失，只能依据已有数据保守建议，不能编造检验结果。
5. dietTags 返回 3-6 个短标签，例如“控糖控油”“规律三餐”“优质蛋白”。
6. 严格返回合法 JSON，不要 markdown，不要解释文字。

用户健康档案如下：
${JSON.stringify(patientPayload)}`;

  const response = await fetch(`${config.ai.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.ai.apiKey}`
    },
    body: JSON.stringify({
      model: config.ai.model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw badRequest(`AI 服务异常: ${errorData.error?.message || errorData.msg || response.statusText}`);
  }

  const responseData = await response.json();
  const content = responseData?.choices?.[0]?.message?.content;
  if (!content) {
    throw badRequest('AI 返回为空');
  }

  return {
    parsed: parseAiJson(content),
    raw: responseData
  };
};

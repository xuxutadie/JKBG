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
  const userPrompt = `请根据以下用户健康档案，生成更完整、更详细、彼此有关联的健康建议、饮食指南和运动建议。

返回 JSON 结构如下：
{
  "summary": "1段 80-160 字的综合结论，需要明确指出主要风险点以及数据之间的关联",
  "crossAnalysis": [
    { "title": "", "text": "" }
  ],
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
1. 必须结合用户所有可见资料，包括基础信息、生化指标(如血糖、血压、血脂、尿酸)、睡眠、自律神经、人体成分、肥胖分析、综合评分、异常项。
2. 必须体现“数据之间的关联性”，不能把每项数据孤立解读。例如要说明睡眠不足如何影响血糖/血压，体脂偏高如何影响血脂和运动策略，压力偏高如何影响恢复和代谢。
3. crossAnalysis 返回 3-5 条，每条都要明确引用至少 2 类不同来源的数据，并说明它们之间的联系与风险意义。
4. healthAdvice、dietAdvice、exerciseAdvice 每类返回 5-6 条，内容具体、完整、可执行，避免空泛。
5. 针对异常的生化指标(如高血糖、高血压、高尿酸、高血脂等)，必须给出针对性的饮食禁忌、监测建议、运动注意事项，并说明和体脂、BMI、睡眠、压力之间的联动影响。
6. 每条 text 控制在 70-160 字之间，明确频率、时长、控制方式、适用前提或注意事项。
7. 若某项数据缺失，只能依据已有数据保守建议，不能编造检验结果；若能判断风险趋势，也要说明判断依据来自哪些已知数据。
8. dietTags 返回 4-8 个短标签，例如“控糖控油”“规律三餐”“优质蛋白”“低嘌呤”“限盐管理”。
9. 严格返回合法 JSON，不要 markdown，不要解释文字。

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

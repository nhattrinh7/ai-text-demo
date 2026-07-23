import { defineAgent } from 'eve';
import { openai } from '@ai-sdk/openai';

export default defineAgent({
  model: openai('gpt-4o'),
  modelContextWindowTokens: 200000,
  // lịch sử chat chiếm 75% context window là nén luôn cho thoáng, tránh việc
  // lỡ có 1 turn dài làm tràn bất ngờ, tuy nhiên nén sớm và thường xuyên hơn
  // có thể gây mất các chi tiết nhỏ trong các turn cũ nhanh hơnc
  compaction: {
    thresholdPercent: 0.75, // default 0.9
  },
  // cấu hình giới hạn token mà 1 session được xài
  // model đang xử lí mà bị vượt quá thì vẫn được chạy nốt cho xong
  // Khi chạm limit, nếu có user để hỏi thì cho họ chọn Continue hay Stop
  // còn ko có user để hỏi thì báo lỗi SESSION_TOKEN_LIMIT_REACHED
  // ở lần gọi model tiếp theo.
  limits: {
    maxInputTokensPerSession: 128_000,
    maxOutputTokensPerSession: 20_000,
  },
  // modelOptions:,
  // experimental:,
  // outputSchema:,
  // build:,
});

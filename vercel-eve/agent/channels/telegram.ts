import { telegramChannel } from 'eve/channels/telegram';

export default telegramChannel({
  // Tên bot của bạn, cấu hình sau khi có token
  botUsername: 'nhat_rag_bot',

  // Cấu hình Upload Policy: Cho phép user upload file PDF, hình ảnh, văn bản
  uploadPolicy: {
    maxBytes: 20 * 1024 * 1024, // Giới hạn 20MB
    allowedMediaTypes: [
      'image/*',
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/octet-stream',
    ],
  },

  // Cấu hình onCallbackQuery nếu có các nút tự chế ngoài framework (Tùy chọn)
  // async onCallbackQuery(query, telegram) { ... }
});

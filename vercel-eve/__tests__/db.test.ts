import { describe, it, expect } from 'vitest';
import { prisma } from '../lib/prisma';

describe('Database Integration Tests', () => {
  it('should fetch the real user and verify the number of chats', async () => {

    const user = await prisma.user.findUnique({
      where: { email: 'trinhminhnhatym@gmail.com' },
      include: {
        conversations: true, // Lấy luôn danh sách các đoạn chat của user này
      },
    });

    // 1. Xác nhận User thực sự tồn tại trong DB
    expect(user).not.toBeNull();
    expect(user?.email).toBe('trinhminhnhatym@gmail.com');

    // 2. Mật khẩu thực sự tồn tại (đã mã hóa)
    expect(user?.password).toBeDefined();

    // 3. Xác nhận số lượng đoạn chat hiện tại đúng bằng 3
    expect(user?.conversations.length).toBe(3);
  });
});

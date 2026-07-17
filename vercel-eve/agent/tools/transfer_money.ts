import { defineTool } from 'eve/tools';
import { z } from 'zod';

export default defineTool({
  description: 'Transfer money from one account to another.',

  inputSchema: z.object({
    fromAccount: z.string().describe('The source account.'),
    toAccount: z.string().describe('The destination account.'),
    amount: z.number().positive().describe('The amount of money to transfer.'),
  }),

  // Duyệt có điều kiện: CHỈ bắt người dùng duyệt nếu số tiền lớn hơn 1000$
  // Nếu <= 1000$, tool sẽ tự động chạy mà không cần duyệt.
  approval: ({ toolInput }) => (toolInput?.amount ?? 0) > 1000,

  async execute({ fromAccount, toAccount, amount }) {
    // Đây chỉ là mock (giả lập) việc chuyển tiền thành công
    return {
      status: 'success',
      message: `Đã chuyển khoản thành công $${amount} từ tài khoản [${fromAccount}] đến [${toAccount}].`,
    };
  },
}); 

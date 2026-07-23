// Bộ não của Vitest, chỉ cho nó phải test thế nào trong môi trường
// Nextjs, Reactjs

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()], // bật tính năng hiểu có pháp JSX/React
  test: {
    environment: 'jsdom', // giả lập trình duyệt
    setupFiles: ['./vitest.setup.ts'], // chạy file setup trước khi bắt đầu test
    globals: true, // cho phép dùng các hàm như test, describe có sẵn không cần import (dù trong code file test mình vẫn import cho tường minh)
    alias: {
      '@': path.resolve(__dirname, './'), // cấu hình đường dẫn
    },
  },
});

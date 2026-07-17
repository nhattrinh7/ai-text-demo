// Script helper
/*
GHI CHÚ:
Thư mục 'scripts' thường chứa các đoạn mã nguồn phụ trợ, tiện ích (utilities) hoặc các bash script 
phục vụ cho riêng Skill này. Ví dụ, một hàm mã hóa dữ liệu trước khi truy vấn, hoặc một script 
để migration database. Các agent có thể được cấu hình để gọi hoặc phân tích các file trong này.
*/

export function formatQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ');
}

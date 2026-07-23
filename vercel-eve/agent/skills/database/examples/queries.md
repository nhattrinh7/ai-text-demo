# Query Examples

<!--
GHI CHÚ:
Thư mục 'examples' được dùng để chứa các mẫu tham khảo, ví dụ cách truy vấn, code mẫu (few-shot prompting)
để AI có thể tự tham khảo và bắt chước làm theo khi giải quyết công việc. Điều này giúp tăng độ chính xác
khi AI tạo ra câu truy vấn (SQL/NoSQL) theo đúng chuẩn của dự án.
-->

## Lấy thông tin user

```sql
SELECT id, name, email FROM users WHERE id = $1;
```

## Tính tổng đơn hàng

```sql
SELECT SUM(amount) FROM orders WHERE user_id = $1 AND status = 'COMPLETED';
```

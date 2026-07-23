import { defineMcpClientConnection } from 'eve/connections';
import { always } from 'eve/tools/approval';

export default defineMcpClientConnection({
  url: process.env.MCP_SERVER_URL || 'http://127.0.0.1:3001/mcp',
  headers: {
    Authorization: `Bearer ${process.env.MCP_API_KEY || ''}`,
  },
  description:
    'CDC, RAG, kiến trúc hệ thống. Knowledge base for technical concepts like CDC, RAG, and system architecture. Kết nối tới local FastMCP Server chịu trách nhiệm query FAISS Vector DB để truy xuất tài liệu nội bộ.',
  approval: always(),
  tools: {
    allow: ['ask_knowledge_base'],
  },
});

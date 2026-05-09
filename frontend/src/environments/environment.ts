// Switch to 'http://localhost:8001/api' to point at the mock backend
// (`uv run uvicorn mock_api:app --port 8001 --reload` from /backend) and
// develop the UI without burning Anthropic tokens.
export const environment = {
  apiUrl: 'http://localhost:8000/api',
};

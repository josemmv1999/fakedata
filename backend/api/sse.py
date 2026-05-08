import json
from typing import Any


def format_event(event: str, data: Any) -> str:
    """Serializa un evento SSE: 'event: <tipo>\\ndata: <json>\\n\\n'."""
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"

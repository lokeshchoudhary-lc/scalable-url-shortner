## URL SHORTNER

A scalable URL shortening service built with Express.js, TypeScript, and PostgreSQL.

### 1. Create Short URL

**POST** `/short_url`

Creates a shortened URL from a long URL.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `long_url` | string | Yes | The original URL to shorten |
| `expires_in_days` | number | No | Number of days until expiration (default: configured value) |

**Example Request:**

```bash
curl -X POST http://localhost:3000/short_url \
  -H "Content-Type: application/json" \
  -d '{
    "long_url": "https://example.com/very/long/path/to/resource",
    "expires_in_days": 30
  }'
```

**Example Response:**

```json
{
  "short_url": "http://localhost:3000/abc123"
}
```

---

### 2. Redirect to Original URL

**GET** `/:slug`

Redirects to the original long URL associated with the given slug. Also increments the click count.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | The unique identifier for the short URL |

**Example Request:**

```bash
curl -L http://localhost:3000/abc123
```

**Response:** 302 Redirect to the original long URL

**Error Response (404):**

```json
{
  "error": "URL not found or expired"
}
```

---

### 3. Get Short URL Info

**GET** `/url_info/:slug`

Retrieves detailed information about a shortened URL.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | The unique identifier for the short URL |

**Example Request:**

```bash
curl http://localhost:3000/url_info/abc123
```

**Example Response:**

```json
{
  "slug": "abc123",
  "long_url": "https://example.com/very/long/path/to/resource",
  "click_count": 42,
  "created_at": "2025-01-15T10:30:00.000Z",
  "expires_at": "2025-02-14T10:30:00.000Z"
}
```

**Error Response (404):**

```json
{
  "error": "URL not found"
}
```

---

### 4. Create Batch URLs

**POST** `/batch_urls`

Creates multiple short URLs in a single request (transactional).

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `urls` | array | Yes | Array of URL objects |
| `urls[].long_url` | string | Yes | The original URL to shorten |
| `urls[].expires_in_days` | number | No | Days until expiration for this URL |

**Example Request:**

```bash
curl -X POST http://localhost:3000/batch_urls \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      { "long_url": "https://example.com/page1", "expires_in_days": 30 },
      { "long_url": "https://example.com/page2", "expires_in_days": 60 },
      { "long_url": "https://example.com/page3" }
    ]
  }'
```

**Example Response:**

```json
{
  "urls": [
    {
      "short_url": "http://localhost:3000/abc123",
      "long_url": "https://example.com/page1"
    },
    {
      "short_url": "http://localhost:3000/def456",
      "long_url": "https://example.com/page2"
    },
    {
      "short_url": "http://localhost:3000/ghi789",
      "long_url": "https://example.com/page3"
    }
  ]
}
```

**Error Response (400):**

```json
{
  "error": "urls array is required"
}
```

---

## DESIGN INSPIRED BY

https://cyrilmottier.com/posts/2025/the-making-of-a-scalable-url-shortener/

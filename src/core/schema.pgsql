CREATE SEQUENCE short_url_counter_seq
START WITH 238328
INCREMENT BY 1;

CREATE TABLE short_urls (
    counter BIGINT NOT NULL DEFAULT nextval('short_url_counter_seq'),
    slug VARCHAR(10) NOT NULL UNIQUE,
    long_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    click_count INTEGER DEFAULT 0,
    is_active BOOL DEFAULT TRUE
);

ALTER SEQUENCE short_url_counter_seq
OWNED BY short_urls.counter;

-- Index for TTL cleanup
CREATE INDEX idx_short_urls_expires_at ON short_urls(expires_at);
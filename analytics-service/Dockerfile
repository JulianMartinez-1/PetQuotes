# Builder stage — installs dependencies into an isolated prefix
FROM python:3.12-slim AS builder

WORKDIR /build

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Production stage — no build tools in final image
FROM python:3.12-slim

WORKDIR /app

COPY --from=builder /install /usr/local
COPY . .

EXPOSE 3009

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3009", "--log-level", "info"]

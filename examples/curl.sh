#!/usr/bin/env bash
# VETO API — curl examples
# Replace API_KEY and BASE_URL with your values.

API_KEY="your-api-key"
BASE_URL="https://api.veto.dev"
# For local dev: BASE_URL="http://localhost:8787"

echo "=== Health Check ==="
curl -s "$BASE_URL/v1/health" | jq .

echo ""
echo "=== Version ==="
curl -s "$BASE_URL/v1/version" | jq .

echo ""
echo "=== Validate: Valid Invoice (EN16931) ==="
curl -s -X POST "$BASE_URL/v1/validate" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice": {
      "invoice_number": "INV-2024-0001",
      "issue_date": "2024-11-15",
      "seller": { "name": "Acme GmbH", "country": "DE" },
      "buyer":  { "name": "Beta Corp S.A.", "country": "FR" },
      "currency": "EUR",
      "total_amount": 1190.00
    },
    "target_profile": "EN16931"
  }' | jq .

echo ""
echo "=== Validate: Missing Fields (will be INVALID) ==="
curl -s -X POST "$BASE_URL/v1/validate" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice": {
      "currency": "EUROS"
    },
    "target_profile": "EN16931"
  }' | jq .

echo ""
echo "=== Validate: PEPPOL BIS 3.0 ==="
curl -s -X POST "$BASE_URL/v1/validate" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice": {
      "invoice_number": "PEPPOL-001",
      "issue_date": "2024-11-15",
      "seller": { "name": "Sender BV", "country": "NL" },
      "buyer":  { "name": "Receiver AS", "country": "NO" },
      "currency": "EUR",
      "total_amount": 250.00
    },
    "target_profile": "PEPPOL-BIS-3.0"
  }' | jq .

echo ""
echo "=== Validate: Unsupported Profile (will be INVALID) ==="
curl -s -X POST "$BASE_URL/v1/validate" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice": { "invoice_number": "X" },
    "target_profile": "UNKNOWN-PROFILE"
  }' | jq .

echo ""
echo "=== Validate: Using Bearer token ==="
curl -s -X POST "$BASE_URL/v1/validate" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice": {
      "invoice_number": "INV-BEARER-001",
      "issue_date": "2024-11-15",
      "seller": { "country": "DE" },
      "buyer":  { "country": "AT" },
      "currency": "EUR",
      "total_amount": 99.00
    },
    "target_profile": "EN16931"
  }' | jq .

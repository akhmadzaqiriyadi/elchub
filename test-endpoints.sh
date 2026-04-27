#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3001"
ADMIN_EMAIL="admin@elchub.local"
ADMIN_PASS="Admin123!"

echo -e "${YELLOW}=== Testing Management Endpoints ===${NC}\n"

# Step 1: Login to get token
echo -e "${YELLOW}[1] Logging in as admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASS\"
  }")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo "Token: ${ACCESS_TOKEN:0:20}...\n"

# Step 2: Test management event master data endpoint
echo -e "${YELLOW}[2] Testing GET /api/management/event-master-data${NC}"
MASTER_DATA_RESPONSE=$(curl -s -X GET "$API_BASE/api/management/event-master-data" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

MASTER_DATA_SUCCESS=$(echo "$MASTER_DATA_RESPONSE" | jq -r '.success' 2>/dev/null)

if [ "$MASTER_DATA_SUCCESS" = "true" ]; then
  echo -e "${GREEN}✓ Master data endpoint works${NC}"
  echo "$MASTER_DATA_RESPONSE" | jq '.data | keys'
else
  echo -e "${RED}✗ Master data endpoint failed${NC}"
  echo "Response: $MASTER_DATA_RESPONSE"
fi

echo ""

# Step 3: Test management events list endpoint
echo -e "${YELLOW}[3] Testing GET /api/management/events${NC}"
EVENTS_RESPONSE=$(curl -s -X GET "$API_BASE/api/management/events" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

EVENTS_SUCCESS=$(echo "$EVENTS_RESPONSE" | jq -r '.success' 2>/dev/null)

if [ "$EVENTS_SUCCESS" = "true" ]; then
  EVENTS_COUNT=$(echo "$EVENTS_RESPONSE" | jq '.data.items | length' 2>/dev/null)
  echo -e "${GREEN}✓ Events endpoint works (found $EVENTS_COUNT events)${NC}"
else
  echo -e "${RED}✗ Events endpoint failed${NC}"
  echo "Response: $EVENTS_RESPONSE"
fi

echo ""

# Step 4: Test management users list endpoint
echo -e "${YELLOW}[4] Testing GET /api/management/users${NC}"
USERS_RESPONSE=$(curl -s -X GET "$API_BASE/api/management/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

USERS_SUCCESS=$(echo "$USERS_RESPONSE" | jq -r '.success' 2>/dev/null)

if [ "$USERS_SUCCESS" = "true" ]; then
  USERS_COUNT=$(echo "$USERS_RESPONSE" | jq '.data.items | length' 2>/dev/null)
  echo -e "${GREEN}✓ Users endpoint works (found $USERS_COUNT users)${NC}"
else
  echo -e "${RED}✗ Users endpoint failed${NC}"
  echo "Response: $USERS_RESPONSE"
fi

echo -e "\n${GREEN}=== All tests completed ===${NC}"

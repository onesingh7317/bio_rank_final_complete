#!/usr/bin/env bash
# ============================================================
# test-stage3.sh — exercises every Stage 2 + Stage 3 endpoint in order.
# Run this AFTER: npm install && npm run dev (server must be running)
# and AFTER you've seeded an admin with scripts/seedAdmin.js.
#
# Usage:
#   chmod +x test-stage3.sh
#   ./test-stage3.sh
#
# Requires: curl, jq (for pretty-printing / extracting tokens & ids)
#   macOS:  brew install jq
#   Ubuntu: sudo apt install jq
# ============================================================
set -e

BASE_URL="${BASE_URL:-http://localhost:5000}"
ADMIN_IDENTIFIER="${ADMIN_IDENTIFIER:-admin}"       # username or email you seeded
ADMIN_PASSWORD="${ADMIN_PASSWORD:-yourPassword123}" # whatever you passed to seedAdmin.js

echo "=== 0. Health check ==="
curl -s "$BASE_URL/api/health" | jq .
echo

echo "=== 1. Login as admin ==="
LOGIN_RES=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"$ADMIN_IDENTIFIER\",\"password\":\"$ADMIN_PASSWORD\"}")
echo "$LOGIN_RES" | jq .
TOKEN=$(echo "$LOGIN_RES" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "!! Login failed — check ADMIN_IDENTIFIER / ADMIN_PASSWORD env vars and that you ran seedAdmin.js."
  exit 1
fi
echo "Got token."
echo

AUTH_HEADER="Authorization: Bearer $TOKEN"

echo "=== 2. GET /api/auth/me (confirm role = admin) ==="
curl -s "$BASE_URL/api/auth/me" -H "$AUTH_HEADER" | jq .
echo

echo "=== 3. Signup a normal student (should default to role: student) ==="
STUDENT_EMAIL="teststudent_$(date +%s)@example.com"
SIGNUP_RES=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Student\",\"username\":\"teststu_$(date +%s)\",\"email\":\"$STUDENT_EMAIL\",\"password\":\"password123\"}")
echo "$SIGNUP_RES" | jq .
STUDENT_ROLE=$(echo "$SIGNUP_RES" | jq -r '.user.role')
if [ "$STUDENT_ROLE" != "student" ]; then
  echo "!! FAIL: expected role 'student', got '$STUDENT_ROLE'"
else
  echo "OK: signup correctly ignored any role field and defaulted to student."
fi
STUDENT_TOKEN=$(echo "$SIGNUP_RES" | jq -r '.token')
echo

echo "=== 4. A student token should get 403 on an admin route ==="
STUDENT_BLOCKED=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/chapters" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
if [ "$STUDENT_BLOCKED" == "403" ]; then
  echo "OK: student correctly blocked (403) from /api/admin/chapters."
else
  echo "!! FAIL: expected 403 for student on admin route, got $STUDENT_BLOCKED"
fi
echo

echo "=== 5. Create a Chapter (as admin) ==="
CHAPTER_RES=$(curl -s -X POST "$BASE_URL/api/admin/chapters" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"name":"Test Chapter — Photosynthesis","class":"11","weightage":8,"icon":"🌿"}')
echo "$CHAPTER_RES" | jq .
CHAPTER_ID=$(echo "$CHAPTER_RES" | jq -r '.chapter._id')
echo

echo "=== 6. Duplicate chapter name should 409 ==="
DUP_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/admin/chapters" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"name":"Test Chapter — Photosynthesis","class":"11","weightage":8}')
if [ "$DUP_RES" == "409" ]; then
  echo "OK: duplicate chapter name correctly rejected (409)."
else
  echo "!! FAIL: expected 409 for duplicate name, got $DUP_RES"
fi
echo

echo "=== 7. Invalid class value should 400 ==="
BAD_CLASS_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/admin/chapters" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"name":"Bad Chapter","class":"13","weightage":5}')
if [ "$BAD_CLASS_RES" == "400" ]; then
  echo "OK: invalid class correctly rejected (400)."
else
  echo "!! FAIL: expected 400 for invalid class, got $BAD_CLASS_RES"
fi
echo

echo "=== 8. List chapters (should include the one we made) ==="
curl -s "$BASE_URL/api/admin/chapters" -H "$AUTH_HEADER" | jq '.chapters | length'
echo

echo "=== 9. Get chapter by id ==="
curl -s "$BASE_URL/api/admin/chapters/$CHAPTER_ID" -H "$AUTH_HEADER" | jq .
echo

echo "=== 10. Update chapter weightage ==="
curl -s -X PUT "$BASE_URL/api/admin/chapters/$CHAPTER_ID" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"weightage":9}' | jq .
echo

echo "=== 11. Create a Sub-skill under this chapter ==="
SUBSKILL_RES=$(curl -s -X POST "$BASE_URL/api/admin/sub-skills" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d "{\"name\":\"Light reaction steps\",\"chapterId\":\"$CHAPTER_ID\",\"bloomLevel\":\"analyze\"}")
echo "$SUBSKILL_RES" | jq .
SUBSKILL_ID=$(echo "$SUBSKILL_RES" | jq -r '.subSkill._id')
echo

echo "=== 12. Invalid bloomLevel should 400 ==="
BAD_BLOOM_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/admin/sub-skills" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d "{\"name\":\"Bad Skill\",\"chapterId\":\"$CHAPTER_ID\",\"bloomLevel\":\"evaluate\"}")
if [ "$BAD_BLOOM_RES" == "400" ]; then
  echo "OK: invalid bloomLevel correctly rejected (400)."
else
  echo "!! FAIL: expected 400 for invalid bloomLevel, got $BAD_BLOOM_RES"
fi
echo

echo "=== 13. Sub-skill referencing a nonexistent chapter should 400 ==="
FAKE_CHAPTER_ID="000000000000000000000000"
BAD_CHAPTER_REF_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/admin/sub-skills" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d "{\"name\":\"Orphan Skill\",\"chapterId\":\"$FAKE_CHAPTER_ID\",\"bloomLevel\":\"remember\"}")
if [ "$BAD_CHAPTER_REF_RES" == "400" ]; then
  echo "OK: nonexistent chapterId correctly rejected (400)."
else
  echo "!! FAIL: expected 400 for nonexistent chapterId, got $BAD_CHAPTER_REF_RES"
fi
echo

echo "=== 14. List sub-skills filtered by chapterId ==="
curl -s "$BASE_URL/api/admin/sub-skills?chapterId=$CHAPTER_ID" -H "$AUTH_HEADER" | jq .
echo

echo "=== 15. Soft-delete the sub-skill, then confirm it's excluded from default list ==="
curl -s -X DELETE "$BASE_URL/api/admin/sub-skills/$SUBSKILL_ID" -H "$AUTH_HEADER" | jq .
STILL_LISTED=$(curl -s "$BASE_URL/api/admin/sub-skills?chapterId=$CHAPTER_ID" -H "$AUTH_HEADER" | jq --arg id "$SUBSKILL_ID" '.subSkills | map(select(._id == $id)) | length')
if [ "$STILL_LISTED" == "0" ]; then
  echo "OK: soft-deleted sub-skill excluded from default list."
else
  echo "!! FAIL: soft-deleted sub-skill still showing up in default list."
fi
echo

echo "=== 16. ...but IS visible with includeDeleted=true ==="
curl -s "$BASE_URL/api/admin/sub-skills?chapterId=$CHAPTER_ID&includeDeleted=true" -H "$AUTH_HEADER" | jq '.subSkills | length'
echo

echo "=== 17. Soft-delete the chapter (should succeed even with a — now soft-deleted — sub-skill attached) ==="
curl -s -X DELETE "$BASE_URL/api/admin/chapters/$CHAPTER_ID" -H "$AUTH_HEADER" | jq .
echo

echo "=== 18. Deleted chapter excluded from default chapter list ==="
STILL_LISTED_CH=$(curl -s "$BASE_URL/api/admin/chapters" -H "$AUTH_HEADER" | jq --arg id "$CHAPTER_ID" '.chapters | map(select(._id == $id)) | length')
if [ "$STILL_LISTED_CH" == "0" ]; then
  echo "OK: soft-deleted chapter excluded from default list."
else
  echo "!! FAIL: soft-deleted chapter still showing up in default list."
fi
echo

echo "=== 19. No-token request should 401 ==="
NO_TOKEN_RES=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/chapters")
if [ "$NO_TOKEN_RES" == "401" ]; then
  echo "OK: request with no token correctly rejected (401)."
else
  echo "!! FAIL: expected 401 with no token, got $NO_TOKEN_RES"
fi
echo

echo "=== Done. Review any '!! FAIL' lines above. ==="

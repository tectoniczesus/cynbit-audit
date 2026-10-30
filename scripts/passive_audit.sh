#!/usr/bin/env bash
# Passive, read-only checks. ~15 single requests, 1s apart. No fuzzing, no auth, no load.
# Usage: ./scripts/passive_audit.sh cynbit.in
set -euo pipefail
D="${1:?usage: $0 <domain>}"
UA="passive-audit/1.0 (authorized assessment)"
c() { curl -sS -m 10 -A "$UA" "$@"; sleep 1; }

echo "== Headers (www) =="
c -I "https://www.$D" | grep -iE '^(HTTP|server|strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy|cross-origin|access-control|cache-control|x-vercel-cache|age)'

echo; echo "== Missing security headers =="
H=$(c -I "https://www.$D" | tr 'A-Z' 'a-z')
for h in content-security-policy x-frame-options x-content-type-options referrer-policy permissions-policy cross-origin-opener-policy; do
  grep -q "^$h:" <<<"$H" && echo "ok       $h" || echo "MISSING  $h"
done

echo; echo "== Redirect chain =="
c -sIL "https://$D" | grep -iE '^(HTTP|location)'
c -sI  "http://www.$D" | grep -iE '^(HTTP|location)'

echo; echo "== Public files =="
c "https://www.$D/robots.txt"
echo "-- security.txt status:"; c -o /dev/null -w '%{http_code}\n' "https://www.$D/.well-known/security.txt"
echo "-- sitemap hosts:"; c "https://www.$D/sitemap.xml" | grep -o '<loc>https\?://[^/]*' | sort | uniq -c

echo; echo "== DNS / email =="
for q in "A $D" "MX $D" "TXT $D" "TXT _dmarc.$D" "CNAME selector1._domainkey.$D" "CNAME selector2._domainkey.$D" "CAA $D"; do
  echo "-- $q"; dig +short $q
done

#!/bin/bash
# Compiles base.md + each variant into standalone prompt files
DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$DIR/compiled"

FEEDBACK="$DIR/feedback.md"

for variant in full-spirit single-focus triple-focus wildcard; do
  {
    cat "$DIR/base.md"
    echo ""
    echo "---"
    echo ""
    # Strip the "Include everything from base.md" line
    sed '1,/^---$/d' "$DIR/$variant.md"
    # Append feedback if it exists and has real content (not just TBD)
    if [ -f "$FEEDBACK" ] && grep -qv "TBD" "$FEEDBACK"; then
      echo ""
      echo "---"
      echo ""
      cat "$FEEDBACK"
    fi
  } > "$OUT/$variant.md"
  echo "Built $OUT/$variant.md"
done

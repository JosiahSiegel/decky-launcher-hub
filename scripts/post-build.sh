#!/bin/bash
# Post-build script to wrap ES6 output in IIFE format for Decky compatibility

DIST_FILE="dist/index.js"

if [ ! -f "$DIST_FILE" ]; then
    echo "Error: $DIST_FILE not found"
    exit 1
fi

echo "Wrapping $DIST_FILE in IIFE format..."

# Create a temporary file
TEMP_FILE=$(mktemp)

# Write IIFE wrapper start
echo "(function(DFL, SP_REACT) {" > "$TEMP_FILE"
echo "'use strict';" >> "$TEMP_FILE"

# Append the original content, removing the ES6 export line
grep -v "^export { .* as default };" "$DIST_FILE" | grep -v "^//# sourceMappingURL=" >> "$TEMP_FILE"

# Write IIFE wrapper end
echo "" >> "$TEMP_FILE"
echo "return index;" >> "$TEMP_FILE"
echo "})(DFL, SP_REACT);" >> "$TEMP_FILE"

# Replace the original file
mv "$TEMP_FILE" "$DIST_FILE"

echo "✅ Post-build processing complete"
echo "   Plugin wrapped in IIFE format for Decky compatibility"
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
echo "" >> "$TEMP_FILE"

# Extract definePlugin from DFL
echo "// Use Decky's definePlugin" >> "$TEMP_FILE"
echo "var definePlugin = DFL.definePlugin;" >> "$TEMP_FILE"
echo "var staticClasses = DFL.staticClasses;" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

# Remove problematic imports and @decky/api code, keep the rest
sed -e '/^const manifest = {"name":"Launcher Hub"};/,/^};$/d' \
    -e '/^import /d' \
    -e '/^export { .* as default };/d' \
    -e '/^\/\/# sourceMappingURL=/d' "$DIST_FILE" >> "$TEMP_FILE"

# Write IIFE wrapper end
echo "" >> "$TEMP_FILE"
echo "return index;" >> "$TEMP_FILE"
echo "})(DFL, SP_REACT);" >> "$TEMP_FILE"

# Replace the original file
mv "$TEMP_FILE" "$DIST_FILE"

echo "✅ Post-build processing complete"
echo "   Plugin wrapped in IIFE format for Decky compatibility"
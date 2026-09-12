const fs = require('fs');
let authContent = fs.readFileSync('frontend/src/shared/hooks/useAuth.ts', 'utf8');

authContent = authContent.replace(
    /const getInitials = useCallback\(\(\): string => \{[\s\S]*?return `\$\{user\.first_name\[0\]\}\$\{user\.last_name\[0\]\}`\.toUpperCase\(\);[\s\S]*?\}, \[user\]\);/,
    `const getInitials = useCallback((): string => {
    if (!user) return "";
    const first = user.first_name || 'A';
    const last = user.last_name || 'C';
    return \`\${first[0]}\${last[0]}\`.toUpperCase();
  }, [user]);`
);

fs.writeFileSync('frontend/src/shared/hooks/useAuth.ts', authContent);
console.log("Patched!");

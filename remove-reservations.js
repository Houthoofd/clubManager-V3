const fs = require("fs");
const file = "frontend/src/features/courses/pages/CoursesPage.tsx";
let code = fs.readFileSync(file, "utf8");
code = code.replace(/\{activeTab === "reservations" && \([\s\S]*?<\/TabErrorBoundary>\s*\)\}/g, "");
fs.writeFileSync(file, code);


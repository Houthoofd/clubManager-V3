const fs = require('fs');

function patchFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        '|| !hasSeenTutorial(tutorialId)',
        ''
    );
    fs.writeFileSync(file, content, 'utf8');
    console.log('Patched', file);
}

patchFile('frontend/src/features/alerts/pages/AlertsPage.tsx');
patchFile('frontend/src/features/courses/pages/CoursesPage.tsx');

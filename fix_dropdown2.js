const fs = require('fs');

const dropdownPath = 'frontend/src/shared/components/Navigation/TutorialDropdown.tsx';
let dropdown = fs.readFileSync(dropdownPath, 'utf8');

const target = 'roles: ["admin", "professor"],\n    }\n  ];';
const targetWin = 'roles: ["admin", "professor"],\r\n    }\r\n  ];';

const replacement = `roles: ["admin", "professor"],
    },
    {
      id: "alerts_intro",
      label: "Tutoriel : Alertes",
      path: "/alerts",
      roles: ["admin"]
    }
  ];`;

if (dropdown.includes(target)) {
    dropdown = dropdown.replace(target, replacement);
    fs.writeFileSync(dropdownPath, dropdown, 'utf8');
    console.log('Successfully added alerts_intro to TutorialDropdown.tsx');
} else if (dropdown.includes(targetWin)) {
    dropdown = dropdown.replace(targetWin, replacement);
    fs.writeFileSync(dropdownPath, dropdown, 'utf8');
    console.log('Successfully added alerts_intro to TutorialDropdown.tsx (Win)');
} else {
    // Try even simpler
    const simpleTarget = 'roles: ["admin", "professor"],';
    const splitStr = dropdown.split(simpleTarget);
    if (splitStr.length === 2) {
        dropdown = splitStr[0] + simpleTarget + '\n    },\n    {\n      id: "alerts_intro",\n      label: "Tutoriel : Alertes",\n      path: "/alerts",\n      roles: ["admin"]' + splitStr[1].substring(splitStr[1].indexOf('}'));
        fs.writeFileSync(dropdownPath, dropdown, 'utf8');
        console.log('Successfully added alerts_intro to TutorialDropdown.tsx (Simple split)');
    } else {
        console.error('Still failed to match!');
    }
}

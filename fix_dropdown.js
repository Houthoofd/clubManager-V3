const fs = require('fs');

const dropdownPath = 'frontend/src/shared/components/Navigation/TutorialDropdown.tsx';
let dropdown = fs.readFileSync(dropdownPath, 'utf8');

// Use a regex to match the end of the tutorials array
const regex = /path:\s*"\/messages",\s*roles:\s*\["admin",\s*"professor"\](?:,|\s*)\}/;

const newEntry = `path: "/messages",
      roles: ["admin", "professor"]
    },
    {
      id: "alerts_intro",
      label: "Tutoriel : Alertes",
      path: "/alerts",
      roles: ["admin"]
    }`;

if (!dropdown.includes('alerts_intro')) {
    if (regex.test(dropdown)) {
        dropdown = dropdown.replace(regex, newEntry);
        fs.writeFileSync(dropdownPath, dropdown, 'utf8');
        console.log('Successfully added alerts_intro to TutorialDropdown.tsx');
    } else {
        console.error('Regex did not match!');
    }
} else {
    console.log('alerts_intro already present');
}

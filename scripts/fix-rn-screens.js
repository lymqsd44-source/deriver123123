const fs = require('fs');
const path = require('path');

const filePath = path.join(
    process.cwd(),
    'node_modules',
    'react-native-screens',
    'src',
    'fabric',
    'ScreenStackHeaderConfigNativeComponent.ts'
);

try {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Fix 1: Change import for CodegenTypes
        if (content.includes("import type { CodegenTypes as CT, ViewProps, ColorValue } from 'react-native'")) {
            console.log('Applying fix to react-native-screens (CodegenTypes import)...');
            content = content.replace(
                "import type { CodegenTypes as CT, ViewProps, ColorValue } from 'react-native';",
                "import type { ViewProps, ColorValue } from 'react-native';\nimport type * as CT from 'react-native/Libraries/Types/CodegenTypes';"
            );
            modified = true;
        }

        // Fix 2: Remove OnAttachedEvent and OnDetachedEvent type definitions
        if (content.includes('type OnAttachedEvent = Readonly<{}>')) {
            content = content.replace(/\/\/ eslint-disable-next-line @typescript-eslint\/ban-types\s*\ntype OnAttachedEvent = Readonly<{}>;\s*\n\/\/ eslint-disable-next-line @typescript-eslint\/ban-types\s*\ntype OnDetachedEvent = Readonly<{}>;\s*\n/g, '\n');
            modified = true;
        }

        // Fix 3: Remove onAttached and onDetached props
        if (content.includes('onAttached?: CT.DirectEventHandler<OnAttachedEvent>')) {
            content = content.replace(/\s*onAttached\?: CT\.DirectEventHandler<OnAttachedEvent>;\s*\n\s*onDetached\?: CT\.DirectEventHandler<OnDetachedEvent>;/g, '');
            modified = true;
        }

        // Fix 4: Change Int32 to Float for font sizes
        if (content.includes('backTitleFontSize?: CT.Int32')) {
            content = content.replace(/backTitleFontSize\?: CT\.Int32/g, 'backTitleFontSize?: CT.Float');
            content = content.replace(/largeTitleFontSize\?: CT\.Int32/g, 'largeTitleFontSize?: CT.Float');
            content = content.replace(/titleFontSize\?: CT\.Int32/g, 'titleFontSize?: CT.Float');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log('react-native-screens fix applied successfully.');
        } else {
            console.log('react-native-screens already patched or no fix needed.');
        }
    } else {
        console.log('ScreenStackHeaderConfigNativeComponent.ts not found, skipping fix.');
    }
} catch (e) {
    console.error('Failed to patch react-native-screens:', e);
}

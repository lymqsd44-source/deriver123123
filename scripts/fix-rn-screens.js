const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../node_modules/react-native-screens/src/fabric/ScreenStackHeaderConfigNativeComponent.ts');

if (!fs.existsSync(file)) {
    console.log('react-native-screens file not found, skipping fix.');
    process.exit(0);
}

let content = fs.readFileSync(file, 'utf8');

// Fix 1: Correct Imports
if (content.includes("import type { CodegenTypes as CT, ViewProps, ColorValue } from 'react-native';")) {
    console.log('Fixing imports in ScreenStackHeaderConfigNativeComponent.ts');
    content = content.replace(
        "import type { CodegenTypes as CT, ViewProps, ColorValue } from 'react-native';",
        "import type { ViewProps, ColorValue } from 'react-native';\nimport type * as CT from 'react-native/Libraries/Types/CodegenTypes';"
    );
}

// Fix 2: Remove OnAttached/OnDetached Events
if (content.includes('type OnAttachedEvent = Readonly<{}>;')) {
    console.log('Removing OnAttachedEvent/OnDetachedEvent types');
    content = content.replace(/\/\/ eslint-disable-next-line @typescript-eslint\/ban-types\s+type OnAttachedEvent = Readonly<{}>;\s+\/\/ eslint-disable-next-line @typescript-eslint\/ban-types\s+type OnDetachedEvent = Readonly<{}>;/g, '');
}

if (content.includes('onAttached?: CT.DirectEventHandler<OnAttachedEvent>;')) {
    console.log('Removing onAttached prop');
    content = content.replace(/\s+onAttached\?: CT\.DirectEventHandler<OnAttachedEvent>;/g, '');
}

if (content.includes('onDetached?: CT.DirectEventHandler<OnDetachedEvent>;')) {
    console.log('Removing onDetached prop');
    content = content.replace(/\s+onDetached\?: CT\.DirectEventHandler<OnDetachedEvent>;/g, '');
}

// Fix 3: Replace CT.Int32 with CT.Float
if (content.includes('CT.Int32')) {
    console.log('Replacing CT.Int32 with CT.Float');
    content = content.replace(/CT\.Int32/g, 'CT.Float');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched react-native-screens for RN 0.77!');

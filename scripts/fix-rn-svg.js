const fs = require('fs');
const path = require('path');

const filePath = path.join(
    process.cwd(),
    'node_modules',
    'react-native-svg',
    'common',
    'cpp',
    'react',
    'renderer',
    'components',
    'rnsvg',
    'RNSVGLayoutableShadowNode.cpp'
);

try {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('StyleSizeLength')) {
            console.log('Applying native fix to react-native-svg (Yoga compatibility)...');
            // Replace StyleSizeLength with StyleLength for React Native 0.77+ compatibility
            content = content.replace(/StyleSizeLength/g, 'StyleLength');
            fs.writeFileSync(filePath, content);
            console.log('Fix applied successfully.');
        } else {
            console.log('react-native-svg already patched or no fix needed.');
        }
    } else {
        console.warn('Could not find RNSVGLayoutableShadowNode.cpp to patch. Skip.');
    }
} catch (e) {
    console.error('Failed to patch react-native-svg:', e);
}

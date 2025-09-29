export interface FormattedTextRow {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontName: string;
    items: TextItem[];
}

interface TextItem {
    str: string;
    transform?: number[];
}
interface TextTransform {
    transform?: number[];
    str: string;
}

function groupItemsByRows(items: TextTransform[], baseTolerance: number = 2): TextTransform[][] {
    const rows: TextTransform[][] = [];
    let currentRow: TextTransform[] = [];

    items.forEach(item => {
        if (currentRow.length === 0) {
            currentRow.push(item);
        } else {
            const lastItem = currentRow[currentRow.length - 1];
            const lastY = lastItem.transform?.[5] ?? 0;
            const currentY = item.transform?.[5] ?? 0;

            // Check if the current item is on the same line as the last item
            if (Math.abs(currentY - lastY) < baseTolerance) {
                currentRow.push(item);
            } else {
                rows.push(currentRow);
                currentRow = [item];
            }
        }
    });

    // Push the last row if it exists
    if (currentRow.length > 0) {
        rows.push(currentRow);
    }

    return rows;
}
// Enhanced utility functions for better text processing
function getX(item: TextItem): number {
    return item.transform?.[4] || 0; // X coordinate (translateX)
}

function getY(item: TextItem): number {
    return item.transform?.[5] || 0; // Y coordinate (translateY)
}

function getWidth(item: TextItem): number {
    return item.transform?.[0] || 0; // Width (scaleX)
}

function getHeight(item: TextItem): number {
    return item.transform?.[3] || 0; // Height (scaleY)
}

// Analyze text effects from transform matrix
function analyzeTextEffects(item: TextItem) {
    const [scaleX, skewX, skewY, scaleY, translateX, translateY] = item.transform || [1, 0, 0, 1, 0, 0];

    return {
        isItalic: Math.abs(skewX) > 0.1, // Horizontal skew indicates italic
        isRotated: Math.abs(skewY) > 0.1, // Vertical skew indicates rotation
        isBold: Math.abs(scaleX) > Math.abs(scaleY) * 1.2, // Thicker horizontal scaling
        isStretched: Math.abs(scaleX) !== Math.abs(scaleY), // Different X/Y scaling
        isFlipped: scaleX < 0 || scaleY < 0, // Negative scaling = flipped
        fontSize: Math.abs(scaleY),
        rotation: Math.atan2(skewY, scaleY) * 180 / Math.PI, // Approximate rotation angle
        x: translateX,
        y: translateY
    };
}

// Convert grouped rows to formatted text with enhanced spacing using all transform properties
function formatTextRows(rows: TextItem[][]): FormattedTextRow[] {
    return rows.map(row => {
        if (row.length === 0) {
            return {
                text: '',
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                fontSize: 0,
                fontName: '',
                items: []
            };
        }

        // Sort items in the row by X position
        const sortedRow = [...row].sort((a, b) => getX(a) - getX(b));

        // Build text with intelligent spacing based on all transform properties
        let text = '';
        let lastX = 0;
        let lastWidth = 0;
        let lastEffects = null;

        for (let i = 0; i < sortedRow.length; i++) {
            const item = sortedRow[i];
            const currentX = getX(item);
            const currentText = item.str || '';
            const currentEffects = analyzeTextEffects(item);

            if (i > 0) {
                // Calculate gap between previous item and current item
                const gap = currentX - (lastX + lastWidth);

                // Adjust space width based on font size and effects
                let baseSpaceWidth = currentEffects.fontSize * 0.25;

                // Italic text often needs different spacing
                if (currentEffects.isItalic) {
                    baseSpaceWidth *= 1.1;
                }

                // Bold/stretched text affects spacing
                if (currentEffects.isBold || currentEffects.isStretched) {
                    baseSpaceWidth *= 1.05;
                }

                // Calculate spaces to add based on gap
                const spacesToAdd = Math.max(0, Math.floor(gap / baseSpaceWidth));

                if (spacesToAdd > 0) {
                    text += ' '.repeat(Math.min(spacesToAdd, 15)); // Increased limit for better formatting
                } else if (gap > baseSpaceWidth * 0.3) {
                    text += ' '; // Add space for reasonable gaps
                }

                // Special handling for rotated or flipped text
                if (currentEffects.isRotated && !lastEffects?.isRotated) {
                    text += ' [ROTATED] ';
                }
                if (currentEffects.isFlipped) {
                    text += ' [FLIPPED] ';
                }
            }

            // Add visual indicators for special text effects
            const decoratedText = currentText;
            if (currentEffects.isItalic && !currentText.match(/^\s*$/)) {
                // Could add italic markers if needed: decoratedText = `*${currentText}*`;
            }
            if (currentEffects.isBold && Math.abs(currentEffects.fontSize) > 14) {
                // Could add bold markers if needed: decoratedText = `**${currentText}**`;
            }

            text += decoratedText;
            lastX = currentX;
            lastWidth = getWidth(item);
            lastEffects = currentEffects;
        }

        // Calculate comprehensive row properties using all transform data
        const allEffects = sortedRow.map(analyzeTextEffects);
        const minX = Math.min(...sortedRow.map(getX));
        const maxX = Math.max(...sortedRow.map(item => getX(item) + getWidth(item)));
        const avgY = sortedRow.reduce((sum, item) => sum + getY(item), 0) / sortedRow.length;
        const maxFontSize = Math.max(...allEffects.map(e => e.fontSize));
        const maxHeight = Math.max(...sortedRow.map(getHeight));

        // Determine dominant font characteristics
        const hasItalic = allEffects.some(e => e.isItalic);
        const hasBold = allEffects.some(e => e.isBold);
        const hasRotation = allEffects.some(e => e.isRotated);

        let fontName = 'unknown';
        if (hasBold && hasItalic) fontName = 'bold-italic';
        else if (hasBold) fontName = 'bold';
        else if (hasItalic) fontName = 'italic';
        else if (hasRotation) fontName = 'rotated';

        return {
            text: text.trim(),
            x: minX,
            y: avgY,
            width: maxX - minX,
            height: maxHeight,
            fontSize: maxFontSize,
            fontName: fontName,
            items: sortedRow
        };
    });
}


export function render_page(pageData: unknown) {

    //check documents https://mozilla.github.io/pdf.js/
    const render_options = {
        //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
        normalizeWhitespace: false,
        //do not attempt to combine same line TextItem's. The default value is `false`.
        disableCombineTextItems: false
    }

    const result: FormattedTextRow[] = [];

    interface GetTextContentOptions {
        normalizeWhitespace?: boolean;
        disableCombineTextItems?: boolean;
    }

    interface TextItem {
        str: string;
        transform: number[];
    }

    interface TextContent {
        items: TextItem[];
    }

    interface PageDataWithGetTextContent {
        getTextContent: (options?: GetTextContentOptions) => Promise<TextContent>;
    }

    return (pageData as PageDataWithGetTextContent)
        .getTextContent(render_options as GetTextContentOptions)
        .then(function (textContent: TextContent): string {
            // let lastY: number | undefined, text: string = '';
            if (Array.isArray(textContent.items)) {
                const { items } = textContent;

                // Use enhanced grouping by rows for better formatting
                const rows = groupItemsByRows(items, 2);
                const formattedRows = formatTextRows(rows);
                result.push(...formattedRows);
            }
            return JSON.stringify(result);
        });
}
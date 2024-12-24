function processAdText(text) {
    try {
        if (!text || typeof text !== 'string') {
            console.error('[processAdText] Invalid text input:', text);
            return { primaryText: '', secondaryText: '' };
        }

        let processedText = text
            .replace(/^\d+\.\s*/, '')        // Remove numbering
            .replace(/\*+/g, '')             // Remove asterisks
            .replace(/\s*\([^)]*\)/g, '')    // Remove parenthetical text
            .replace(/\s+/g, ' ')            // Normalize spaces
            .replace(/\.{2,}/g, '.')         // Fix multiple dots
            .replace(/[""]/g, '"')           // Normalize quotes
            .replace(/['']/g, "'")           // Normalize apostrophes
            .trim();

        // Handle colon in text
        const colonParts = processedText.split(':');
        if (colonParts.length > 1 && colonParts[1].trim().length > 0) {
            processedText = colonParts[1].trim();
        }

        // Split into sentences
        const sentences = processedText
            .split(/(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Format the text based on number of sentences
        if (sentences.length > 1) {
            const midpoint = Math.ceil(sentences.length / 2);
            return {
                primaryText: sentences.slice(0, midpoint).join(' '),
                secondaryText: sentences.slice(midpoint).join(' ')
            };
        }

        return {
            primaryText: processedText,
            secondaryText: ''
        };
    } catch (error) {
        console.error('[processAdText] Error processing text:', error);
        return {
            primaryText: text || '',
            secondaryText: ''
        };
    }
}

export const adTemplates = {

    "300x250": (options) => {
        const { fontPath, fontName, adDimensions, bgColor, textColor, ctaColor, ctaTextColor, logoUrl, mainImageUrl, phrase, ctaText } = options;

        const processedPhrase = processAdText(phrase);
        console.log('[createAd] Processed phrase:', processedPhrase);

        // Generate the font-face rule only if fontPath is available
        const fontFaceRule = fontPath
            ? `
            @font-face {
                font-family: '${fontName}';
                src: url('${fontPath}');
            }
        `
            : ''; // No font-face if fontPath is null

        return `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      ${fontFaceRule}

      body {
        margin: 0;
        padding: 0;
        width: ${adDimensions.width}px;
        height: ${adDimensions.height}px;
        overflow: hidden;
      }

      .ad-container {
        width: 100%;
        height: 100%;
        background-color: ${bgColor};
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        padding: 2px;
        position: relative;
      }

      .content-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: space-between;
        padding: 2px 2px;
      }

      .logo-container {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 26px;
        height: 26px;
        z-index: 2;
      }

      .logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .text-section {
        font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
        margin: 0 auto;
        max-width: 80%;
        padding-right: 2px;
        padding-top: 4px;
        position: relative;
        z-index: 1;
      }

      .text-container {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .primary-text {
        color: ${textColor};
        font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
        font-size: 12px;
        font-weight: 600;
        hyphens: auto;
        letter-spacing: -0.02em;
        line-height: 1.2;
        margin: 0 0 8 0;
        max-width: 95%;
        overflow-wrap: break-word;
        padding: 0;
        text-align: center;
        word-wrap: break-word;
      }

      .secondary-text {
        color: ${textColor};
        font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
        font-size: 8px;
        font-weight: 500;
        hyphens: auto;
        letter-spacing: 1.2px;
        line-height: 1;
        margin: 0;
        max-width: 90%;
        opacity: 0.9;
        overflow-wrap: break-word;
        padding: 0;
        text-align: center;
        word-wrap: break-word;  
      }

      .image-and-cta-container {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        flex-direction: column;
        gap: 2px;
        margin-top: 2px;
      }

      .main-image-container {
        width: 100%;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .main-image {
        width: auto;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
      }

      .cta-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 6px;
      }

      .cta-button {
        background: ${ctaColor};
        border: none;
        border-radius: 2px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        color: ${ctaTextColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
        font-size: 6px;
        font-weight: 600;
        letter-spacing: 1px;
        margin: 0 auto;
        min-width: 75px;
        padding: 6px 6px;
        text-transform: uppercase;
        transform: translateY(0);
        transition: transform 0.2s ease;
      }

      /* Adding professional touches */
      .gradient-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 120px;
        background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%);
        pointer-events: none;
      }
        
      </style>
      </head>
      <body>
        <div class="ad-container">
          <div class="logo-container">
            <img src="${logoUrl}" alt="Logo" class="logo">
          </div>
          <div class="content-wrapper">
            <div class="text-section">
              <div id="textContainer" class="text-container"></div>
            </div>
            <div class="image-and-cta-container">
              <div class="main-image-container">
                <img src="${mainImageUrl}" alt="Main Image" class="main-image">
              </div>
              <div class="cta-container">
                <button class="cta-button">${ctaText}</button>
              </div>
            </div>
          </div>
        </div>

       <script>
    function formatText() {
        const processedText = ${JSON.stringify(processedPhrase)};
        const container = document.getElementById('textContainer');
        
        if (!container) {
            console.error('Text container not found');
            return;
        }

        console.log('Formatting text:', processedText);
        
        const html = processedText.secondaryText 
            ? \`
                <p class="primary-text">\${processedText.primaryText}</p>
                <p class="secondary-text">\${processedText.secondaryText}</p>
              \`
            : \`<p class="primary-text">\${processedText.primaryText}</p>\`;
        
        container.innerHTML = html;
        
        // Dynamic font size adjustment
        const primaryText = container.querySelector('.primary-text');
        if (primaryText) {
            let fontSize = parseInt(window.getComputedStyle(primaryText).fontSize);
            const minFontSize = 12;
            
            while (
                fontSize > minFontSize && 
                (primaryText.scrollHeight > primaryText.clientHeight || 
                primaryText.scrollWidth > primaryText.clientWidth)
            ) {
                fontSize -= 2;
                primaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }

        const secondaryText = container.querySelector('.secondary-text');
        if (secondaryText) {
            let fontSize = parseInt(window.getComputedStyle(secondaryText).fontSize);
            const minFontSize = 10;
            
            while (
                fontSize > minFontSize && 
                (secondaryText.scrollHeight > secondaryText.clientHeight || 
                secondaryText.scrollWidth > secondaryText.clientWidth)
            ) {
                fontSize -= 2;
                secondaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }
    }

    // Run when DOM is ready and after fonts are loaded
    formatText();
    document.fonts.ready.then(formatText);
</script>
      </body>
    </html>`;
    },

    // 160 x 600
    "160x600": (options) => {
    const { fontPath, fontName, adDimensions, bgColor, textColor, ctaColor, ctaTextColor, logoUrl, mainImageUrl, phrase, ctaText } = options;

    const processedPhrase = processAdText(phrase);
    console.log('[createAd] Processed phrase:', processedPhrase);

    const fontFaceRule = fontPath
        ? `
        @font-face {
            font-family: '${fontName}';
            src: url('${fontPath}');
        }
    `
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
    ${fontFaceRule}

      body {
        margin: 0;
        padding: 0;
        width: ${adDimensions.width}px;
        height: ${adDimensions.height}px;
        overflow: hidden;
      }

      .ad-container {
        width: 100%;
        height: 100%;
        background-color: ${bgColor};
        display: flex;
        flex-direction: column;
        position: relative;
        box-sizing: border-box;
        padding: 4px;
      }

      .logo-container {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
        z-index: 2;
        background-color: transparent;
        padding: 2px;
        border-radius: 4px;
      }

      .logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }

      .content-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .text-section {
        width: 100%;
        font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
        padding: 56px 12px 16px 12px;
        min-height: 140px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        box-sizing: border-box;
        position: relative;
        z-index: 1;
      }

      .text-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
      }

      .primary-text {
        color: ${textColor};
        font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
        font-weight: 600;
        margin: 0;
        padding: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
        text-align: left;
        font-size: 24px;
        line-height: 1.2;
        letter-spacing: -0.02em;
      }

      .secondary-text {
        color: ${textColor};
        font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
        font-size: 16px;
        line-height: 1.3;
        margin: 0;
        font-weight: 400;
      }

      .main-image-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 12px 0;
        padding: 0 8px;
        box-sizing: border-box;
        max-height: 280px;
      }

      .main-image {
        width: 100%;
        height: auto;
        object-fit: contain;
        max-height: 260px;
        position: relative;
        z-index: 1;
      }

      .cta-container {
        padding: 12px;
        margin-top: auto;
        margin-bottom: 8px;
      }

      .cta-button {
        width: 100%;
        height: 44px;
        background: ${ctaColor};
        color: ${ctaTextColor};
        border: none;
        border-radius: 8px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        text-transform: uppercase;
        font-size: 16px;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    </style>
  </head>
  <body>
    <div class="ad-container">
      <div class="logo-container">
        <img src="${logoUrl}" alt="Logo" class="logo">
      </div>
      <div class="text-section">
        <div id="textContainer" class="text-container"></div>
      </div>
      <div class="main-image-container">
        <img src="${mainImageUrl}" alt="Main Image" class="main-image">
      </div>
      <div class="cta-container">
        <button class="cta-button">${ctaText}</button>
      </div>
    </div>
    <script>
    function formatText() {
        const processedText = ${JSON.stringify(processedPhrase)};
        const container = document.getElementById('textContainer');
        
        if (!container) {
            console.error('Text container not found');
            return;
        }

        console.log('Formatting text:', processedText);
        
        const html = processedText.secondaryText 
            ? \`
                <p class="primary-text">\${processedText.primaryText}</p>
                <p class="secondary-text">\${processedText.secondaryText}</p>
              \`
            : \`<p class="primary-text">\${processedText.primaryText}</p>\`;
        
        container.innerHTML = html;
        
        // Dynamic font size adjustment
        const primaryText = container.querySelector('.primary-text');
        if (primaryText) {
            let fontSize = 24;
            const minFontSize = 16;
            
            while (
                fontSize > minFontSize && 
                (primaryText.scrollHeight > primaryText.clientHeight || 
                primaryText.scrollWidth > primaryText.clientWidth)
            ) {
                fontSize -= 2;
                primaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }

        const secondaryText = container.querySelector('.secondary-text');
        if (secondaryText) {
            let fontSize = 16;
            const minFontSize = 12;
            
            while (
                fontSize > minFontSize && 
                (secondaryText.scrollHeight > secondaryText.clientHeight || 
                secondaryText.scrollWidth > secondaryText.clientWidth)
            ) {
                fontSize -= 2;
                secondaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }
    }

    // Run when DOM is ready and after fonts are loaded
    formatText();
    document.fonts.ready.then(formatText);
    </script>
  </body>
</html>`;
},

    "320x480": (options) => {
        const { fontPath, fontName, adDimensions, bgColor, textColor, ctaColor, ctaTextColor, logoUrl, mainImageUrl, phrase, ctaText } = options;

        const processedPhrase = processAdText(phrase);
        console.log('[createAd] Processed phrase:', processedPhrase);

        // Generate the font-face rule only if fontPath is available
        const fontFaceRule = fontPath
            ? `
            @font-face {
                font-family: '${fontName}';
                src: url('${fontPath}');
            }
        `
            : ''; // No font-face if fontPath is null

        return `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      ${fontFaceRule}

      body {
        margin: 0;
        padding: 0;
        width: ${adDimensions.width}px;
        height: ${adDimensions.height}px;
        overflow: hidden;
      }

      .ad-container {
        width: 100%;
        height: 100%;
        background-color: ${bgColor};
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .content-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-top: 20px;
        padding: 12px;
      }

      .logo-container {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 40px;
        height: 40px;
        z-index: 2;
      }

      .logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .text-section {
        font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
        margin: 0 auto;
        max-width: 80%;
        padding-right: 2px;
        padding-top: 8px;
        position: relative;
        z-index: 1;
      }

      .text-container {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .primary-text {
        color: ${textColor};
        font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
        font-size: 20px;
        font-weight: 600;
        hyphens: auto;
        letter-spacing: -0.02em;
        line-height: 1.2;
        margin: 0 0 8 0;
        max-width: 95%;
        overflow-wrap: break-word;
        padding: 0;
        text-align: center;
        word-wrap: break-word;
      }

      .secondary-text {
        color: ${textColor};
        font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
        font-size: 18px;
        font-weight: 500;
        hyphens: auto;
        letter-spacing: 1.2px;
        line-height: 1;
        margin: 0;
        max-width: 90%;
        opacity: 0.9;
        overflow-wrap: break-word;
        padding: 0;
        text-align: center;
        word-wrap: break-word;  
      }

      .image-and-cta-container {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        flex-direction: column;
        margin: 10px;
      }

      .main-image-container {
        width: 100%;
        height: 240px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .main-image {
        width: auto;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
      }

      .cta-container {
        padding: 16px;
        margin-bottom: 80px; /* Space from bottom */
      }

      .cta-button {
        background: ${ctaColor};
        border: none;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        color: ${ctaTextColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 1px;
        margin: 0;
        min-width: 75px;
        padding: 6px 6px;
        text-transform: uppercase;
        transform: translateY(0);
        transition: transform 0.2s ease;
      }

      /* Adding professional touches */
      .gradient-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 120px;
        background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%);
        pointer-events: none;
      }
      </style>
      </head>
      <body>
        <div class="ad-container">
          <div class="logo-container">
            <img src="${logoUrl}" alt="Logo" class="logo">
          </div>
          <div class="content-wrapper">
            <div class="text-section">
              <div id="textContainer" class="text-container"></div>
            </div>
            <div class="image-and-cta-container">
              <div class="main-image-container">
                <img src="${mainImageUrl}" alt="Main Image" class="main-image">
              </div>
              <div class="cta-container">
                <button class="cta-button">${ctaText}</button>
              </div>
            </div>
          </div>
        </div>

       <script>
    function formatText() {
        const processedText = ${JSON.stringify(processedPhrase)};
        const container = document.getElementById('textContainer');
        
        if (!container) {
            console.error('Text container not found');
            return;
        }

        console.log('Formatting text:', processedText);
        
        const html = processedText.secondaryText 
            ? \`
                <p class="primary-text">\${processedText.primaryText}</p>
                <p class="secondary-text">\${processedText.secondaryText}</p>
              \`
            : \`<p class="primary-text">\${processedText.primaryText}</p>\`;
        
        container.innerHTML = html;
        
        // Dynamic font size adjustment
        const primaryText = container.querySelector('.primary-text');
        if (primaryText) {
            let fontSize = parseInt(window.getComputedStyle(primaryText).fontSize);
            const minFontSize = 12;
            
            while (
                fontSize > minFontSize && 
                (primaryText.scrollHeight > primaryText.clientHeight || 
                primaryText.scrollWidth > primaryText.clientWidth)
            ) {
                fontSize -= 2;
                primaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }

        const secondaryText = container.querySelector('.secondary-text');
        if (secondaryText) {
            let fontSize = parseInt(window.getComputedStyle(secondaryText).fontSize);
            const minFontSize = 10;
            
            while (
                fontSize > minFontSize && 
                (secondaryText.scrollHeight > secondaryText.clientHeight || 
                secondaryText.scrollWidth > secondaryText.clientWidth)
            ) {
                fontSize -= 2;
                secondaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }
    }

    // Run when DOM is ready and after fonts are loaded
    formatText();
    document.fonts.ready.then(formatText);
</script>
      </body>
    </html>`;
    },

    "1080x1080": (options) => {
        const { fontPath, fontName, adDimensions, bgColor, textColor, ctaColor, ctaTextColor, logoUrl, mainImageUrl, phrase, ctaText } = options;

        const processedPhrase = processAdText(phrase);
        console.log('[createAd] Processed phrase:', processedPhrase);

        // Generate the font-face rule only if fontPath is available
        const fontFaceRule = fontPath
            ? `
            @font-face {
                font-family: '${fontName}';
                src: url('${fontPath}');
            }
        `
            : ''; // No font-face if fontPath is null

        return `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
            ${fontFaceRule}

            body {
                margin: 0;
                padding: 0;
                width: ${adDimensions.width}px;
                height: ${adDimensions.height}px;
                overflow: hidden;
            }

            .ad-container {
                width: 100%;
                height: 100%;
                background-color: ${bgColor};
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                padding: 20px;
                position: relative;
            }

            .content-wrapper {
                display: flex;
                flex-direction: column;
                height: 100%;
                justify-content: space-between;
                margin-top: 40px;
                padding: 40px 20px;
            }

            .cta-button {
                background: ${ctaColor};
                border: none;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                color: ${ctaTextColor};
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 1px;
                margin: 0 auto;
                min-width: 300px;
                padding: 24px 48px;
                text-transform: uppercase;
                transform: translateY(0);
                transition: transform 0.2s ease;
            }

            .cta-container {
                width: 100%;
                display: flex;
                justify-content: center;
                margin-top: 10px;
            }

            .image-and-cta-container {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1;
                flex-direction: column;
                gap: 20px;
                margin-top: 40px;
            }

            .logo {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .logo-container {
                position: absolute;
                top: 32px;
                right: 32px;
                width: 80px;
                height: 80px;
                z-index: 2;
            }

            .main-image {
                width: 100%;
                height: auto;
                object-fit: contain;
                max-height: 500px;
                filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
            }

            .main-image-container {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                width: 100%;
                max-width: 90%;
            }

            .main-text {
                color: ${textColor};
                font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
                font-size: 56px;
                font-weight: 600;
                hyphens: auto;
                letter-spacing: -0.02em;
                line-height: 1.2;
                margin: 0;
                max-width: 100%;
                overflow-wrap: break-word;
                padding: 0;
                text-align: center;
                word-wrap: break-word; 
            }

            .primary-text {
                color: ${textColor};
                font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
                font-size: 56px;
                font-weight: 600;
                hyphens: auto;
                letter-spacing: -0.02em;
                line-height: 1.15;
                margin: 0 0 32px 0;
                max-width: 95%;
                overflow-wrap: break-word;
                padding: 0;
                text-align: center;
                word-wrap: break-word;
            }
                
            .secondary-text {
                color: ${textColor};
                font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
                font-size: 46px;
                font-weight: 400;
                hyphens: auto;
                line-height: 1.2;
                margin: 0;
                max-width: 90%;
                opacity: 0.9;
                overflow-wrap: break-word;
                padding: 0;
                text-align: center;
                word-wrap: break-word;  
            }

            .text-container {
                display: flex;
                flex-direction: column;
                gap: 20px;
                width: 100%;
            }

            .text-section {
                font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
                margin: 0 auto;
                max-width: 80%;
                padding-right: 30px;  // Added padding for logo
                padding-top: 60px;
                position: relative;
                z-index: 1;
            }
        </style>
        </head>
        <body>
        <div class="ad-container">
            <div class="logo-container">
                <img src="${logoUrl}" alt="Logo" class="logo">
            </div>
            <div class="content-wrapper">
                <div class="text-section">
                    <div id="textContainer" class="text-container"></div>
                </div>
                <div class="image-and-cta-container">
                    <div class="main-image-container">
                        <img src="${mainImageUrl}" alt="Main Image" class="main-image">
                    </div>
                    <div class="cta-container">
                        <button class="cta-button">${ctaText}</button>
                    </div>
                </div>
            </div>
        </div>
        <script>
    function formatText() {
        const processedText = ${JSON.stringify(processedPhrase)};
        const container = document.getElementById('textContainer');
        
        if (!container) {
            console.error('Text container not found');
            return;
        }

        console.log('Formatting text:', processedText);
        
        const html = processedText.secondaryText 
            ? \`
                <p class="primary-text">\${processedText.primaryText}</p>
                <p class="secondary-text">\${processedText.secondaryText}</p>
              \`
            : \`<p class="primary-text">\${processedText.primaryText}</p>\`;
        
        container.innerHTML = html;
        
        // Dynamic font size adjustment
        const primaryText = container.querySelector('.primary-text');
        if (primaryText) {
            let fontSize = parseInt(window.getComputedStyle(primaryText).fontSize);
            const minFontSize = 12;
            
            while (
                fontSize > minFontSize && 
                (primaryText.scrollHeight > primaryText.clientHeight || 
                primaryText.scrollWidth > primaryText.clientWidth)
            ) {
                fontSize -= 2;
                primaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }

        const secondaryText = container.querySelector('.secondary-text');
        if (secondaryText) {
            let fontSize = parseInt(window.getComputedStyle(secondaryText).fontSize);
            const minFontSize = 10;
            
            while (
                fontSize > minFontSize && 
                (secondaryText.scrollHeight > secondaryText.clientHeight || 
                secondaryText.scrollWidth > secondaryText.clientWidth)
            ) {
                fontSize -= 2;
                secondaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }
    }

    // Run when DOM is ready and after fonts are loaded
    formatText();
    document.fonts.ready.then(formatText);
</script>
        </body>
        </html>`;
    },

    "1440x1440": (options) => {
        const { fontPath, fontName, adDimensions, bgColor, textColor, ctaColor, ctaTextColor, logoUrl, mainImageUrl, phrase, ctaText } = options;

        const processedPhrase = processAdText(phrase);
        console.log('[createAd] Processed phrase:', processedPhrase);

        // Generate the font-face rule only if fontPath is available
        const fontFaceRule = fontPath
            ? `
            @font-face {
                font-family: '${fontName}';
                src: url('${fontPath}');
            }
        `
            : ''; // No font-face if fontPath is null

        return `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
            ${fontFaceRule}

            body {
              margin: 0;
              padding: 0;
              width: ${adDimensions.width}px;
              height: ${adDimensions.height}px;
              overflow: hidden;
            }

            .ad-container {
              width: 100%;
              height: 100%;
              background-color: ${bgColor};
              box-sizing: border-box;
              display: flex;
              align-items: center;
              flex-direction: column;
              padding: 40px;
              position: relative;
            }

            .content-wrapper {
              display: flex;
              align-items: center;
              flex-direction: column;
              justify-content: flex-start;
              height: 100%;
              width: 100%;
            }

            .cta-button {
              background: ${ctaColor};
              border: none;
              border-radius: 20px;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
              color: ${ctaTextColor};
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
              font-size: 36px;
              font-weight: 600;
              height: 100px;
              letter-spacing: 1px;
              margin: 0 auto;
              min-width: 600px;
              padding: 30px 40px;
              text-transform: uppercase;
              transform: translateY(0);
              transition: transform 0.2s ease;
            }

            .cta-container {
              width: 100%;
              display: flex;
              justify-content: center;
              margin-top: auto;
              padding: 0;
              position: relative;
            }

            .image-and-cta-container {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 60px;
              padding: 40px 0;
            }

            .logo {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }

            .logo-container {
              position: absolute;
              top: 40px;
              right: 40px;
              width: 120px;
              height: 120px;
              z-index: 2;
            }

            .main-image {
              width: 100%;
              height: auto;
              object-fit: contain;
              display: block;
              max-height: 800px;
              filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
            }

            .main-image-container {
              width: 100%;
              max-width: 800px;
              height: auto;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 40px;
              position: relative;
            }

            .primary-text {
              color: ${textColor};
              font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
              font-size: 72px;
              font-weight: 600;
              hyphens: auto;
              letter-spacing: -0.02em;
              line-height: 1.2;
              margin: 0;
              max-width: 95%;
              overflow-wrap: break-word;
              padding: 0;
              text-align: center;
              word-wrap: break-word;
            }
                
            .secondary-text {
              color: ${textColor};
              font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
              font-size: 46px;
              font-weight: 400;
              hyphens: auto;
              line-height: 1.2;
              margin: 0;
              max-width: 90%;
              opacity: 0.9;
              overflow-wrap: break-word;
              padding: 0;
              text-align: center;
              word-wrap: break-word;  
            }

            .text-container {
              display: flex;
              flex-direction: column;
              gap: 24px;
              width: 100%;
            }

            .text-section {
              font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
              margin-bottom: 40px;
              max-width: 80%;
              padding-top: 40px;
              position: relative;
              text-align: center;
              z-index: 1;
            }
        </style>
        </head>
        <body>
        <div class="ad-container">
            <div class="logo-container">
                <img src="${logoUrl}" alt="Logo" class="logo">
            </div>
            <div class="content-wrapper">
                <div class="text-section">
                    <div id="textContainer" class="text-container"></div>
                </div>
                <div class="image-and-cta-container">
                    <div class="main-image-container">
                        <img src="${mainImageUrl}" alt="Main Image" class="main-image">
                    </div>
                    <div class="cta-container">
                        <button class="cta-button">${ctaText}</button>
                    </div>
                </div>
            </div>
        </div>
        <script>
    function formatText() {
        const processedText = ${JSON.stringify(processedPhrase)};
        const container = document.getElementById('textContainer');
        
        if (!container) {
            console.error('Text container not found');
            return;
        }

        console.log('Formatting text:', processedText);
        
        const html = processedText.secondaryText 
            ? \`
                <p class="primary-text">\${processedText.primaryText}</p>
                <p class="secondary-text">\${processedText.secondaryText}</p>
              \`
            : \`<p class="primary-text">\${processedText.primaryText}</p>\`;
        
        container.innerHTML = html;
        
        // Dynamic font size adjustment
        const primaryText = container.querySelector('.primary-text');
        if (primaryText) {
            let fontSize = parseInt(window.getComputedStyle(primaryText).fontSize);
            const minFontSize = 12;
            
            while (
                fontSize > minFontSize && 
                (primaryText.scrollHeight > primaryText.clientHeight || 
                primaryText.scrollWidth > primaryText.clientWidth)
            ) {
                fontSize -= 2;
                primaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }

        const secondaryText = container.querySelector('.secondary-text');
        if (secondaryText) {
            let fontSize = parseInt(window.getComputedStyle(secondaryText).fontSize);
            const minFontSize = 10;
            
            while (
                fontSize > minFontSize && 
                (secondaryText.scrollHeight > secondaryText.clientHeight || 
                secondaryText.scrollWidth > secondaryText.clientWidth)
            ) {
                fontSize -= 2;
                secondaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }
    }

    // Run when DOM is ready and after fonts are loaded
    formatText();
    document.fonts.ready.then(formatText);
</script>
        </body>
        </html>`;
    },

    "1440x1800": (options) => {
        const { fontPath, fontName, adDimensions, bgColor, textColor, ctaColor, ctaTextColor, logoUrl, mainImageUrl, phrase, ctaText } = options;

        const processedPhrase = processAdText(phrase);
        console.log('[createAd] Processed phrase:', processedPhrase);

        // Generate the font-face rule only if fontPath is available
        const fontFaceRule = fontPath
            ? `
            @font-face {
                font-family: '${fontName}';
                src: url('${fontPath}');
            }
        `
            : ''; // No font-face if fontPath is null

        return `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
            ${fontFaceRule}

            body {
              margin: 0;
              padding: 0;
              width: ${adDimensions.width}px;
              height: ${adDimensions.height}px;
              overflow: hidden;
            }

            .ad-container {
              width: 100%;
              height: 100%;
              background-color: ${bgColor};
              box-sizing: border-box;
              display: flex;
              align-items: center;
              flex-direction: column;
              padding: 40px;
              position: relative;
            }

            .content-wrapper {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              flex-direction: column;
              justify-content: flex-start;
              margin-top: 100px;
            }

            .cta-button {
              background: ${ctaColor};
              border: none;
              border-radius: 20px;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
              color: ${ctaTextColor};
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
              font-size: 40px;
              font-weight: 600;
              height: 100px;
              letter-spacing: 1px;
              margin: 0 auto;
              min-width: 600px;
              padding: 30px 40px;
              text-transform: uppercase;
              transform: translateY(0);
              transition: transform 0.2s ease;
            }

            .cta-container {
              width: 100%;
              display: flex;
              justify-content: center;
              padding: 0;
              position: relative;
            }

            .image-and-cta-container {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 20px;
              padding: 40px 0;
            }

            .logo {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }

            .logo-container {
              position: absolute;
              top: 40px;
              right: 40px;
              width: 120px;
              height: 120px;
              z-index: 2;
            }

            .main-image {
              width: 100%;
              height: auto;
              object-fit: contain;
              display: block;
              max-height: 900px;
              filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
            }

            .main-image-container {
              width: 100%;
              max-width: 800px;
              height: auto;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 10px;
              position: relative;
            }

            .primary-text {
              color: ${textColor};
              font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
              font-size: 72px;
              font-weight: 600;
              hyphens: auto;
              letter-spacing: -0.02em;
              line-height: 1.2;
              margin: 0;
              max-width: 95%;
              overflow-wrap: break-word;
              padding: 0;
              text-align: center;
              word-wrap: break-word;
            }
                
            .secondary-text {
              color: ${textColor};
              font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
              font-size: 52px;
              font-weight: 400;
              hyphens: auto;
              line-height: 1.2;
              margin: 0;
              max-width: 90%;
              opacity: 0.9;
              overflow-wrap: break-word;
              padding: 0;
              text-align: center;
              word-wrap: break-word;  
            }

            .text-container {
              display: flex;
              flex-direction: column;
              gap: 24px;
              width: 100%;
            }

            .text-section {
              font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
              margin-bottom: 40px;
              max-width: 80%;
              padding-top: 40px;
              position: relative;
              text-align: center;
              z-index: 1;
            }
        </style>
        </head>
        <body>
        <div class="ad-container">
            <div class="logo-container">
                <img src="${logoUrl}" alt="Logo" class="logo">
            </div>
            <div class="content-wrapper">
                <div class="text-section">
                    <div id="textContainer" class="text-container"></div>
                </div>
                <div class="image-and-cta-container">
                    <div class="main-image-container">
                        <img src="${mainImageUrl}" alt="Main Image" class="main-image">
                    </div>
                    <div class="cta-container">
                        <button class="cta-button">${ctaText}</button>
                    </div>
                </div>
            </div>
        </div>
        <script>
    function formatText() {
        const processedText = ${JSON.stringify(processedPhrase)};
        const container = document.getElementById('textContainer');
        
        if (!container) {
            console.error('Text container not found');
            return;
        }

        console.log('Formatting text:', processedText);
        
        const html = processedText.secondaryText 
            ? \`
                <p class="primary-text">\${processedText.primaryText}</p>
                <p class="secondary-text">\${processedText.secondaryText}</p>
              \`
            : \`<p class="primary-text">\${processedText.primaryText}</p>\`;
        
        container.innerHTML = html;
        
        // Dynamic font size adjustment
        const primaryText = container.querySelector('.primary-text');
        if (primaryText) {
            let fontSize = parseInt(window.getComputedStyle(primaryText).fontSize);
            const minFontSize = 12;
            
            while (
                fontSize > minFontSize && 
                (primaryText.scrollHeight > primaryText.clientHeight || 
                primaryText.scrollWidth > primaryText.clientWidth)
            ) {
                fontSize -= 2;
                primaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }

        const secondaryText = container.querySelector('.secondary-text');
        if (secondaryText) {
            let fontSize = parseInt(window.getComputedStyle(secondaryText).fontSize);
            const minFontSize = 10;
            
            while (
                fontSize > minFontSize && 
                (secondaryText.scrollHeight > secondaryText.clientHeight || 
                secondaryText.scrollWidth > secondaryText.clientWidth)
            ) {
                fontSize -= 2;
                secondaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }
    }

    // Run when DOM is ready and after fonts are loaded
    formatText();
    document.fonts.ready.then(formatText);
</script>
        </body>
        </html>`;
    },

    "1440x2560": (options) => {
        const { fontPath, fontName, adDimensions, bgColor, textColor, ctaColor, ctaTextColor, logoUrl, mainImageUrl, phrase, ctaText } = options;

        const processedPhrase = processAdText(phrase);
        console.log('[createAd] Processed phrase:', processedPhrase);

        // Generate the font-face rule only if fontPath is available
        const fontFaceRule = fontPath
            ? `
            @font-face {
                font-family: '${fontName}';
                src: url('${fontPath}');
            }
        `
            : ''; // No font-face if fontPath is null

        return `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
            ${fontFaceRule}

            body {
              margin: 0;
              padding: 0;
              width: ${adDimensions.width}px;
              height: ${adDimensions.height}px;
              overflow: hidden;
            }

            .ad-container {
              width: 100%;
              height: 100%;
              background-color: ${bgColor};
              box-sizing: border-box;
              display: flex;
              align-items: center;
              flex-direction: column;
              padding: 60px;
              position: relative;
            }

            .content-wrapper {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              flex-direction: column;
              justify-content: flex-start;
              margin-top: 180px;
            }

            .cta-button {
              background: ${ctaColor};
              border: none;
              border-radius: 20px;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
              color: ${ctaTextColor};
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
              font-size: 60px;
              font-weight: 600;
              height: 100px;
              letter-spacing: 1px;
              margin: 0;
              min-width: 600px;
              padding: 80px 100px;
              text-transform: uppercase;
              transform: translateY(0);
              transition: transform 0.2s ease;
            }

            .cta-container {
              width: 100%;
              display: flex;
              justify-content: center;
              position: relative;
            }

            .image-and-cta-container {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              padding-bottom: 100px;
            }

            .logo {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }

            .logo-container {
              position: absolute;
              top: 60px;
              right: 60px;
              width: 160px;
              height: 160px;
              z-index: 2;
            }

            .main-image {
              width: 100%;
              height: auto;
              object-fit: contain;
            }

            .main-image-container {
              width: 100%;
              height: auto;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            }

            .primary-text {
              color: ${textColor};
              font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
              font-size: 84px;
              font-weight: 600;
              hyphens: auto;
              letter-spacing: -0.02em;
              line-height: 1.2;
              margin: 0;
              max-width: 95%;
              overflow-wrap: break-word;
              padding: 0;
              text-align: center;
              word-wrap: break-word;
            }
                
            .secondary-text {
              color: ${textColor};
              font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
              font-size: 64px;
              font-weight: 400;
              hyphens: auto;
              line-height: 1.2;
              margin: 0;
              max-width: 90%;
              opacity: 0.9;
              overflow-wrap: break-word;
              padding: 0;
              text-align: center;
              word-wrap: break-word;  
            }

            .text-container {
              display: flex;
              flex-direction: column;
              gap: 30px;
              width: 100%;
            }

            .text-section {
              font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
              margin-bottom: 80px;
              max-width: 80%;
              padding-top: 40px;
              position: relative;
              text-align: center;
              z-index: 1;
            }
        </style>
        </head>
        <body>
        <div class="ad-container">
            <div class="logo-container">
                <img src="${logoUrl}" alt="Logo" class="logo">
            </div>
            <div class="content-wrapper">
                <div class="text-section">
                    <div id="textContainer" class="text-container"></div>
                </div>
                <div class="image-and-cta-container">
                    <div class="main-image-container">
                        <img src="${mainImageUrl}" alt="Main Image" class="main-image">
                    </div>
                    <div class="cta-container">
                        <button class="cta-button">${ctaText}</button>
                    </div>
                </div>
            </div>
        </div>
        <script>
    function formatText() {
        const processedText = ${JSON.stringify(processedPhrase)};
        const container = document.getElementById('textContainer');
        
        if (!container) {
            console.error('Text container not found');
            return;
        }

        console.log('Formatting text:', processedText);
        
        const html = processedText.secondaryText 
            ? \`
                <p class="primary-text">\${processedText.primaryText}</p>
                <p class="secondary-text">\${processedText.secondaryText}</p>
              \`
            : \`<p class="primary-text">\${processedText.primaryText}</p>\`;
        
        container.innerHTML = html;
        
        // Dynamic font size adjustment
        const primaryText = container.querySelector('.primary-text');
        if (primaryText) {
            let fontSize = parseInt(window.getComputedStyle(primaryText).fontSize);
            const minFontSize = 12;
            
            while (
                fontSize > minFontSize && 
                (primaryText.scrollHeight > primaryText.clientHeight || 
                primaryText.scrollWidth > primaryText.clientWidth)
            ) {
                fontSize -= 2;
                primaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }

        const secondaryText = container.querySelector('.secondary-text');
        if (secondaryText) {
            let fontSize = parseInt(window.getComputedStyle(secondaryText).fontSize);
            const minFontSize = 10;
            
            while (
                fontSize > minFontSize && 
                (secondaryText.scrollHeight > secondaryText.clientHeight || 
                secondaryText.scrollWidth > secondaryText.clientWidth)
            ) {
                fontSize -= 2;
                secondaryText.style.fontSize = \`\${fontSize}px\`;
            }
        }
    }

    // Run when DOM is ready and after fonts are loaded
    formatText();
    document.fonts.ready.then(formatText);
</script>
        </body>
        </html>`;
    },
};

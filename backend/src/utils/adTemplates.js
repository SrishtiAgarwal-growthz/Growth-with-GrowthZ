function processAdText(text) {
  try {
    if (!text || typeof text !== "string") {
      console.error("[processAdText] Invalid text input:", text);
      return { primaryText: "", secondaryText: "" };
    }

    let processedText = text
      .replace(/^\d+\.\s*/, "") // Remove numbering
      .replace(/\*+/g, "") // Remove asterisks
      .replace(/\s*\([^)]*\)/g, "") // Remove parenthetical text
      .replace(/\s+/g, " ") // Normalize spaces
      .replace(/\.{2,}/g, ".") // Fix multiple dots
      .replace(/[""]/g, '"') // Normalize quotes
      .replace(/['']/g, "'") // Normalize apostrophes
      .trim();

    // Handle colon in text
    const colonParts = processedText.split(":");
    if (colonParts.length > 1 && colonParts[1].trim().length > 0) {
      processedText = colonParts[1].trim();
    }

    // Split into sentences
    const sentences = processedText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Format the text based on number of sentences
    if (sentences.length > 1) {
      const midpoint = Math.ceil(sentences.length / 2);
      return {
        primaryText: sentences.slice(0, midpoint).join(" "),
        secondaryText: sentences.slice(midpoint).join(" "),
      };
    }

    return {
      primaryText: processedText,
      secondaryText: "",
    };
  } catch (error) {
    console.error("[processAdText] Error processing text:", error);
    return {
      primaryText: text || "",
      secondaryText: "",
    };
  }
}

export const adTemplates = {
  "300x250": (options) => {
    const {
      fontFamily,
      fontFormat,
      fontPath,
      adDimensions,
      bgColor,
      textColor,
      ctaColor,
      ctaTextColor,
      logoUrl,
      mainImageUrl,
      phrase,
      ctaText,
    } = options;

    const processedPhrase = processAdText(phrase);
    console.log("[createAd] Processed phrase:", processedPhrase);

    // Generate the font-face rule only if fontPath is available
    const fontFaceRule = fontPath
      ? `
         @font-face {
  font-family: '${fontFamily}';
  src: url('${fontPath}') format('${fontFormat}');
  font-weight: normal;
  font-style: normal;
  font-display: block; /* <--- ensures text is shown ASAP once font is ready */
}

        `
      : ""; // No font-face if fontPath is null

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
        position: relative;
      }

      .content-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding-top: 32px;
      }

      .logo-container {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 30px;
        height: 30px;
        z-index: 2;
      }

      .logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .text-section {
        font-family: ${fontFamily};
        margin: 0 auto;
        max-width: 100%;
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
        font-family: ${fontFamily};
        font-size: 12px;
        font-weight: 700;
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
        font-family: ${fontFamily};
        font-size: 10px;
        font-weight: 500;
        hyphens: auto;
        letter-spacing: 1.2px;
        line-height: 1;
        max-width: 100%;
        opacity: 0.9;
        overflow-wrap: break-word;
        padding: 0;
        text-align: center;
        word-wrap: break-word;  
      }

      .image-and-cta-container {
        flex: 1;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
      }

      .main-image-container {
        width: 100%;
        max-width: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        position: relative;
      }

      .main-image {
        width: 100%;
        height: auto;
        object-fit: contain;
        display: block;
        max-height: 110px;
        vertical-align: bottom;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
        margin-bottom: 0;
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
        font-family: ${fontFamily};
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 1px;
        margin: 0 auto;
        min-width: 75px;
        padding: 6px 6px;
        text-transform: uppercase;
        transform: translateY(0);
        transition: transform 0.2s ease;
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
    const {
      fontFamily,
      fontFormat,
      fontPath,
      adDimensions,
      bgColor,
      textColor,
      ctaColor,
      ctaTextColor,
      logoUrl,
      mainImageUrl,
      phrase,
      ctaText,
    } = options;

    const processedPhrase = processAdText(phrase);
    console.log("[createAd] Processed phrase:", processedPhrase);

    // Generate the font-face rule only if fontPath is available
    const fontFaceRule = fontPath
      ? `
         @font-face {
  font-family: '${fontFamily}';
  src: url('${fontPath}') format('${fontFormat}');
  font-weight: normal;
  font-style: normal;
  font-display: block; /* <--- ensures text is shown ASAP once font is ready */
}

        `
      : ""; // No font-face if fontPath is null

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
              position: relative;
            }

            .content-wrapper {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              padding-top: 200px;
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
              font-family: ${fontFamily};
              font-size: 80px;
              font-weight: 600;
              height: 100px;
              letter-spacing: 1px;
              margin: 0;
              min-width: 600px;
              padding: 80px 80px;
              text-transform: uppercase;
              transform: translateY(0);
              transition: transform 0.2s ease;
            }

            .cta-container {
              width: 100%;
              display: flex;
              justify-content: center;
              margin: 20px;
            }

            .image-and-cta-container {
              flex: 1;
              display: flex;
              align-items: center;
              flex-direction: column;
              justify-content: center;
            }

            .main-image {
              width: 100%;
              height: auto;
              object-fit: contain;
              display: block;
              max-height: 1500px;
              vertical-align: bottom;
              filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
              margin-bottom: 0;
            }

            .main-image-container {
              width: 100%;
              height: 1500px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto;
              position: relative;
            }

            .primary-text {
              color: ${textColor};
              font-family: ${fontFamily};
              font-size: 90px;
              font-weight: 700;
              hyphens: auto;
              letter-spacing: 0.02em;
              line-height: 1.2;
              margin: 0;
              max-width: 100%;
              overflow-wrap: break-word;
              text-align: center;
              word-wrap: break-word;
            }
                
            .secondary-text {
              color: ${textColor};
              font-family: ${fontFamily};
              font-size: 76px;
              font-weight: 500;
              hyphens: auto;
              line-height: 1.2;
              max-width: 100%;
              opacity: 0.9;
              overflow-wrap: break-word;
              text-align: center;
              word-wrap: break-word;  
            }

            .text-container {
              display: flex;
              flex-direction: column;
              width: 100%;
            }

            .text-section {
              font-family: ${fontFamily};
              margin: 0 auto;
              max-width: 100%;
              position: relative;
              z-index: 1;
            }
        </style>
        </head>
        <body>
        <div class="ad-container">
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
            const minFontSize = 90;
            
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
            const minFontSize = 76;
            
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

  "800x800": (options) => {
    const {
      fontFamily,
      fontFormat,
      fontPath,
      adDimensions,
      bgColor,
      textColor,
      ctaColor,
      ctaTextColor,
      logoUrl,
      mainImageUrl,
      phrase,
      ctaText,
    } = options;

    const processedPhrase = processAdText(phrase);
    console.log("[createAd] Processed phrase:", processedPhrase);

    // Generate the font-face rule only if fontPath is available
    const fontFaceRule = fontPath
      ? `
         @font-face {
  font-family: '${fontFamily}';
  src: url('${fontPath}') format('${fontFormat}');
  font-weight: normal;
  font-style: normal;
  font-display: block; /* <--- ensures text is shown ASAP once font is ready */
}

        `
      : ""; // No font-face if fontPath is null

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
        position: relative;
      }

      .content-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding-top: 40px;
      }

      .logo-container {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 60px;
        height: 60px;
        z-index: 2;
      }

      .logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .text-section {
        font-family: ${fontFamily};
        margin: 0 auto;
        max-width: 100%;
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
        font-family: ${fontFamily};
        font-size: 30px;
        font-weight: 700;
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
        font-family: ${fontFamily};
        font-size: 28px;
        font-weight: 500;
        hyphens: auto;
        letter-spacing: 1.6px;
        line-height: 1;
        max-width: 100%;
        overflow-wrap: break-word;
        padding: 0;
        text-align: center;
        word-wrap: break-word;  
      }

      .image-and-cta-container {
        flex: 1;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
      }

      .main-image-container {
        width: 100%;
        max-width: 540px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        position: relative;
      }

      .main-image {
        width: 100%;
        height: auto;
        object-fit: contain;
        display: block;
        max-height: 540px;
        vertical-align: bottom;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
        margin-bottom: 0;
      }

      .cta-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 12px;
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
        font-family: ${fontFamily};
        font-size: 28px;
        font-weight: 600;
        letter-spacing: 1px;
        margin: 0 auto;
        min-width: 300px;
        padding: 6px 6px;
        text-transform: uppercase;
        transform: translateY(0);
        transition: transform 0.2s ease;
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
          const minFontSize = 30;
            
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
          const minFontSize = 28;
            
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

  "800x800": (options) => {
    const {
      fontFamily,
      fontFormat,
      fontPath,
      adDimensions,
      bgColor,
      textColor,
      ctaColor,
      ctaTextColor,
      logoUrl,
      mainImageUrl,
      phrase,
      ctaText,
    } = options;

    const processedPhrase = processAdText(phrase);
    console.log("[createAd] Processed phrase:", processedPhrase);

    // Generate the font-face rule only if fontPath is available
    const fontFaceRule = fontPath
      ? `
         @font-face {
  font-family: '${fontFamily}';
  src: url('${fontPath}') format('${fontFormat}');
  font-weight: normal;
  font-style: normal;
  font-display: block; /* <--- ensures text is shown ASAP once font is ready */
}

        `
      : ""; // No font-face if fontPath is null

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
        position: relative;
      }

      .content-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding-top: 40px;
      }

      .logo-container {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 60px;
        height: 60px;
        z-index: 2;
      }

      .logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .text-section {
        font-family: ${fontFamily};
        margin: 0 auto;
        max-width: 100%;
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
        font-family: ${fontFamily};
        font-size: 30px;
        font-weight: 700;
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
        font-family: ${fontFamily};
        font-size: 28px;
        font-weight: 500;
        hyphens: auto;
        letter-spacing: 1.6px;
        line-height: 1;
        max-width: 100%;
        overflow-wrap: break-word;
        padding: 0;
        text-align: center;
        word-wrap: break-word;  
      }

      .image-and-cta-container {
        flex: 1;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
      }

      .main-image-container {
        width: 100%;
        max-width: 540px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        position: relative;
      }

      .main-image {
        width: 100%;
        height: auto;
        object-fit: contain;
        display: block;
        max-height: 540px;
        vertical-align: bottom;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
        margin-bottom: 0;
      }

      .cta-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 12px;
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
        font-family: ${fontFamily};
        font-size: 28px;
        font-weight: 600;
        letter-spacing: 1px;
        margin: 0 auto;
        min-width: 300px;
        padding: 6px 6px;
        text-transform: uppercase;
        transform: translateY(0);
        transition: transform 0.2s ease;
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
          const minFontSize = 30;
            
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
          const minFontSize = 28;
            
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

  "720x900": (options) => {
    const {
      fontFamily,
      fontFormat,
      fontPath,
      adDimensions,
      bgColor,
      textColor,
      ctaColor,
      ctaTextColor,
      logoUrl,
      mainImageUrl,
      phrase,
      ctaText,
    } = options;

    const processedPhrase = processAdText(phrase);
    console.log("[createAd] Processed phrase:", processedPhrase);

    // Generate the font-face rule only if fontPath is available
    const fontFaceRule = fontPath
      ? `
         @font-face {
  font-family: '${fontFamily}';
  src: url('${fontPath}') format('${fontFormat}');
  font-weight: normal;
  font-style: normal;
  font-display: block; /* <--- ensures text is shown ASAP once font is ready */
}

        `
      : ""; // No font-face if fontPath is null

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
        position: relative;
      }

      .content-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding-top: 48px;
      }

      .logo-container {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 60px;
        height: 60px;
        z-index: 2;
      }

      .logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .text-section {
        font-family: ${fontFamily};
        margin: 0 auto;
        max-width: 100%;
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
        font-family: ${fontFamily};
        font-size: 30px;
        font-weight: 700;
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
        font-family: ${fontFamily};
        font-size: 28px;
        font-weight: 500;
        hyphens: auto;
        letter-spacing: 1.6px;
        line-height: 1;
        max-width: 100%;
        overflow-wrap: break-word;
        padding: 0;
        text-align: center;
        word-wrap: break-word;  
      }

      .image-and-cta-container {
        flex: 1;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
      }

      .main-image-container {
        width: 100%;
        max-width: 580px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        position: relative;
      }

      .main-image {
        width: 100%;
        height: auto;
        object-fit: contain;
        display: block;
        max-height: 580px;
        vertical-align: bottom;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
        margin-bottom: 0;
      }

      .cta-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 12px;
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
        font-family: ${fontFamily};
        font-size: 28px;
        font-weight: 600;
        letter-spacing: 1px;
        margin: 0 auto;
        min-width: 300px;
        padding: 6px 6px;
        text-transform: uppercase;
        transform: translateY(0);
        transition: transform 0.2s ease;
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
          const minFontSize = 30;
            
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
          const minFontSize = 28;
            
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
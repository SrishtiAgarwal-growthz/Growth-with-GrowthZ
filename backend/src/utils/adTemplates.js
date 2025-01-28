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
        font-size: 16px;
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
        font-size: 14px;
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

  // 160 x 600
  "160x600": (options) => {
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
      : "";

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

      .logo-container {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 36px;
        height: 36px;
        z-index: 2;
      }

      .logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .content-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding-top: 50px;
      }

      .text-section {
        font-family: ${fontFamily};
        margin: 0 auto;
        max-width: 85%;
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
        font-size: 18px;
        font-weight: 600;
        hyphens: auto;
        letter-spacing: -0.02em;
        line-height: 1.2;
        margin: 0 0 4 0;
        max-width: 95%;
        overflow-wrap: break-word;
        text-align: left;
        word-wrap: break-word;
      }

      .secondary-text {
        color: ${textColor};
        font-family: ${fontFamily};
        font-size: 14px;
        font-weight: 500;
        hyphens: auto;
        letter-spacing: 1.2px;
        line-height: 1;
        margin: 0;
        max-width: 90%;
        opacity: 0.9;
        overflow-wrap: break-word;
        padding: 0;
        text-align: left;
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
        height: 320px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        position: relative;
      }

      .main-image {
        width: 90%;
        height: auto;
        object-fit: contain;
        display: block;
        max-height: 340px;
        vertical-align: bottom;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
        margin-bottom: 0;
      }

      .cta-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
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
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 2px;
        margin: 0;
        min-width: 70px;
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
        padding-top: 44px;
      }

      .logo-container {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 46px;
        height: 46px;
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
        max-width: 95%;
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
        font-family: ${fontFamily};
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
        flex: 1;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
      }

      .main-image-container {
        width: 100%;
        height: 240px;
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
        max-height: 250px;
        vertical-align: bottom;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
        margin-bottom: 0;
      }

      .cta-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 12px;
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
              padding-top: 140px;
            }

            // .cta-button {
            //   background: ${ctaColor};
            //   border: none;
            //   border-radius: 12px;
            //   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            //   color: ${ctaTextColor};
            //   display: flex;
            //   align-items: center;
            //   justify-content: center;
            //   font-family: ${fontFamily};
            //   font-size: 40px;
            //   font-weight: 600;
            //   height: 150px;
            //   letter-spacing: 2px;
            //   margin: 0 auto;
            //   min-width: 300px;
            //   padding: 4px;
            //   text-transform: uppercase;
            //   transform: translateY(0);
            //   transition: transform 0.2s ease;
            // }

            // .cta-container {
            //   width: 100%;
            //   display: flex;
            //   justify-content: center;
            //   padding: 0;
            //   position: relative;
            // }

            .image-and-cta-container {
              flex: 1;
              display: flex;
              align-items: center;
              flex-direction: column;
              justify-content: center;
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
              width: 100px;
              height: 100px;
              z-index: 2;
            }

            .main-image {
              width: 100%;
              height: auto;
              object-fit: contain;
              display: block;
              max-height: 650px;
              vertical-align: bottom;
              filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
              margin-bottom: 0;
            }

            .main-image-container {
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              width: 100%;
              max-width: 1000px;
              margin: 0 auto;
            }

            .primary-text {
              color: ${textColor};
              font-family: ${fontFamily};
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
              font-family: ${fontFamily};
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
              width: 100%;
            }

            .text-section {
              font-family: ${fontFamily};
              margin-top: 0
              margin-bottom: 0;
              margin: 0 auto;
              max-width: 95%;
              padding-top: 0;
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
      : "";// No font-face if fontPath is null

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
              font-family: ${fontFamily};
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
              font-family: ${fontFamily};
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
              font-family: ${fontFamily};
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
              font-family: ${fontFamily};
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
      : "";// No font-face if fontPath is null

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
              padding-top: 240px;
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
              height: 150px;
              letter-spacing: 2px;
              margin: 0 auto;
              min-width: 600px;
              padding: 4px;
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
              align-items: center;
              flex-direction: column;
              justify-content: center;
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
              width: 200px;
              height: 200px;
              z-index: 2;
            }

            .main-image {
              width: 100%;
              height: auto;
              object-fit: contain;
              display: block;
              max-height: 1100px;
              vertical-align: bottom;
              filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));  // Add subtle shadow
              margin-bottom: 0;
            }

            .main-image-container {
              width: 100%;
              max-width: 1000px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto;
              position: relative;
            }

            .primary-text {
              color: ${textColor};
              font-family: ${fontFamily};
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
              font-family: ${fontFamily};
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
              width: 100%;
            }

            .text-section {
              font-family: ${fontFamily};
              margin-top: 0
              margin-bottom: 0;
              max-width: 95%;
              padding-top: 0;
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
              padding-top: 280px;
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
              margin-bottom: 30px;
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
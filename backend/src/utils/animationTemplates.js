function processAdText(text) {
  try {
    if (!text || typeof text !== "string") {
      console.error("[processAdText] Invalid text input:", text);
      return { primaryText: "", secondaryText: "" };
    }

    let processedText = text
      .replace(/^\d+\.\s*/, "") // Remove numbering like "3."
      .replace(/\*+/g, "") // Remove asterisks
      .replace(/\s*\([^)]*\)/g, "") // Remove parenthetical text
      .replace(/\s+/g, " ") // Normalize spaces
      .replace(/\.{2,}/g, ".") // Fix multiple dots
      .replace(/[""]/g, '"') // Normalize quotes
      .replace(/['']/g, "'") // Normalize apostrophes
      .trim();

    // If there's a colon in the text, keep only what comes after the colon
    const colonParts = processedText.split(":");
    if (colonParts.length > 1 && colonParts[1].trim().length > 0) {
      processedText = colonParts[1].trim();
    }

    // Split into sentences based on punctuation
    const sentences = processedText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // If multiple sentences, we break them up into primary & secondary
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

export const animationTemplates = {
  "300x250": ({
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
  }) => {
    const processedPhrase = processAdText(phrase);
    console.log("[createAnimation] Processed phrase:", processedPhrase);

    // Optionally define a @font-face if you have a custom font
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

    // Inline HTML template for the ad
    return `
      <!DOCTYPE html>
      <html>
      <head>
      <style>
      ${fontFaceRule}

      /* Add animation keyframes from code 1 */
      @keyframes slideInFromLeft {
          0% {
              opacity: 0;
              transform: translateX(-100px);
          }
          100% {
              opacity: 1;
              transform: translateX(0);
          }
      }

      @keyframes slideInFromRight {
          0% {
              opacity: 0;
              transform: translateX(100px);
          }
          100% {
              opacity: 1;
              transform: translateX(0);
          }
      }

      @keyframes revealText {
          0% {
              width: 100%;
          }
          100% {
              width: 0%;
          }
      }

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
        padding-top: 34px;
      }

      .logo-container {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 30px;
        height: 30px;
        z-index: 2;
        animation: slideInFromRight 1s ease forwards; /* Add slideInFromRight animation */
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
        opacity: 0;
        transform: translateX(-100px);
        animation: slideInFromLeft 1s ease forwards; /* Add slideInFromLeft animation */
        animation-delay: 0.5s; /* Delay for sequential effect */
      }

      .primary-text {
        color: ${textColor};
        font-family: ${fontFamily};
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
        position: relative;
      }

      .primary-text::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        background: ${bgColor}; /* Same as background to hide text initially */
        z-index: 1;
        animation: revealText 1.2s ease forwards; /* Add revealText animation */
      }

      .secondary-text {
        color: ${textColor};
        font-family: ${fontFamily};
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
        position: relative;
      }

      .secondary-text::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        background: ${bgColor}; /* Same as background to hide text initially */
        z-index: 1;
        animation: revealText 1.2s ease forwards; /* Add revealText animation */
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
        opacity: 0;
        transform: translateX(100px);
        animation: slideInFromRight 1s ease forwards; /* Add slideInFromRight animation */
        animation-delay: 1s; /* Delay for sequential effect */
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
        opacity: 0;
        transform: translateX(-100px);
        animation: slideInFromLeft 1s ease forwards; /* Add slideInFromLeft animation */
        animation-delay: 1.5s; /* Delay for sequential effect */
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

  "1080x1080": ({
    fontFamily,
      fontFormat,
      fontPath,
      adDimensions,
      bgColor,
      textColor,
      // ctaColor,
      // ctaTextColor,
      logoUrl,
      mainImageUrl,
      phrase,
      // ctaText,
  }) => {
    const processedPhrase = processAdText(phrase);
    console.log("[createAnimation] Processed phrase:", processedPhrase);

    // Optionally define a @font-face if you have a custom font
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

    // Inline HTML template for the ad
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
            background-color: ${bgColor};
          }

          .ad-container {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            flex-direction: column;
            position: relative;
            background-color: ${bgColor};
          }

          .logo-container {
            position: absolute;
            top: 32px;
            right: 32px;
            width: 100px;
            height: 100px;
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
            padding-top: 140px;
          }

          .text-section {
            font-family: ${fontFamily};
            margin: 0 auto;
            max-width: 95%;
            text-align: center;
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
            font-size: 56px;
            font-weight: 600;
            line-height: 1.15;
            margin: 0 0 32px 0;
            word-wrap: break-word;
            animation: fadeUp 4s ease 0s forwards;
          }

          .secondary-text {
            color: ${textColor};
            font-family:${fontFamily};
            font-size: 46px;
            font-weight: 400;
            line-height: 1.2;
            margin: 0;
            opacity: 0.9;
            word-wrap: break-word;
            animation: fadeUp 4s ease 0s forwards;
          }

          .image-and-cta-container {
            flex: 1;
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: center;
          }

          .main-image-container {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
          }

          .main-image {
            width: 100%;
            height: auto;
            object-fit: contain;
            display: block;
            max-height: 650px;
            filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
            animation: fadeUp 4s ease 0s forwards;
          }

          @keyframes fadeUp {
            0% {
              opacity: 0;
              transform: translateY(60px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
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
        }

        // Wait for fonts to be ready, then insert text
        document.fonts.ready.then(() => {
          formatText();
        });
      </script>
      </body>
      </html>
    `;
  },
};

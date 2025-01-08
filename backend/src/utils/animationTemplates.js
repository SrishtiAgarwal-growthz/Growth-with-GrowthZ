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
  "1080x1080": ({
    fontPath,
    fontName,
    logoUrl,
    mainImageUrl,
    phrase,
    bgColor,
    textColor,
    // ctaText,      // If you want a CTA, uncomment & add to HTML
    // ctaColor,
    // ctaTextColor,
    adDimensions,
  }) => {
    const processedPhrase = processAdText(phrase);
    console.log("[createAnimation] Processed phrase:", processedPhrase);

    // Optionally define a @font-face if you have a custom font
    const fontFaceRule = fontPath
      ? `
        @font-face {
          font-family: '${fontName}';
          src: url('${fontPath}');
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
            font-family: ${fontPath ? `'${fontName}'` : "Arial, sans-serif"};
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
            font-family: inherit;
            font-size: 56px;
            font-weight: 600;
            line-height: 1.15;
            margin: 0 0 32px 0;
            word-wrap: break-word;
            animation: fadeUp 4s ease 0s forwards;
          }

          .secondary-text {
            color: ${textColor};
            font-family: inherit;
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

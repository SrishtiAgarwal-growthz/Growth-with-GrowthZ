import { saveGeneratedPhrases, updatePhraseStatus } from "../services/phraseService.js";

export const createPhrases = async (req, res) => {
  console.log("[PhraseController] Request to save generated phrases received:", req.body);

  try {
    const { appId, phrases } = req.body;

    if (!appId || !phrases || !phrases.length) {
      return res.status(400).json({ message: "App ID and phrases are required." });
    }

    const savedPhrases = await saveGeneratedPhrases(appId, phrases);
    res.status(201).json({
      message: "Generated phrases saved successfully.",
      savedPhrases,
    });
  } catch (error) {
    console.error("[PhraseController] Error saving phrases:", error.message);
    res.status(500).json({ message: "Error saving phrases.", error: error.message });
  }
};

export const updatePhrase = async (req, res) => {
  console.log("[PhraseController] Request to update phrase status received:", req.body);

  try {
    const { phraseId, status } = req.body;

    if (!phraseId || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Phrase ID and valid status are required." });
    }

    await updatePhraseStatus(phraseId, status);

    res.status(200).json({
      message: `Phrase status updated to ${status}.`,
    });
  } catch (error) {
    console.error("[PhraseController] Error updating phrase status:", error.message);
    res.status(500).json({ message: "Error updating phrase status.", error: error.message });
  }
};

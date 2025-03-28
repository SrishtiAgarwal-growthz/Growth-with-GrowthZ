import { approvePhraseService, rejectPhraseService  } from "../services/reviewsStatusService.js";

/**
 * Approve a phrase by its text and appId.
 */
export const saveApprovedPhrase = async (req, res) => {
  try {
    const { text, appId, userId } = req.body;

    if (!text || !appId || !userId) {
      return res.status(400).json({ message: "Need text, appId, and userId" });
    }

    const result = await approvePhraseService(text, appId, userId);

    if (result.modifiedCount > 0) {
      return res.status(200).json({ message: "Phrase approved successfully." });
    } else {
      return res.status(404).json({ message: "Phrase not found or already approved." });
    }
  } catch (error) {
    console.error("[saveApprovedPhrase] Error approving phrase:", error.message);
    res.status(500).json({ message: "Error approving phrase.", error: error.message });
  }
};

/**
 * Reject a phrase by its text and appId.
 */
export const saveRejectedPhrase = async (req, res) => {
  try {
    const { text, appId, userId } = req.body;

    if (!text || !appId || !userId) {
      return res.status(400).json({ message: "Need text, appId, and userId" });
    }

    const result = await rejectPhraseService(text, appId, userId);

    if (result.modifiedCount > 0) {
      return res.status(200).json({ message: "Phrase rejected successfully." });
    } else {
      return res.status(404).json({ message: "Phrase not found or already rejected." });
    }
  } catch (error) {
    console.error("[saveRejectedPhrase] Error rejecting phrase:", error.message);
    res.status(500).json({ message: "Error rejecting phrase.", error: error.message });
  }
};
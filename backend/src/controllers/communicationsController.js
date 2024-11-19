import * as communicationsService from '../services/communicationsService.js';

export const saveApprovedPhrase = async (req, res) => {
  const { phrase, email } = req.body;

  if (!phrase || !email) {
    return res.status(400).send("Phrase and email are required.");
  }

  try {
    await communicationsService.saveApprovedPhraseInDb(email, phrase);
    return res.status(200).json({ message: 'Approved phrase saved successfully.' });
  } catch (error) {
    return res.status(500).json({ message: "Error saving approved phrase.", error: error.message });
  }
};

export const saveRejectedPhrase = async (req, res) => {
  const { phrase, email } = req.body;

  if (!phrase || !email) {
    return res.status(400).send("Phrase and email are required.");
  }

  try {
    await communicationsService.saveRejectedPhraseInDb(email, phrase);
    return res.status(200).json({ message: 'Rejected phrase saved successfully.' });
  } catch (error) {
    return res.status(500).json({ message: "Error saving rejected phrase.", error: error.message });
  }
};

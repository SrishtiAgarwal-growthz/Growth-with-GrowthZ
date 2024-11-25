import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Export the function
export const extractMeaningfulWords = (reviews) => {
    const stopwords = new Set([
        "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
        "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she",
        "her", "hers", "herself", "it", "its", "itself", "they", "them", "their",
        "theirs", "themselves", "what", "which", "who", "whom", "this", "that",
        "these", "those", "am", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an",
        "the", "and", "but", "if", "or", "because", "as", "until", "while", "of",
        "at", "by", "for", "with", "about", "against", "between", "into", "through",
        "during", "before", "after", "above", "below", "to", "from", "up", "down",
        "in", "out", "on", "off", "over", "under", "again", "further", "then", "once",
        "here", "there", "when", "where", "why", "how", "all", "any", "both", "each",
        "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
        "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just",
        "don", "should", "now"
    ]);

    const meaningfulWords = new Set(); // Use a Set to store unique words
    reviews.forEach((review) => {
        const words = review
            .toLowerCase() // Convert to lowercase
            .replace(/[^a-z\s]/g, "") // Remove non-alphabetic characters
            .split(/\s+/); // Split by whitespace
        words.forEach((word) => {
            if (word && !stopwords.has(word)) {
                meaningfulWords.add(word); // Add unique meaningful words
            }
        });
    });
    return Array.from(meaningfulWords); // Convert Set back to an Array
};

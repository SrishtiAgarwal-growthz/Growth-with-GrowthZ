import {
    approveCreativeService,
    rejectCreativeService,
    fetchCreativesByStatus,
} from "../services/creativesStatusService.js";

// Approve a creative
export const approveCreative = async (req, res) => {
    try {
        const { creativeId } = req.body;

        if (!creativeId) {
            return res.status(400).json({ message: "Creative ID is required." });
        }

        const updatedCreative = await approveCreativeService(creativeId);
        res.status(200).json({ message: "Creative approved successfully.", updatedCreative });
    } catch (error) {
        console.error("[ApprovalController] Error approving creative:", error);
        res.status(500).json({ message: "Error approving creative.", error: error.message });
    }
};

// Reject a creative
export const rejectCreative = async (req, res) => {
    try {
        const { creativeId } = req.body;

        if (!creativeId) {
            return res.status(400).json({ message: "Creative ID is required." });
        }

        const updatedCreative = await rejectCreativeService(creativeId);
        res.status(200).json({ message: "Creative rejected successfully.", updatedCreative });
    } catch (error) {
        console.error("[ApprovalController] Error rejecting creative:", error);
        res.status(500).json({ message: "Error rejecting creative.", error: error.message });
    }
};

// Fetch creatives by status
export const getCreativesByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        if (!status) {
            return res.status(400).json({ message: "Status is required." });
        }

        const creatives = await fetchCreativesByStatus(status);
        res.status(200).json({ message: "Creatives fetched successfully.", creatives });
    } catch (error) {
        console.error("[ApprovalController] Error fetching creatives by status:", error);
        res.status(500).json({ message: "Error fetching creatives by status.", error: error.message });
    }
};

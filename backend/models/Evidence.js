const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
    {
        evidenceId: {
            type: String,
            required: true,
            unique: true
        },

        caseId: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        type: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: ""
        },

        collectedBy: {
            type: String,
            required: true
        },

        location: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            default: "Collected"
        },

        fileName: {
            type: String,
            default: ""
        },

        filePath: {
            type: String,
            default: ""
        },

        fileHash: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Evidence", evidenceSchema); 
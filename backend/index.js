const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Evidence = require("./models/Evidence");

dotenv.config();

// ============================================================
// APP SETUP
// ============================================================

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/detectivex";

// ============================================================
// SOCKET.IO
// ============================================================

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
});

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

const uploadsDirectory = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory, { recursive: true });
}

// Make uploaded files accessible
app.use("/uploads", express.static(uploadsDirectory));

// ============================================================
// MULTER
// ============================================================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDirectory);
    },

    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);

        const safeName = path
            .basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9_-]/g, "_");

        const uniqueName =
            `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${safeName}${extension}`;

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function normalize(value) {
    return String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function createEvidenceId() {
    return `EVD-${Date.now()}-${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;
}

function buildEvidenceHashData(evidence) {
    return {
        evidenceId: evidence.evidenceId,
        caseId: evidence.caseId,
        name: evidence.name,
        type: evidence.type,
        description: evidence.description || "",
        collectedBy: evidence.collectedBy,
        location: evidence.location || "",
        status: evidence.status || "",
        fileName: evidence.fileName || "",
        filePath: evidence.filePath || "",
        createdAt: evidence.createdAt
    };
}

function generateHash(evidence) {
    const hashData = buildEvidenceHashData(evidence);

    return crypto
        .createHash("sha256")
        .update(JSON.stringify(hashData))
        .digest("hex");
}

// ============================================================
// BASIC ROUTES
// ============================================================

app.get("/", (req, res) => {
    res.json({
        message: "DetectiveX Backend is running",
        status: "success",
        port: PORT
    });
});

app.get("/api/health", async (req, res) => {
    const mongoStatus =
        mongoose.connection.readyState === 1
            ? "connected"
            : "disconnected";

    res.json({
        success: true,
        status: "OK",
        service: "DetectiveX API",
        mongodb: mongoStatus,
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// CREATE EVIDENCE
// ============================================================

app.post("/api/evidence", async (req, res) => {
    try {
        const {
            caseId,
            name,
            type,
            description,
            collectedBy,
            location,
            severity,
            notes,
            gps,
            temperature,
            humidity,
            rfid,
            fingerprint,
            weight,
            condition
        } = req.body;

        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        if (!caseId || !name || !type || !collectedBy) {
            return res.status(400).json({
                success: false,
                message:
                    "caseId, name, type and collectedBy are required"
            });
        }

        // --------------------------------------------------------
        // NORMALIZE VALUES
        // --------------------------------------------------------

        const normalizedCaseId = String(caseId).trim();
        const normalizedName = String(name).trim();
        const normalizedType = String(type).trim();
        const normalizedCollectedBy = String(collectedBy).trim();
        const normalizedLocation = String(location || "").trim();

        // --------------------------------------------------------
        // DUPLICATE CHECK
        //
        // Case-insensitive and whitespace-insensitive.
        // This prevents:
        //
        // "Knife"
        // "knife"
        // " KNIFE "
        //
        // from being created as separate evidence.
        // --------------------------------------------------------

        const existingEvidence = await Evidence.findOne({
            caseId: {
                $regex: `^${escapeRegex(normalizedCaseId)}$`,
                $options: "i"
            },

            name: {
                $regex: `^${escapeRegex(normalizedName)}$`,
                $options: "i"
            },

            type: {
                $regex: `^${escapeRegex(normalizedType)}$`,
                $options: "i"
            },

            collectedBy: {
                $regex: `^${escapeRegex(normalizedCollectedBy)}$`,
                $options: "i"
            },

            location: {
                $regex: `^${escapeRegex(normalizedLocation)}$`,
                $options: "i"
            }
        });

        if (existingEvidence) {
            return res.status(409).json({
                success: false,
                duplicate: true,
                message: "This evidence already exists",
                evidence: existingEvidence
            });
        }

        // --------------------------------------------------------
        // CREATE NEW EVIDENCE
        // --------------------------------------------------------

        const evidenceId = createEvidenceId();

        const evidenceData = {
            evidenceId,
            caseId: normalizedCaseId,
            name: normalizedName,
            type: normalizedType,
            description: description || "",
            collectedBy: normalizedCollectedBy,
            location: normalizedLocation,
            status: "Collected"
        };

        // --------------------------------------------------------
        // OPTIONAL SENSOR / FORENSIC DATA
        // --------------------------------------------------------

        if (severity !== undefined) {
            evidenceData.severity = severity;
        }

        if (notes !== undefined) {
            evidenceData.notes = notes;
        }

        if (gps !== undefined) {
            evidenceData.gps = gps;
        }

        if (temperature !== undefined) {
            evidenceData.temperature = temperature;
        }

        if (humidity !== undefined) {
            evidenceData.humidity = humidity;
        }

        if (rfid !== undefined) {
            evidenceData.rfid = rfid;
        }

        if (fingerprint !== undefined) {
            evidenceData.fingerprint = fingerprint;
        }

        if (weight !== undefined) {
            evidenceData.weight = weight;
        }

        if (condition !== undefined) {
            evidenceData.condition = condition;
        }

        const evidence = new Evidence(evidenceData);

        const savedEvidence = await evidence.save();

        // Send update to connected frontend clients
        io.emit("evidence:created", savedEvidence);

        return res.status(201).json({
            success: true,
            duplicate: false,
            message: "Evidence created successfully",
            evidence: savedEvidence
        });

    } catch (error) {
        console.error("Evidence creation failed:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to create evidence",
            error: error.message
        });
    }
});

// ============================================================
// GET ALL EVIDENCE
// ============================================================

app.get("/api/evidence", async (req, res) => {
    try {
        const evidence = await Evidence
            .find()
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: evidence.length,
            evidence
        });

    } catch (error) {
        console.error("Failed to fetch evidence:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch evidence",
            error: error.message
        });
    }
});

// ============================================================
// GET SINGLE EVIDENCE
// ============================================================

app.get("/api/evidence/:evidenceId", async (req, res) => {
    try {
        const evidence = await Evidence.findOne({
            evidenceId: req.params.evidenceId
        });

        if (!evidence) {
            return res.status(404).json({
                success: false,
                message: "Evidence not found"
            });
        }

        return res.json({
            success: true,
            evidence
        });

    } catch (error) {
        console.error("Failed to fetch evidence:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch evidence",
            error: error.message
        });
    }
});

// ============================================================
// UPLOAD EVIDENCE FILE
// ============================================================

app.post(
    "/api/evidence/:evidenceId/upload",
    upload.single("file"),
    async (req, res) => {
        try {
            const evidence = await Evidence.findOne({
                evidenceId: req.params.evidenceId
            });

            if (!evidence) {
                // Delete uploaded file if evidence doesn't exist
                if (req.file) {
                    fs.unlink(req.file.path, () => { });
                }

                return res.status(404).json({
                    success: false,
                    message: "Evidence not found"
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });
            }

            // Remove previous uploaded file if there was one
            if (evidence.filePath && fs.existsSync(evidence.filePath)) {
                try {
                    fs.unlinkSync(evidence.filePath);
                } catch (deleteError) {
                    console.warn(
                        "Could not remove previous file:",
                        deleteError.message
                    );
                }
            }

            evidence.fileName = req.file.originalname;
            evidence.filePath = req.file.path;

            await evidence.save();

            io.emit("evidence:updated", evidence);

            return res.status(200).json({
                success: true,
                message: "Evidence file uploaded successfully",
                evidenceId: evidence.evidenceId,
                fileName: evidence.fileName,
                filePath: `/uploads/${path.basename(req.file.path)}`
            });

        } catch (error) {
            console.error("File upload failed:");
            console.error(error);

            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlink(req.file.path, () => { });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to upload evidence file",
                error: error.message
            });
        }
    }
);

// ============================================================
// GENERATE SHA-256 HASH
// ============================================================

app.post("/api/evidence/:evidenceId/hash", async (req, res) => {
    try {
        const evidence = await Evidence.findOne({
            evidenceId: req.params.evidenceId
        });

        if (!evidence) {
            return res.status(404).json({
                success: false,
                message: "Evidence not found"
            });
        }

        const hash = generateHash(evidence);

        evidence.fileHash = hash;

        await evidence.save();

        return res.status(200).json({
            success: true,
            message: "SHA-256 hash generated successfully",
            evidenceId: evidence.evidenceId,
            hash,
            integrityStatus: "VERIFIED",
            verifiedBy: "System"
        });

    } catch (error) {
        console.error("Hash generation failed:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate SHA-256 hash",
            error: error.message
        });
    }
});

// ============================================================
// VERIFY HASH
// ============================================================

app.get("/api/evidence/:evidenceId/verify", async (req, res) => {
    try {
        const evidence = await Evidence.findOne({
            evidenceId: req.params.evidenceId
        });

        if (!evidence) {
            return res.status(404).json({
                success: false,
                message: "Evidence not found"
            });
        }

        if (!evidence.fileHash) {
            return res.json({
                success: true,
                evidenceId: evidence.evidenceId,
                integrityStatus: "NOT_VERIFIED",
                message: "No SHA-256 hash has been generated yet"
            });
        }

        const currentHash = generateHash(evidence);

        const verified =
            currentHash === evidence.fileHash;

        return res.json({
            success: true,
            evidenceId: evidence.evidenceId,
            storedHash: evidence.fileHash,
            currentHash,
            integrityStatus: verified
                ? "VERIFIED"
                : "COMPROMISED"
        });

    } catch (error) {
        console.error("Hash verification failed:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to verify evidence integrity",
            error: error.message
        });
    }
});

// ============================================================
// REAL ESP8266 HARDWARE API
// ============================================================

let latestHardwareData = {
    fingerprint: {
        matched: false,
        id: null,
        confidence: 0
    },

    accessStatus: "WAITING",

    buzzer: false,

    timestamp: new Date().toISOString()
};


// ------------------------------------------------------------
// ESP8266 SENDS FINGERPRINT DATA HERE
// ------------------------------------------------------------

app.post("/api/hardware/fingerprint", (req, res) => {

    try {

        const {
            fingerprintId,
            matched,
            confidence,
            accessStatus,
            buzzer
        } = req.body;


        latestHardwareData = {

            fingerprint: {
                matched: Boolean(matched),

                id:
                    fingerprintId !== undefined
                        ? fingerprintId
                        : null,

                confidence:
                    confidence !== undefined
                        ? confidence
                        : 0
            },

            accessStatus:
                accessStatus || "UNKNOWN",

            buzzer: Boolean(buzzer),

            timestamp:
                new Date().toISOString()
        };


        console.log("");
        console.log("======================================");
        console.log(" REAL HARDWARE DATA RECEIVED");
        console.log("======================================");
        console.log(latestHardwareData);
        console.log("");


        // Send REAL hardware data to website
        io.emit(
            "sensor-update",
            latestHardwareData
        );


        return res.status(200).json({

            success: true,

            message:
                "Fingerprint data received successfully",

            data:
                latestHardwareData
        });

    } catch (error) {

        console.error(
            "Hardware data error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to receive hardware data"
        });
    }

});


// ------------------------------------------------------------
// GET LATEST HARDWARE DATA
// ------------------------------------------------------------

app.get(
    "/api/hardware/latest",

    (req, res) => {

        return res.json({

            success: true,

            data:
                latestHardwareData
        });

    }
);

// ============================================================
// SOCKET.IO CONNECTION
// ============================================================

io.on("connection", (socket) => {

    console.log(
        "DetectiveX device/client connected:",
        socket.id
    );

    // Send latest hardware data immediately
    socket.emit(
        "sensor-update",
        latestHardwareData
    );

    socket.on("disconnect", () => {

        console.log(
            "Client disconnected:",
            socket.id
        );

    });

});

// ============================================================
// IoT SENSOR SIMULATOR
// ============================================================

let sensorInterval = null;

function startSensorSimulator() {

    if (sensorInterval) {
        return;
    }

    console.log("Starting DetectiveX IoT sensor simulator...");

    sensorInterval = setInterval(() => {

        const sensorData = {

            temperature: Number(
                (20 + Math.random() * 8).toFixed(1)
            ),

            humidity: Number(
                (40 + Math.random() * 20).toFixed(1)
            ),

            gps: {
                latitude: Number(
                    (
                        17.3850 +
                        (Math.random() - 0.5) * 0.01
                    ).toFixed(6)
                ),

                longitude: Number(
                    (
                        78.4867 +
                        (Math.random() - 0.5) * 0.01
                    ).toFixed(6)
                )
            },

            rfid:
                `RF-${Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase()}`,

            fingerprint: {
                matched: Math.random() > 0.5,
                confidence:
                    Math.floor(70 + Math.random() * 30)
            },

            battery:
                Math.floor(70 + Math.random() * 30),

            timestamp:
                new Date().toISOString()
        };

        console.log("📡 IoT Sensor Data:", sensorData);

        io.emit(
            "sensor-update",
            sensorData
        );

    }, 3000);
}

// ============================================================
// ESCAPE REGEX
// ============================================================

function escapeRegex(value) {
    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}

// ============================================================
// START SERVER
// ============================================================

async function startServer() {

    try {

        console.log("");
        console.log("======================================");
        console.log("       DETECTIVEX BACKEND");
        console.log("======================================");
        console.log("");

        console.log("Connecting to MongoDB...");

        await mongoose.connect(MONGODB_URI);

        console.log("MongoDB connected successfully");

        server.listen(PORT, () => {

            console.log("");
            console.log(
                `DetectiveX Backend running on http://localhost:${PORT}`
            );

            console.log(
                `Health check: http://localhost:${PORT}/api/health`
            );

            console.log(
                `Evidence API: http://localhost:${PORT}/api/evidence`
            );

            console.log("");

            // startSensorSimulator();
        });

    } catch (error) {

        console.error("");
        console.error("======================================");
        console.error("       BACKEND STARTUP FAILED");
        console.error("======================================");
        console.error("");

        console.error(error);

        process.exit(1);
    }
}

// ============================================================
// MONGODB EVENTS
// ============================================================

mongoose.connection.on("error", (error) => {
    console.error("MongoDB error:", error.message);
});

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

process.on("SIGINT", async () => {

    console.log("");
    console.log("Shutting down DetectiveX backend...");

    if (sensorInterval) {
        clearInterval(sensorInterval);
        sensorInterval = null;
    }

    await mongoose.connection.close();

    server.close(() => {
        console.log("DetectiveX backend stopped.");
        process.exit(0);
    });
});

process.on("SIGTERM", async () => {

    if (sensorInterval) {
        clearInterval(sensorInterval);
        sensorInterval = null;
    }

    await mongoose.connection.close();

    server.close(() => {
        process.exit(0);
    });
});

// ============================================================
// START
// ============================================================

startServer();
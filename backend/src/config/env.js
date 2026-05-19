import "dotenv/config";

const read = (key, { required = false, defaultValue } = {}) => {
    const raw = process.env[key];
    const value = typeof raw === "string" ? raw.trim() : raw;

    if (!value && required) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value || defaultValue;
};

const maybeWarnMalformedMongo = (value) => {
    if (!value) return;

    // Common mistake: pasting "Key: MONGODB_URI" as the env value.
    if (/^key\s*:\s*mongodb_uri$/i.test(value)) {
        throw new Error(
            "MONGODB_URI appears malformed (got 'Key: MONGODB_URI'). Use only the URI value."
        );
    }
};

const PORT = Number(read("PORT", { defaultValue: "8000" }));
const MONGODB_URI = read("MONGODB_URI", { required: true });
const JWT_SECRET = read("JWT_SECRET", { required: true });
const JWT_EXPIRES_IN = read("JWT_EXPIRES_IN", { defaultValue: "7d" });
const CORS_ORIGIN = read("CORS_ORIGIN", { defaultValue: "http://localhost:5173" })
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

if (!Number.isFinite(PORT) || PORT <= 0) {
    throw new Error("PORT must be a positive number.");
}

maybeWarnMalformedMongo(MONGODB_URI);

export const env = {
    PORT,
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    CORS_ORIGIN,
};
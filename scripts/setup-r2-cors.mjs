// Configure CORS on the R2 bucket so the browser can PUT presigned uploads.
// Usage: node scripts/setup-r2-cors.mjs [extra-origin ...]
import { loadEnvConfig } from "@next/env";
import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

loadEnvConfig(process.cwd());

const {
  R2_ACCOUNT_ID,
  R2_ENDPOINT,
  R2_BUCKET,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
} = process.env;

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error("R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY belum diisi di .env.local");
  process.exit(1);
}

const origins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...process.argv.slice(2),
];

const client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT ?? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

await client.send(
  new PutBucketCorsCommand({
    Bucket: R2_BUCKET ?? "dkenang",
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: origins,
          AllowedMethods: ["GET", "PUT", "HEAD"],
          AllowedHeaders: ["*"],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }),
);

console.log(`CORS R2 berhasil di-set untuk bucket "${R2_BUCKET}".`);
console.log("Allowed origins:", origins.join(", "));

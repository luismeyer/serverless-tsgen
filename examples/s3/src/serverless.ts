import { S3 } from "aws-sdk"
const s3Client = new S3({ region: "eu-central-1" })

type GetObjectOptions = Omit<S3.GetObjectRequest, "Bucket">

export const LUIS_LARA_FRONTEND_BUCKET = "luis-lara-frontend"

export function getLuisLaraFrontend(options: GetObjectOptions) {
  return s3Client
    .getObject({ Bucket: LUIS_LARA_FRONTEND_BUCKET, ...options })
    .promise()
}

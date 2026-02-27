// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next"

export const uploadthing = createUploadthing()

// Define your file router
export const ourFileRouter = {
    imageUploader: uploadthing
        .fileTypes(["image"])
        .maxSize("4MB")
        .onUploadComplete(({ file }) => {
            console.log("File uploaded:", file)
        }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
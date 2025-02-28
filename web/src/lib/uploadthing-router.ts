import { createUploadthing, type FileRouter as UploadThingFileRouter } from "uploadthing/server";
import { getAuth } from "firebase/auth";
import type { UploadThingMetadata, UploadThingFile, UploadThingResponse } from "./uploadthing-types";

const f = createUploadthing();

export const fileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) throw new Error("Unauthorized");

      const metadata: UploadThingMetadata = { userId: user.uid };
      return metadata;
    })
    .onUploadComplete(async ({ metadata, file }: { 
      metadata: UploadThingMetadata; 
      file: UploadThingFile; 
    }): Promise<UploadThingResponse> => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { uploadedBy: metadata.userId };
    }),
} satisfies UploadThingFileRouter;

export type FileRouter = typeof fileRouter; 
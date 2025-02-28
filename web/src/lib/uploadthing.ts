import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import type { FileRouter } from "./uploadthing-router";

export const { UploadButton, UploadDropzone } = {
  UploadButton: generateUploadButton<FileRouter>(),
  UploadDropzone: generateUploadDropzone<FileRouter>(),
}; 
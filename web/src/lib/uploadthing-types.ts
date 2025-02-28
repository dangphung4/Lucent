export interface UploadThingMetadata {
  userId: string;
}

export interface UploadThingFile {
  url: string;
  name: string;
  size: number;
  key: string;
}

export interface UploadThingResponse {
  uploadedBy: string;
}

export interface UploadThingError {
  message: string;
  code: string;
} 
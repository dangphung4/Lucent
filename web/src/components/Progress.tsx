import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { UploadButton, UploadDropzone } from "../lib/uploadthing";
import { Camera, Upload } from "lucide-react";

interface ProgressEntry {
  id: string;
  imageUrl: string;
  date: Date;
  notes?: string;
}

export function Progress() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Track Your Progress</h3>
              <p className="text-sm text-muted-foreground text-center">
                Take or upload photos to track your skincare journey
              </p>
            </div>

            <div className="grid w-full gap-4">
              {/* Camera Upload (Mobile Only) */}
              <div className="sm:hidden">
                <UploadButton
                  endpoint="imageUploader"
                  content={{
                    button({ ready }) {
                      return (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          disabled={!ready}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Take Photo
                        </Button>
                      );
                    }
                  }}
                  appearance={{
                    button: "ut-ready:bg-primary ut-ready:text-primary-foreground",
                    allowedContent: "hidden"
                  }}
                  config={{
                    mode: "auto"
                  }}
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      setEntries(prev => [...prev, {
                        id: crypto.randomUUID(),
                        imageUrl: res[0].url,
                        date: new Date()
                      }]);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.error("Upload error:", error);
                    alert("Upload failed. Please try again.");
                  }}
                />
              </div>

              {/* File Upload (All Devices) */}
              <UploadDropzone
                endpoint="imageUploader"
                content={{
                  label: "Drop your photo here or click to browse",
                  uploadIcon: <Upload className="w-8 h-8" />
                }}
                appearance={{
                  container: "ut-upload-container:border-2 ut-upload-container:border-dashed ut-upload-container:rounded-lg ut-upload-container:p-8",
                  label: "ut-label:text-base",
                  allowedContent: "hidden"
                }}
                config={{
                  mode: "auto"
                }}
                onClientUploadComplete={(res) => {
                  if (res?.[0]) {
                    setEntries(prev => [...prev, {
                      id: crypto.randomUUID(),
                      imageUrl: res[0].url,
                      date: new Date()
                    }]);
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error("Upload error:", error);
                  alert("Upload failed. Please try again.");
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Gallery */}
      {entries.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Progress Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={entry.imageUrl}
                    alt={`Progress photo from ${entry.date.toLocaleDateString()}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">
                    {entry.date.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
export interface ProcessedDocument {
  uri: string;
  base64: string;
  width: number;
  height: number;
}

export interface ScannerState {
  isProcessing: boolean;
  error: string | null;
  image: ProcessedDocument | null;
}

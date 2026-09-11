export interface CompressPdfResult {
  blob: Blob;
  originalBytes: number;
  finalBytes: number;
  rasterized: boolean;
  reachedTarget: boolean;
  dpiUsed?: number;
}

export interface CompressPdfOptions {
  targetKB: number;
  /** Called with progress updates as compression tries successive strategies. */
  onProgress?: (message: string) => void;
}

export interface PageImage {
  file: Blob;
  rotationDeg: 0 | 90 | 180 | 270;
}

export interface ImagesToPdfOptions {
  images: PageImage[];
  fitToPage: boolean;
}

export interface IdCardOptions {
  frontImage: Blob;
  backImage: Blob;
}

export interface PdfPreview {
  dataUrl: string;
  widthPt: number;
  heightPt: number;
}

// Parameters as defined in viewer/src/main/java/nl.b3p.viewer/stripes/DownloadFeaturesActionBean

export interface ExportFeaturesParameters {
  application: number;
  appLayer: number;
  columns: string[];
  type: string; // Export type (SHP, XLS, etc)
  featureType?: number;
  filter?: string;
  debug?: boolean;
  params?: string; // Other parameters (filter etc?)
}

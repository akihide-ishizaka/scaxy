declare module "@mapbox/mapbox-gl-language" {
  import type { IControl, Map as MapboxMap, Style } from "mapbox-gl";

  interface MapboxLanguageOptions {
    defaultLanguage?: string;
    getLanguageField?: (language: string) => string;
    languageSource?: string;
    languageField?: string;
    supportedLanguages?: string[];
  }

  export default class MapboxLanguage implements IControl {
    constructor(options?: MapboxLanguageOptions);
    onAdd(map: MapboxMap): HTMLElement;
    onRemove(map: MapboxMap): void;
    setLanguage(style: Style, language: string): Style;
  }
}

// Kakao Maps API 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
    getCenter(): LatLng;
    getLevel(): number;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
    setPosition(latlng: LatLng): void;
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions);
    open(map: Map, marker?: Marker): void;
    close(): void;
    setContent(content: string): void;
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
    setPosition(latlng: LatLng): void;
  }

  interface MapOptions {
    center: LatLng;
    level: number;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: Map;
    image?: MarkerImage;
    title?: string;
    draggable?: boolean;
    clickable?: boolean;
  }

  interface InfoWindowOptions {
    content?: string;
    removable?: boolean;
    position?: LatLng;
    zIndex?: number;
  }

  interface CustomOverlayOptions {
    content: string | HTMLElement;
    position: LatLng;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
  }

  class MarkerImage {
    constructor(src: string, size: Size, options?: MarkerImageOptions);
  }

  interface MarkerImageOptions {
    offset?: Point;
    shape?: string;
    coords?: string;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  namespace event {
    function addListener(target: any, type: string, handler: Function): void;
    function removeListener(target: any, type: string, handler: Function): void;
  }

  namespace services {
    class Geocoder {
      constructor();
      addressSearch(address: string, callback: (result: any[], status: Status) => void): void;
      coord2Address(lng: number, lat: number, callback: (result: any[], status: Status) => void): void;
    }

    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR'
    }
  }
}

export {};
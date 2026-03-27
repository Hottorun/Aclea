declare module 'html2canvas' {
  interface Html2CanvasOptions {
    background?: string;
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
    windowWidth?: number;
    windowHeight?: number;
  }
  
  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
  export default html2canvas;
}

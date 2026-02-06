// Global type declarations for external modules

declare module 'html2canvas' {
  export default function html2canvas(element: HTMLElement, options?: any): Promise<HTMLCanvasElement>;
}

declare module 'react-rnd' {
  export const Rnd: any;
}

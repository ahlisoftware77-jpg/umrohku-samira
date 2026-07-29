declare module 'ogl' {
  export class Renderer {
    gl: any;
    constructor(options?: any);
    setSize(width: number, height: number): void;
    render(options: any): void;
  }
  export class Camera {
    fov: number;
    position: { z: number };
    aspect: number;
    perspective(options?: any): void;
    constructor(gl: any);
  }
  export class Transform {
    position: { x: number; y: number; z: number };
    rotation: { z: number };
    scale: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    setParent(parent: any): void;
    constructor();
  }
  export class Mesh extends Transform {
    geometry: any;
    program: any;
    constructor(gl: any, options?: any);
  }
  export class Plane {
    constructor(gl: any, options?: any);
  }
  export class Program {
    uniforms: any;
    constructor(gl: any, options?: any);
  }
  export class Texture {
    image: any;
    constructor(gl: any, options?: any);
  }
}

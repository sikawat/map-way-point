declare module '*.svg' {
    import * as React from 'react';
    const ReactComponent: React.FunctionComponent<
      React.SVGProps<SVGSVGElement> & { className?: string }
    >;
    export default ReactComponent;
  }
  
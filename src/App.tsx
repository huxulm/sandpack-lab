// import { Sandpack } from "@codesandbox/sandpack-react";
import {
  useActiveCode,
  SandpackStack,
  FileTabs,
  useSandpack,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import Editor from "@monaco-editor/react";

import { dracula } from "@codesandbox/sandpack-themes";
import files from "./files";

function MonacoEditor() {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();

  return (
    <SandpackStack style={{ height: "100vh", margin: 0, width: "100vw", padding: 0 }}>
      <FileTabs />
      <div style={{ flex: 1, paddingTop: 8, background: "#1e1e1e" }}>
        <Editor
          width="100%"
          height="100%"
          language="javascript"
          theme="vs-dark"
          key={sandpack.activeFile}
          defaultValue={code}
          onChange={(value) => updateCode(value || "")}
        />
      </div>
    </SandpackStack>
  );
}

const App = () => {

  return (
    <SandpackProvider
      className="app"
      files={files}
      theme={dracula}
      template="vite-react-ts"
      customSetup={{
        npmRegistries: [
          {
            enabledScopes: [],
            limitToScopes: false,
            proxyEnabled: false,
            registryUrl: "https://registry.npmjs.org",
          },
        ],
        dependencies: {
          "d3-array": "^3.2.4",
          "d3-axis": "^3.0.0",
          "d3-brush": "^3.0.0",
          "d3-chord": "^3.0.1",
          "d3-color": "^3.1.0",
          "d3-contour": "^4.0.2",
          "d3-delaunay": "^6.0.4",
          "d3-dispatch": "^3.0.1",
          "d3-drag": "^3.0.0",
          "d3-dsv": "^3.0.1",
          "d3-ease": "^3.0.1",
          "d3-fetch": "^3.0.1",
          "d3-force": "^3.0.0",
          "d3-format": "^3.1.0",
          "d3-geo": "^3.1.1",
          "d3-hierarchy": "^3.1.2",
          "d3-interpolate": "^3.0.1",
          "d3-path": "^3.1.0",
          "d3-polygon": "^3.0.1",
          "d3-quadtree": "^3.0.1",
          "d3-random": "^3.0.1",
          "d3-scale": "^4.0.2",
          "d3-scale-chromatic": "^3.1.0",
          "d3-selection": "^3.0.0",
          "d3-shape": "^3.2.0",
          "d3-time": "^3.1.0",
          "d3-time-format": "^4.1.0",
          "d3-timer": "^3.0.1",
          "d3-transition": "^3.0.1",
          "d3-zoom": "^3.0.0",
        },
        devDependencies: {
          "@types/d3": "^7.4.3",
          "@types/react": "^18.3.3",
          "@types/react-dom": "^18.3.0",
        },
      }}
    >
      <SandpackLayout className="custom-layout">
        <MonacoEditor />
        <SandpackPreview showNavigator className="custom-preview" style={{ height: "100vh" }} />
      </SandpackLayout>
    </SandpackProvider>
  );
};

export default App;

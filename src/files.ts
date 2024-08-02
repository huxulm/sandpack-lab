export default {
  "common/utils/responsive/useParentSize.ts": `import { RefObject, useEffect, useRef, useState } from "react";
export type Size = {
  width: number | undefined;
  height: number | undefined;
};

export const useParentSize = <T extends HTMLElement>(): [
  RefObject<T>,
  Size,
] => {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({width: undefined, height: undefined});
  useEffect(() => {
    const target = ref.current;
    if (!target) {
      return;
    }
    if (!ref.current) {
      return;
    }
    const resizer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        setSize({ width, height });
        return;
      }
    });
    resizer.observe(target);
    return () => {
        resizer.unobserve(target);
    };
  }, []);
  return [ref, size];
};`,
  "common/utils/responsive/Responsive.tsx": `import { FC } from "react";
  import { useParentSize, Size } from "./useParentSize";
  
  export type ResponsiveProps = {
    height?: string | number;
    width?: string | number;
    children: (props: Size) => any
  };
  export const Responsive: FC<ResponsiveProps> = ({
    children,
    width = "100%",
    height = "100%",
  }) => {
    const [ref, size] = useParentSize<HTMLDivElement>();
    return (
      <div
        ref={ref}
        style={{
          width,
          height,
        }}
      >
        {size.width && size.width > 0 && children(size)}
      </div>
    );
  };`,
  "App.tsx": `import { FC, useCallback, useEffect, useRef, useState } from "react";
  import { VizWrapper } from "./VizWrapper";
  import { Responsive } from "/common/utils/responsive/Responsive";
  import {
    curveBasis,
    curveBasisClosed,
    curveBundle,
    curveCardinal,
    curveCardinalClosed,
    curveCatmullRomClosed,
    curveLinearClosed,
    curveStep,
    curveStepAfter,
  } from "d3-shape";
  import { randomIrwinHall } from "d3-random"
  import { dataFn, DataShape, Mock } from "./data";
  
  import "./style.css";
  
  const easeFns = [
    curveBasis,
    curveBasisClosed,
    curveBundle,
    curveCardinal,
    curveCardinalClosed,
    curveCatmullRomClosed,
    curveLinearClosed,
    curveStep,
    curveStepAfter,
  ];
  
  interface RadialProps {
    // Total number of dounts
    initDounts?: number;
    // Inner start dount
    initOffsetDount?: number;
    initStart?: boolean;
    initDuration?: number;
    initMockConfig?: MockConfig;
  }
  
  const DefaultDataFetchDuration = 800;
  
  type MockConfig = {
    id: number;
    range: [number, number];
    valueFn?: (val: number) => number;
  };
  
  type RadialStatus = {
    init: boolean;
    start: boolean;
    data: DataShape[][];
    duration: number;
    curve: any;
    mockConfig: MockConfig;
  };
  
  const mockRanges = [["[0, 360]", [0, Math.PI * 2]]].concat(
    Array.from({ length: 8 }, (_, i) => {
      const step = 360 / 8;
      return [
        \`[\${i * step}, \${(i + 1) * step}\${i == 7? ']': ')'}\`,
        [(i * Math.PI) / 4, ((i + 1) * Math.PI) / 4],
      ];
    })
  );
  
  const defaultValueFn = randomIrwinHall(1)
  
  const App: FC<RadialProps> = ({
    initDounts,
    initOffsetDount,
    initMockConfig,
    initDuration,
    initStart,
  }: RadialProps) => {
    const [dounts] = useState<number>(initDounts || 30);
    const [offsetDount] = useState<number>(initOffsetDount || 0);
    const [status, setStatus] = useState<RadialStatus>({
      init: true,
      start: initStart || false,
      duration: initDuration || DefaultDataFetchDuration,
      curve: curveCardinalClosed,
      mockConfig: initMockConfig || {
        id: 0,
        range: mockRanges[0][1] as [number, number],
        valueFn: defaultValueFn
      },
      data: dataFn(
        dounts,
        Array.from({ length: dounts }, (_, i) => 5 * i + 3),
        () => 0.5
      ),
    });
  
    const update = useCallback(() => {
      setStatus((prev) => ({
        ...prev,
        init: false,
        data: Mock(prev.data, prev.mockConfig.range, prev.mockConfig.valueFn),
      }));
    }, [dounts]);
  
    const reset = () => {
      setStatus({
        init: false,
        start: false,
        duration: DefaultDataFetchDuration,
        curve: curveCardinalClosed,
        mockConfig: { id: 0, range: [0, Math.PI * 2], valueFn: defaultValueFn },
        data: dataFn(
          dounts,
          Array.from({ length: dounts }, (_, i) => 5 * i + 3),
          () => 0.5
        ),
      });
    };
  
    const ref = useRef<HTMLDivElement>(null);
    const [it, setIt] = useState(null);
    useEffect(() => {}, [dounts, offsetDount]);
    useEffect(() => {
      if (it) {
        clearInterval(it);
      }
      let t: any = null;
      setTimeout(() => {
        if (status.start) {
          t = setInterval(update, status.duration);
          setIt(it);
        }
      }, 500);
      return () => t && clearInterval(t);
    }, [status.duration, status.start]);
    const eases = [
      "curveBasis",
      "curveBasisClosed",
      "curveBundle",
      "curveCardinal",
      "curveCardinalClosed",
      "curveCatmullRomClosed",
      "curveLinearClosed",
      "curveStep",
      "curveStepAfter",
    ];
  
    const onSelectMock = (id: number) => {
      setStatus((prev) => ({
        ...prev,
        mockConfig: {
          ...prev.mockConfig,
          id: id,
          range: mockRanges[id][1] as [number, number],
        },
      }));
    };
  
    return (
      <div className="app" ref={ref} style={{ width: "100vw", height: "100vh" }}>
        <div
          style={{
            position: "relative",
            top: 50,
            left: 50,
            display: "flex",
            width: "25%",
            maxWidth: 200,
            height: 0,
            gap: 10,
            flexDirection: "column",
          }}
        >
          <button
            onClick={() => {
              if (it) {
                clearInterval(it);
              }
              setStatus((prev) => ({ ...prev, start: !prev.start }));
            }}
          >
            {!status.start ? "启动模拟" : "停止"}
          </button>
          <button onClick={reset}>重置</button>
          <label>
            <label>频率</label>
            <input
              type="range"
              value={status.duration}
              min={0}
              max={2000}
              step={100}
              onChange={(e) =>
                setStatus({ ...status, duration: parseInt(e.target.value) })
              }
            />
            <label>{\`\${status.duration / 1000}s\`}</label>
          </label>
          <label>
            <select
              onChange={(e) => {
                const i = parseInt(e.target.value);
                setStatus({ ...status, curve: easeFns[i] });
              }}
            >
              {eases.map((eas, i) => (
                <option value={i}>{eas}</option>
              ))}
            </select>
          </label>
          <div className="ranges">
            <label>模拟数据范围</label>
            {mockRanges.map((conf, i) => (
              <label>
                <code>{conf[0] as string}</code>
                <input
                  type="radio"
                  checked={status.mockConfig?.id === i}
                  onChange={() => onSelectMock(i)}
                />
              </label>
            ))}
          </div>
          <div>
            <label>选择范围</label>
            <label>
              <input
                type="range"
                min={0}
                max={360}
                value={status.mockConfig.range[0] * 180 / Math.PI}
                onChange={(e) => {
                  setStatus((prev) => ({
                    ...prev,
                    mockConfig: {
                      ...prev.mockConfig,
                      range: [
                        parseFloat(e.target.value) * Math.PI/180,
                        prev.mockConfig.range[1],
                      ],
                    },
                  }));
                }}
              />
              <label>{Math.ceil(status.mockConfig.range[0] * 180 / Math.PI)}°</label>
            </label>
            <label>
              <input
                type="range"
                min={0}
                max={360}
                value={status.mockConfig.range[1] * 180 / Math.PI}
                onChange={(e) => {
                  setStatus((prev) => ({
                    ...prev,
                    mockConfig: {
                      ...prev.mockConfig,
                      range: [
                        prev.mockConfig.range[0],
                        parseFloat(e.target.value) * Math.PI/180,
                      ],
                    },
                  }));
                }}
              />
              <label>{Math.ceil(status.mockConfig.range[1] * 180 / Math.PI)}°</label>
            </label>
          </div>
          <div>
            <p>复杂度估算</p>
            <pre>
              {\`O(30动态线圈+2200动态点+12X坐标线+31Y坐标线)\`}
            </pre>
          </div>
        </div>
        <Responsive>
        {({ width, height }) =>
          width &&
          height && (
            <VizWrapper
              width={width}
              height={height}
              data={status.data}
              init={status.init}
              updateDuration={status.duration}
              curve={status.curve}
            />
          )
        }
      </Responsive>  
      </div>
    );
  };
export default App;`,
  "viz.ts": `import { RefObject } from "react";
import { select, Selection, BaseType } from "d3-selection";
import { scaleLinear, ScaleLinear, scaleSequential } from "d3-scale";
import { interpolateRainbow } from "d3-scale-chromatic";
import { pointRadial, lineRadial, curveLinearClosed } from "d3-shape";
import { zoom } from "d3-zoom";
import { transition } from "d3-transition";
import { easeLinear as easeFn } from "d3-ease";

import { DataShape } from "./data";

type SVGSelection = Selection<SVGGElement, any, null, undefined>;
export type DountsSelection = Selection<
  SVGPathElement,
  DataShape[],
  SVGGElement,
  null
>;
export type PointsSelection = Selection<
  BaseType | SVGGElement,
  DataShape[],
  SVGGElement,
  null
>;
type XYScale = ScaleLinear<number, number, never>;
export const viz = (
  container: RefObject<SVGSVGElement>,
  width: number,
  height: number,
  innerRadius: number,
  outerRadius: number,
  data: DataShape[][],
  getDountScale: (i: number) => ScaleLinear<number, number, never>,
  xTickCount: number
): [DountsSelection, PointsSelection] => {
  //   const width = container.current!.clientWidth;
  //   const height = container.current!.clientHeight;
  //   const innerRadius = height / 12;
  //   const outerRadius = height / 2;

  // clear
  // selectAll("svg > g").remove();

  // color
  const color = scaleSequential(interpolateRainbow);

  const slow = transition().duration(750).ease(easeFn);
  const svg = select<SVGSVGElement, any>(container.current!);
  svg.attr("viewBox", [-width / 2, -height / 2, width, height]);

  const g = svg.append("g");
  const zoomBehavior = zoom().on("zoom", (event) =>
    g.attr("transform", event.transform)
  );
  svg.call(zoomBehavior as any);

  const x = scaleLinear()
    .domain([0, Math.PI * 2])
    .range([0, 360]);

  const y = scaleLinear()
    .range([innerRadius, outerRadius])
    .domain([0, data.length]);

  // render x Axis
  xAxes(g, innerRadius, outerRadius, x, xTickCount);

  //  render y Axis
  yAxes(g, y, data.length + 1);

  const line = lineRadial<DataShape>().curve(curveLinearClosed);

  // render dounts
  let dountsG: DountsSelection;
  let pointsG: PointsSelection;
  g.append("g")
    .data([null])
    .join("g")
    .call((g) => {
      dountsG = g
        .append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", (_, i) => color((i + 1) / data.length))
        .attr("d", (d, i) => {
          return line
            .angle((_, j) => (j * Math.PI * 2) / d.length)
            .radius((v) => getDountScale(i)(v.value))(d);
        })
        .attr("stroke-opacity", 0)
        .call((selection) =>
          selection
            .transition(slow)
            .delay((_, i) => (i * 1000) / Math.max(1, data.length))
            .attr("stroke-opacity", 1)
        );
    })
    .call((g) => {
      pointsG = g
        .selectAll("g")
        .data(data)
        .join("g")
        .call((g) =>
          g
            .selectAll<SVGCircleElement, DataShape[]>("circle")
            .data((d) => d)
            .enter()
            .append("circle")
            .attr("fill", (v) => color((v.dount + 1) / data.length))
            .attr("opacity", 0)
            .attr("stroke", "none")
            .attr(
              "cx",
              (v, j) =>
                pointRadial(
                  (j * Math.PI * 2) / data[v.dount].length,
                  y(v.dount + v.value)
                )[0]
            )
            .attr(
              "cy",
              (v, j) =>
                pointRadial(
                  (j * Math.PI * 2) / data[v.dount].length,
                  y(v.dount + v.value)
                )[1]
            )
            .attr("r", 3)
            .call((selection) =>
              selection
                .transition(slow)
                .delay((d) => (d.dount * 1000) / Math.max(1, data.length))
                .attr("opacity", 1)
            )
        );
    });
  return [dountsG!, pointsG!];
};

export const xAxes = (
  g: SVGSelection,
  innerRadius: number,
  outerRadius: number,
  x: XYScale,
  tickCount: number
) => {
  const step = (Math.PI * 2) / Math.max(4, tickCount);
  const ticks = Array.from({ length: tickCount }, (_, i) => i * step);
  g.append("g")
    .attr("font-size", 10)
    .attr("font-weight", "bold")
    .call((g) =>
      g
        .selectAll("g")
        .data(ticks)
        .join("g")
        .call((g) =>
          g
            .append("path")
            .attr("class", "x-axis")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "4 4")
            .attr(
              "d",
              (d) =>
                \`M\${pointRadial(d, innerRadius)}L\${pointRadial(d, outerRadius + 50)}\`
            )
        )
        .call((g) =>
          g
            .append("path")
            .attr("id", (_, i) => \`p-\${i}\`)
            .datum((d) => [d, d + step])
            .attr("fill", "none")
            .attr(
              "d",
              ([a, b]) => \`
            M\${pointRadial(a, innerRadius - 10)}
            A\${innerRadius - 10},\${innerRadius - 10} 0,0,1 \${pointRadial(b, innerRadius - 10)}
          \`
            )
        )
        .call((g) =>
          g
            .append("text")
            .append("textPath")
            .attr("class", "x-axis")
            .attr("startOffset", 0)
            .attr("stoke-width", 1)
            .attr("xlink:href", (_, i) => \`#p-\${i}\`)
            .text((d, i) => (i % 3 === 0 ? \`\${Math.ceil(x(d))}°\` : ""))
        )
        .call((g) =>
          g
            .append("path")
            .attr("id", (_, i) => \`po-\${i}\`)
            .datum((d) => [d, d + step])
            .attr("fill", "none")
            .attr(
              "d",
              ([a, b]) => \`
            M\${pointRadial(a, outerRadius + 20)}
            A\${outerRadius + 20},\${outerRadius + 20} 0,0,1 \${pointRadial(b, outerRadius + 20)}
          \`
            )
        )
        .call((g) =>
          g
            .append("text")
            .append("textPath")
            .attr("class", "x-axis")
            .attr("startOffset", 6)
            .attr("font-size", 16)
            .attr("stoke-width", 1)
            .attr("xlink:href", (_, i) => \`#po-\${i}\`)
            .text((d) => \`\${Math.ceil(x(d))}°\`)
        )
    );
};

const yAxes = (g: SVGSelection, y: XYScale, tickCount: number) => {
  g.append("g")
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .call((g) =>
      g
        .selectAll("g")
        .data(y.ticks(tickCount).reverse())
        .join("g")
        .attr("fill", "none")
        .call((g) =>
          g
            .append("circle")
            .attr("class", "y-axis")
            .attr("stroke-dasharray", "4")
            .attr("r", y)
        )
    );
};

export function transitionDounts(
  g: DountsSelection,
  data: DataShape[][],
  getDountScale: (i: number) => ScaleLinear<number, number, never>,
  duration: number,
  curve: any
) {
  const fast = transition().duration(duration).ease(easeFn);
  const line = lineRadial<DataShape>().curve(curve);
  g.data(data).call((selection) => {
    selection
      .transition(fast)
      .attr("stroke-opacity", 1)
      .attr("d", (d, i) => {
        return line
          .angle((_, j) => (j * Math.PI * 2) / d.length)
          .radius((v) => getDountScale(i)(v.value))(d);
      });
  });
}
export function transitionPoints(
  g: PointsSelection,
  data: DataShape[][],
  duration: number,
  innerRadius: number,
  outerRadius: number
) {
  const fast = transition().duration(duration).ease(easeFn);
  const y = scaleLinear()
    .range([innerRadius, outerRadius])
    .domain([0, data.length]);
  g.data(data).call((selection) => {
    selection
      .selectAll("circle")
      .data((d) => d)
      .transition(fast)
      .attr(
        "cx",
        (v, j) =>
          pointRadial(
            (j * Math.PI * 2) / data[v.dount].length,
            y(v.dount + v.value)
          )[0]
      )
      .attr(
        "cy",
        (v, j) =>
          pointRadial(
            (j * Math.PI * 2) / data[v.dount].length,
            y(v.dount + v.value)
          )[1]
      );
  });
}
`,
  "VizWrapper.tsx": `import { useCallback, useEffect, useMemo, useRef } from "react";
import { scaleLinear } from "d3-scale";
import {
  DountsSelection,
  PointsSelection,
  transitionDounts,
  transitionPoints,
  viz,
} from "./viz";
import { DataShape } from "./data";
interface VizWrapperProps {
  width: number;
  height: number;
  updateDuration: number;
  data?: DataShape[][];
  init?: boolean;
  curve: any;
}
export const VizWrapper = ({
  width,
  height,
  data = [],
  init = true,
  updateDuration,
  curve,
}: VizWrapperProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const refDountsSelection = useRef<DountsSelection | null>(null);
  const refPointsSelection = useRef<PointsSelection | null>(null);
  const radius = Math.min(width, height) / 2;
  const innerRadius = radius / 16;
  const outerRadius = radius;

  const rScale = useMemo(() => {
    return scaleLinear()
      .domain([0, data.length])
      .range([innerRadius, outerRadius]);
  }, [width, height, data]);

  const getDountScale = useCallback(
    (i: number) => {
      return (
        scaleLinear()
          .range([rScale(i), rScale(i + 1)])
          // .domain(extent(data[i], (d) => d.value) as Iterable<number>);
          .domain([0, 1])
      );
    },
    [rScale]
  );

  useEffect(() => {
    if (!refDountsSelection.current && !refPointsSelection.current) {
      [refDountsSelection.current, refPointsSelection.current] = viz(
        ref,
        width,
        height,
        innerRadius,
        outerRadius,
        data,
        getDountScale,
        12
      );
      console.log(refPointsSelection.current);
    }
  }, [width, height, data]);
  useEffect(() => {
    if (refDountsSelection.current && !init) {
      transitionDounts(
        refDountsSelection.current,
        data,
        getDountScale,
        updateDuration,
        curve
      );
    }
    if (refPointsSelection.current && !init) {
      transitionPoints(
        refPointsSelection.current,
        data,
        updateDuration,
        innerRadius,
        outerRadius
      );
    }
  }, [data, init, updateDuration]);
  return <svg width={width} height={height} ref={ref} />;
};`,
  "data.ts": `export interface DataShape {
  id: number;
  dount: number;
  value: number;
}

export const dataFn = (
  dounts: number,
  counts: number[],
  valueFn?: () => number
): Array<Array<DataShape>> => {
  let id = -1;
  return Array.from<any, Array<DataShape>>({ length: dounts }, (_, i) => {
    return Array.from<any, DataShape>({ length: counts[i] }, () => {
      id++;
      return { id, dount: i, value: !valueFn ? Math.random() : valueFn() };
    });
  });
};

export const Mock = (
  origin: Array<Array<DataShape>>,
  range: [number, number],
  valueFn?: (old: number) => number
) => {
  return [
    ...origin.map((a) => {
      return [
        ...a.map((v, j) => {
          const deg = (j * Math.PI * 2) / a.length;
          if (deg < range[0] || deg > range[1]) {
            return v;
          }
          const newV = valueFn
            ? { ...v, value: valueFn(v.value) }
            : { ...v, value: Math.random() };
            // console.log(newV.value, v.value)
            return newV
        }),
      ];
    }),
  ];
};`,
  "style.css": `
body {
  padding: 0;
  margin: 0;
}
.app {
  height: 100vh;
  padding: 1rem;
  background-color: #f1f5f2;
  font-family: Arial, sans-serif;
}
.ranges {
  display: flex;
  flex-direction: column;
}
svg {
    font-family: "宋体", system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif!important;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
}

.x-axis, .y-axis {
    stroke: #b2b2b2;
    stroke-width: 1;
    stroke-opacity: 0.5;
}
textPath.x-axis {
    fill: #4843a1!important;
    stroke-width: 0!important;
    font-weight: bold;
}
`,
};

import React, { useState, useEffect, useMemo } from 'react';
import { useDemo } from '../../contexts/DemoContext';
import { DISTRICT_DATA, DEPARTMENT_DATA } from '../../data/statistics';
import { Network, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

// Convert data objects to arrays for graph use
const districtArray = Object.entries(DISTRICT_DATA).map(([name, data]) => ({
  name,
  ...data,
}));

const departmentArray = Object.entries(DEPARTMENT_DATA).map(([name, data]) => ({
  name,
  ...data,
}));

interface Node {
  id: string;
  label: string;
  type: 'department' | 'district' | 'grievance' | 'central';
  x: number;
  y: number;
  size: number;
  color: string;
  value: number;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
  color: string;
}

type ViewType = 'departments' | 'districts' | 'full';

const COLORS = {
  department: {
    bg: '#3B82F6',
    border: '#2563EB',
    text: '#DBEAFE',
  },
  district: {
    bg: '#10B981',
    border: '#059669',
    text: '#D1FAE5',
  },
  grievance: {
    bg: '#F59E0B',
    border: '#D97706',
    text: '#FEF3C7',
  },
  central: {
    bg: '#8B5CF6',
    border: '#7C3AED',
    text: '#EDE9FE',
  },
};

export default function KnowledgeGraph() {
  const { grievanceQueue, pipelineResult } = useDemo();
  const [viewType, setViewType] = useState<ViewType>('departments');
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [animationTick, setAnimationTick] = useState(0);

  // Animation for active processing
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTick(t => (t + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Build graph data based on view type
  const { nodes, edges } = useMemo(() => {
    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];
    const centerX = 250;
    const centerY = 200;

    if (viewType === 'departments') {
      // Central PGRS node
      nodeList.push({
        id: 'pgrs',
        label: 'PGRS',
        type: 'central',
        x: centerX,
        y: centerY,
        size: 60,
        color: COLORS.central.bg,
        value: 0,
      });

      // Department nodes in a circle
      const deptData = departmentArray.slice(0, 8);
      deptData.forEach((dept, i) => {
        const angle = (i * 2 * Math.PI) / deptData.length - Math.PI / 2;
        const radius = 140;
        // Use dissatisfaction as size factor (higher dissatisfaction = larger node)
        const sizeFactor = dept.dissatisfaction / 100;
        nodeList.push({
          id: `dept-${i}`,
          label: dept.name.length > 12 ? dept.name.substring(0, 12) + '...' : dept.name,
          type: 'department',
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          size: 30 + sizeFactor * 30,
          color: dept.category === 'critical' ? '#EF4444' :
                 dept.category === 'high' ? '#F59E0B' : COLORS.department.bg,
          value: dept.dissatisfaction,
        });

        edgeList.push({
          source: 'pgrs',
          target: `dept-${i}`,
          weight: dept.dissatisfaction,
          color: `rgba(59, 130, 246, ${0.3 + sizeFactor * 0.5})`,
        });
      });

      // Highlight current grievance if exists
      if (pipelineResult) {
        const deptNode = nodeList.find(n =>
          n.label.toLowerCase().includes(pipelineResult.classification.department.toLowerCase().substring(0, 10))
        );
        if (deptNode) {
          deptNode.color = '#EF4444';
          deptNode.size *= 1.3;
        }
      }
    } else if (viewType === 'districts') {
      // Central AP node
      nodeList.push({
        id: 'ap',
        label: 'AP',
        type: 'central',
        x: centerX,
        y: centerY,
        size: 50,
        color: COLORS.central.bg,
        value: 0,
      });

      // District nodes
      districtArray.forEach((district, i) => {
        const angle = (i * 2 * Math.PI) / districtArray.length - Math.PI / 2;
        const radius = 130;
        nodeList.push({
          id: `dist-${i}`,
          label: district.name.substring(0, 8),
          type: 'district',
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          size: 20 + district.satisfaction * 8,
          color: district.satisfaction < 2 ? '#EF4444' :
                 district.satisfaction < 3 ? '#F59E0B' : '#10B981',
          value: district.satisfaction,
        });

        edgeList.push({
          source: 'ap',
          target: `dist-${i}`,
          weight: district.satisfaction,
          color: `rgba(16, 185, 129, ${0.2 + district.satisfaction / 5})`,
        });
      });
    } else {
      // Full network view
      nodeList.push({
        id: 'pgrs',
        label: 'PGRS',
        type: 'central',
        x: centerX,
        y: centerY,
        size: 45,
        color: COLORS.central.bg,
        value: 0,
      });

      // Department cluster (left)
      const deptData = departmentArray.slice(0, 6);
      deptData.forEach((dept, i) => {
        const angle = (i * Math.PI) / (deptData.length - 1) - Math.PI / 2;
        const radius = 100;
        const sizeFactor = dept.dissatisfaction / 100;
        nodeList.push({
          id: `dept-${i}`,
          label: dept.name.substring(0, 8),
          type: 'department',
          x: centerX - 80 + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          size: 20 + sizeFactor * 20,
          color: dept.category === 'critical' ? '#EF4444' : COLORS.department.bg,
          value: dept.dissatisfaction,
        });

        edgeList.push({
          source: 'pgrs',
          target: `dept-${i}`,
          weight: dept.dissatisfaction,
          color: `rgba(59, 130, 246, 0.4)`,
        });
      });

      // District cluster (right)
      districtArray.slice(0, 6).forEach((district, i) => {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const radius = 100;
        nodeList.push({
          id: `dist-${i}`,
          label: district.name.substring(0, 6),
          type: 'district',
          x: centerX + 80 + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          size: 18 + district.satisfaction * 5,
          color: district.satisfaction < 2 ? '#EF4444' : '#10B981',
          value: district.satisfaction,
        });

        edgeList.push({
          source: 'pgrs',
          target: `dist-${i}`,
          weight: district.satisfaction,
          color: `rgba(16, 185, 129, 0.4)`,
        });
      });

      // Cross connections
      deptData.slice(0, 3).forEach((_, i) => {
        edgeList.push({
          source: `dept-${i}`,
          target: `dist-${i}`,
          weight: 1,
          color: 'rgba(139, 92, 246, 0.2)',
        });
      });
    }

    return { nodes: nodeList, edges: edgeList };
  }, [viewType, pipelineResult]);

  // Pulse effect for active node
  const getPulseOffset = (nodeId: string) => {
    if (hoveredNode === nodeId ||
        (pipelineResult && nodeId.includes('dept') &&
         nodes.find(n => n.id === nodeId)?.color === '#EF4444')) {
      return Math.sin(animationTick * 0.1) * 3;
    }
    return 0;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Knowledge Graph</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['departments', 'districts', 'full'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewType(v)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewType === v
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          {/* Zoom controls */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ZoomOut className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ZoomIn className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="relative h-[350px] bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 500 400`}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          {/* Gradient definitions */}
          <defs>
            <radialGradient id="centralGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background glow for central node */}
          <circle
            cx={250}
            cy={200}
            r={80}
            fill="url(#centralGlow)"
          />

          {/* Edges */}
          {edges.map((edge, i) => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (!source || !target) return null;

            const isActive = hoveredNode === edge.source || hoveredNode === edge.target;

            return (
              <line
                key={i}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isActive ? '#8B5CF6' : edge.color}
                strokeWidth={isActive ? 3 : 1.5 + edge.weight / 50}
                strokeOpacity={isActive ? 1 : 0.6}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const pulse = getPulseOffset(node.id);
            const isHovered = hoveredNode === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                {/* Outer glow for hovered/active */}
                {(isHovered || pulse > 0) && (
                  <circle
                    r={node.size + 8 + pulse}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={2}
                    strokeOpacity={0.4}
                    className="animate-pulse"
                  />
                )}

                {/* Main circle */}
                <circle
                  r={node.size + pulse}
                  fill={node.color}
                  stroke={isHovered ? '#fff' : 'rgba(255,255,255,0.3)'}
                  strokeWidth={isHovered ? 3 : 1}
                  filter={isHovered ? 'url(#glow)' : undefined}
                  className="transition-all duration-200"
                />

                {/* Label */}
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fill="#fff"
                  fontSize={node.type === 'central' ? 12 : 9}
                  fontWeight={node.type === 'central' ? 'bold' : 'medium'}
                  className="pointer-events-none select-none"
                >
                  {node.label}
                </text>

                {/* Value badge (on hover) */}
                {isHovered && node.type !== 'central' && (
                  <g transform={`translate(${node.size - 5}, ${-node.size + 5})`}>
                    <rect
                      x={-18}
                      y={-10}
                      width={36}
                      height={16}
                      rx={4}
                      fill="#1F2937"
                    />
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fill="#fff"
                      fontSize={8}
                    >
                      {node.type === 'department' ? `${node.value.toFixed(0)}% dis` :
                       node.type === 'district' ? `${node.value.toFixed(1)}/5` :
                       String(node.value)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 rounded-lg p-2 text-xs">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.department.bg }} />
              <span className="text-gray-700 dark:text-gray-300">Departments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.district.bg }} />
              <span className="text-gray-700 dark:text-gray-300">Districts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-700 dark:text-gray-300">Active/Low Score</span>
            </div>
          </div>
        </div>

        {/* Active case indicator */}
        {pipelineResult && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Processing: {pipelineResult.classification.department}
          </div>
        )}
      </div>

      {/* Stats footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{nodes.length - 1}</p>
          <p className="text-xs text-gray-500">Nodes</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{edges.length}</p>
          <p className="text-xs text-gray-500">Connections</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{grievanceQueue.length}</p>
          <p className="text-xs text-gray-500">Cases</p>
        </div>
      </div>
    </div>
  );
}

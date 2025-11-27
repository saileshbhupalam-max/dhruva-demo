import React, { useState } from 'react';
import { useDemo } from '../../contexts/DemoContext';

interface BlockProps {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  type: 'input' | 'process' | 'model' | 'output' | 'database' | 'decision';
  active?: boolean;
  highlight?: boolean;
}

interface ArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  animated?: boolean;
  label?: string;
  curved?: boolean;
}

const BLOCK_COLORS = {
  input: { fill: '#DBEAFE', stroke: '#3B82F6', text: '#1E40AF' },
  process: { fill: '#F3E8FF', stroke: '#8B5CF6', text: '#5B21B6' },
  model: { fill: '#DCFCE7', stroke: '#22C55E', text: '#166534' },
  output: { fill: '#FEF3C7', stroke: '#F59E0B', text: '#92400E' },
  database: { fill: '#E0E7FF', stroke: '#6366F1', text: '#3730A3' },
  decision: { fill: '#FFE4E6', stroke: '#F43F5E', text: '#9F1239' },
};

function Block({ id, label, sublabel, x, y, width = 100, height = 50, type, active, highlight }: BlockProps) {
  const colors = BLOCK_COLORS[type];
  const isActive = active || highlight;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Glow effect for active */}
      {isActive && (
        <rect
          x={-4}
          y={-4}
          width={width + 8}
          height={height + 8}
          rx={10}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={2}
          opacity={0.5}
          className="animate-pulse"
        />
      )}

      {/* Main block */}
      <rect
        width={width}
        height={height}
        rx={6}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={isActive ? 2.5 : 1.5}
      />

      {/* Database icon for database type */}
      {type === 'database' && (
        <g transform={`translate(${width/2 - 8}, 6)`}>
          <ellipse cx={8} cy={3} rx={8} ry={3} fill="none" stroke={colors.stroke} strokeWidth={1} />
          <path d={`M0,3 v10 a8,3 0 0,0 16,0 v-10`} fill="none" stroke={colors.stroke} strokeWidth={1} />
          <ellipse cx={8} cy={13} rx={8} ry={3} fill="none" stroke={colors.stroke} strokeWidth={1} />
        </g>
      )}

      {/* Label */}
      <text
        x={width / 2}
        y={type === 'database' ? height - 8 : height / 2 - (sublabel ? 5 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={colors.text}
        fontSize={10}
        fontWeight="600"
      >
        {label}
      </text>

      {/* Sublabel */}
      {sublabel && (
        <text
          x={width / 2}
          y={height / 2 + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={colors.text}
          fontSize={8}
          opacity={0.8}
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

function AnimatedArrow({ from, to, animated, label, curved }: ArrowProps) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // Calculate path
  let path: string;
  if (curved) {
    const controlX = midX;
    const controlY = from.y;
    path = `M${from.x},${from.y} Q${controlX},${controlY} ${to.x},${to.y}`;
  } else {
    path = `M${from.x},${from.y} L${to.x},${to.y}`;
  }

  // Unique ID for this arrow's animation
  const arrowId = `arrow-${from.x}-${from.y}-${to.x}-${to.y}`.replace(/\./g, '-');

  return (
    <g>
      {/* Arrow line - dashed when animated */}
      <path
        d={path}
        fill="none"
        stroke={animated ? '#3B82F6' : '#94A3B8'}
        strokeWidth={animated ? 2 : 1.5}
        strokeDasharray={animated ? '6 4' : 'none'}
        strokeLinecap="round"
        markerEnd={animated ? 'url(#arrowhead-animated)' : 'url(#arrowhead)'}
      >
        {animated && (
          <animate
            attributeName="stroke-dashoffset"
            values="0;-20"
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Animated dot traveling along path */}
      {animated && (
        <circle r={4} fill="#3B82F6" opacity={0.8}>
          <animateMotion
            dur="1.5s"
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      )}

      {/* Label */}
      {label && (
        <text
          x={midX}
          y={midY - 5}
          textAnchor="middle"
          fill="#64748B"
          fontSize={8}
        >
          {label}
        </text>
      )}
    </g>
  );
}

export default function SystemArchitecture() {
  const { pipelineSteps, isProcessing, pipelineResult } = useDemo();
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  // Determine which step is active
  const activeStep = pipelineSteps.findIndex(s => s.status === 'processing');
  const completedSteps = pipelineSteps.filter(s => s.status === 'completed').length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">DHRUVA System Architecture</h3>
          <p className="text-xs text-gray-500">AI-Powered Grievance Pipeline</p>
        </div>
        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Processing Step {activeStep + 1}/9
          </div>
        )}
      </div>

      {/* Diagram */}
      <div className="flex-1 p-2 overflow-auto bg-gray-50 dark:bg-gray-900/50">
        <svg
          viewBox="0 0 700 420"
          className="w-full h-full"
          style={{ minHeight: '380px' }}
        >
          {/* Definitions */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth={10}
              markerHeight={7}
              refX={9}
              refY={3.5}
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#94A3B8" />
            </marker>

            <marker
              id="arrowhead-animated"
              markerWidth={10}
              markerHeight={7}
              refX={9}
              refY={3.5}
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
            </marker>

            {/* Gradient for sections */}
            <linearGradient id="sectionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#F1F5F9" stopOpacity={0.4} />
            </linearGradient>
          </defs>

          {/* Section backgrounds */}
          <rect x={5} y={5} width={200} height={100} rx={8} fill="url(#sectionGrad)" stroke="#E2E8F0" />
          <text x={15} y={22} fontSize={10} fill="#64748B" fontWeight="600">INPUT LAYER</text>

          <rect x={5} y={115} width={690} height={180} rx={8} fill="url(#sectionGrad)" stroke="#E2E8F0" />
          <text x={15} y={132} fontSize={10} fill="#64748B" fontWeight="600">ML PROCESSING PIPELINE</text>

          <rect x={5} y={305} width={690} height={110} rx={8} fill="url(#sectionGrad)" stroke="#E2E8F0" />
          <text x={15} y={322} fontSize={10} fill="#64748B" fontWeight="600">OUTPUT & ROUTING</text>

          {/* === INPUT LAYER === */}
          <Block
            id="citizen"
            label="Citizen"
            sublabel="WhatsApp/Web/IVR"
            x={20} y={35}
            width={80} height={55}
            type="input"
            active={!pipelineResult && !isProcessing}
          />

          <Block
            id="grievance"
            label="Grievance"
            sublabel="Telugu/English"
            x={120} y={35}
            width={75} height={55}
            type="input"
            active={isProcessing && activeStep === 0}
          />

          {/* Arrow: Citizen -> Grievance */}
          <AnimatedArrow
            from={{ x: 100, y: 62 }}
            to={{ x: 118, y: 62 }}
            animated={!pipelineResult && !isProcessing}
          />

          {/* === ML PIPELINE ROW 1 === */}
          <Block
            id="duplicate"
            label="Duplicate"
            sublabel="Detection"
            x={20} y={145}
            width={75} height={50}
            type="process"
            active={activeStep === 0}
            highlight={completedSteps > 0}
          />

          <Block
            id="classify"
            label="Classification"
            sublabel="~70% accuracy"
            x={110} y={145}
            width={85} height={50}
            type="model"
            active={activeStep === 1}
            highlight={completedSteps > 1}
          />

          <Block
            id="sentiment"
            label="Distress"
            sublabel="Detection"
            x={210} y={145}
            width={75} height={50}
            type="model"
            active={activeStep === 2}
            highlight={completedSteps > 2}
          />

          <Block
            id="sla"
            label="SLA"
            sublabel="24-336 hrs"
            x={300} y={145}
            width={65} height={50}
            type="process"
            active={activeStep === 3}
            highlight={completedSteps > 3}
          />

          <Block
            id="lapse"
            label="Lapse Risk"
            sublabel="~65% accuracy"
            x={380} y={145}
            width={80} height={50}
            type="model"
            active={activeStep === 4}
            highlight={completedSteps > 4}
          />

          {/* Arrows Row 1 */}
          <AnimatedArrow from={{ x: 157, y: 92 }} to={{ x: 57, y: 143 }} animated={isProcessing && activeStep <= 0} />
          <AnimatedArrow from={{ x: 95, y: 170 }} to={{ x: 108, y: 170 }} animated={isProcessing && activeStep <= 1} />
          <AnimatedArrow from={{ x: 195, y: 170 }} to={{ x: 208, y: 170 }} animated={isProcessing && activeStep <= 2} />
          <AnimatedArrow from={{ x: 285, y: 170 }} to={{ x: 298, y: 170 }} animated={isProcessing && activeStep <= 3} />
          <AnimatedArrow from={{ x: 365, y: 170 }} to={{ x: 378, y: 170 }} animated={isProcessing && activeStep <= 4} />

          {/* === ML PIPELINE ROW 2 === */}
          <Block
            id="similar"
            label="Similar Cases"
            sublabel="Vector Search"
            x={475} y={145}
            width={85} height={50}
            type="database"
            active={activeStep === 5}
            highlight={completedSteps > 5}
          />

          <Block
            id="alerts"
            label="Proactive"
            sublabel="Alerts"
            x={575} y={145}
            width={70} height={50}
            type="process"
            active={activeStep === 6}
            highlight={completedSteps > 6}
          />

          <AnimatedArrow from={{ x: 460, y: 170 }} to={{ x: 473, y: 170 }} animated={isProcessing && activeStep <= 5} />
          <AnimatedArrow from={{ x: 560, y: 170 }} to={{ x: 573, y: 170 }} animated={isProcessing && activeStep <= 6} />

          {/* === DECISION BLOCK === */}
          <Block
            id="confidence"
            label="Confidence"
            sublabel=">75%?"
            x={250} y={220}
            width={80} height={45}
            type="decision"
            active={completedSteps >= 2}
          />

          {/* Arrow from classification to confidence check */}
          <AnimatedArrow
            from={{ x: 152, y: 195 }}
            to={{ x: 250, y: 242 }}
            animated={isProcessing && activeStep >= 1}
            curved
          />

          {/* === TEMPLATE & ACTIONS === */}
          <Block
            id="template"
            label="Response"
            sublabel="Template"
            x={400} y={220}
            width={75} height={45}
            type="process"
            active={activeStep === 7}
            highlight={completedSteps > 7}
          />

          <Block
            id="actions"
            label="Recommended"
            sublabel="Actions"
            x={490} y={220}
            width={85} height={45}
            type="output"
            active={activeStep === 8}
            highlight={completedSteps > 8}
          />

          <AnimatedArrow from={{ x: 330, y: 242 }} to={{ x: 398, y: 242 }} animated={isProcessing && activeStep <= 7} label="Yes" />
          <AnimatedArrow from={{ x: 475, y: 242 }} to={{ x: 488, y: 242 }} animated={isProcessing && activeStep <= 8} />

          {/* === OUTPUT LAYER === */}
          <Block
            id="officer"
            label="Officer Queue"
            sublabel="Smart Priority"
            x={20} y={335}
            width={90} height={55}
            type="output"
            active={pipelineResult !== null}
          />

          <Block
            id="citizen_resp"
            label="Citizen"
            sublabel="SMS/WhatsApp"
            x={130} y={335}
            width={80} height={55}
            type="output"
            active={pipelineResult !== null}
          />

          <Block
            id="dashboard"
            label="Analytics"
            sublabel="Dashboard"
            x={230} y={335}
            width={85} height={55}
            type="output"
            active={pipelineResult !== null}
          />

          <Block
            id="audit"
            label="Audit Trail"
            sublabel="Blockchain"
            x={335} y={335}
            width={80} height={55}
            type="database"
            active={pipelineResult !== null}
          />

          {/* Clarification path */}
          <Block
            id="clarify"
            label="Clarification"
            sublabel="Smart Q&A"
            x={435} y={335}
            width={85} height={55}
            type="process"
          />

          {/* Arrows to output */}
          <AnimatedArrow from={{ x: 290, y: 265 }} to={{ x: 65, y: 333 }} animated={pipelineResult !== null} curved />
          <AnimatedArrow from={{ x: 290, y: 265 }} to={{ x: 170, y: 333 }} animated={pipelineResult !== null} curved />
          <AnimatedArrow from={{ x: 532, y: 265 }} to={{ x: 272, y: 333 }} animated={pipelineResult !== null} curved />
          <AnimatedArrow from={{ x: 532, y: 265 }} to={{ x: 375, y: 333 }} animated={pipelineResult !== null} curved />

          {/* Clarification loop - always animated to show feedback path */}
          <AnimatedArrow from={{ x: 290, y: 220 }} to={{ x: 433, y: 362 }} curved label="<75%" animated />
          <AnimatedArrow from={{ x: 520, y: 362 }} to={{ x: 610, y: 200 }} curved animated />

          {/* Legend */}
          <g transform="translate(580, 320)">
            <text x={0} y={0} fontSize={9} fill="#64748B" fontWeight="600">Legend:</text>
            <rect x={0} y={8} width={16} height={10} rx={2} fill={BLOCK_COLORS.input.fill} stroke={BLOCK_COLORS.input.stroke} />
            <text x={20} y={16} fontSize={8} fill="#64748B">Input</text>
            <rect x={0} y={22} width={16} height={10} rx={2} fill={BLOCK_COLORS.model.fill} stroke={BLOCK_COLORS.model.stroke} />
            <text x={20} y={30} fontSize={8} fill="#64748B">ML Model</text>
            <rect x={0} y={36} width={16} height={10} rx={2} fill={BLOCK_COLORS.process.fill} stroke={BLOCK_COLORS.process.stroke} />
            <text x={20} y={44} fontSize={8} fill="#64748B">Process</text>
            <rect x={0} y={50} width={16} height={10} rx={2} fill={BLOCK_COLORS.decision.fill} stroke={BLOCK_COLORS.decision.stroke} />
            <text x={20} y={58} fontSize={8} fill="#64748B">Decision</text>
            <rect x={0} y={64} width={16} height={10} rx={2} fill={BLOCK_COLORS.output.fill} stroke={BLOCK_COLORS.output.stroke} />
            <text x={20} y={72} fontSize={8} fill="#64748B">Output</text>
          </g>
        </svg>
      </div>

      {/* Status bar */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-gray-500">Steps: {completedSteps}/9</span>
            {pipelineResult && (
              <>
                <span className="text-green-600">Dept: {pipelineResult.classification.department}</span>
                <span className={`${
                  pipelineResult.sentiment.distressLevel === 'CRITICAL' ? 'text-red-600' :
                  pipelineResult.sentiment.distressLevel === 'HIGH' ? 'text-orange-600' :
                  'text-yellow-600'
                }`}>
                  Distress: {pipelineResult.sentiment.distressLevel}
                </span>
              </>
            )}
          </div>
          <span className="text-gray-400">Real-time visualization</span>
        </div>
      </div>
    </div>
  );
}

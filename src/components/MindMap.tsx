import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PillarContent } from '../types';

// Helper functions for color manipulation
function darkenColor(hex: string, amount: number): string {
  let c = d3.color(hex);
  if (!c) return hex;
  return c.darker(amount * 2).formatHex(); // d3 darker scale is different, *2 approximates standard darken
}

function lightenColor(hex: string, amount: number): string {
  let c = d3.color(hex);
  if (!c) return hex;
  return c.brighter(amount * 2).formatHex();
}

interface MindMapProps {
  pillars: PillarContent[];
  activePillar: PillarContent | null;
  onNodeClick: (pillar: PillarContent) => void;
}

export default function MindMap({ pillars, activePillar, onNodeClick }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rootNode, setRootNode] = useState<any>(null);

  // Initialize tree data
  useEffect(() => {
    const categoriesList = [
      { id: 'fundamentals', name: 'Fundamentos Swift', filter: (p: PillarContent) => p.category === 'Fundamentos' || (!p.category && !p.isAdvanced), color: '#3b82f6', isAdv: false },
      { id: 'advanced', name: 'Swift Avançado', filter: (p: PillarContent) => p.category === 'Swift Avançado' || (!p.category && p.isAdvanced), color: '#8b5cf6', isAdv: true },
      { id: 'ios', name: 'iOS & iPadOS', filter: (p: PillarContent) => p.category === 'iOS e iPadOS', color: '#ec4899', isAdv: true },
      { id: 'watchos', name: 'watchOS', filter: (p: PillarContent) => p.category === 'watchOS', color: '#f59e0b', isAdv: true },
      { id: 'macos', name: 'macOS', filter: (p: PillarContent) => p.category === 'macOS', color: '#10b981', isAdv: true },
      { id: 'visionos', name: 'visionOS', filter: (p: PillarContent) => p.category === 'visionOS', color: '#0ea5e9', isAdv: true }
    ];

    const data = {
      id: 'root',
      name: 'Certificação Swift',
      children: categoriesList.map(cat => {
        const filteredPillars = pillars.filter(cat.filter);
        if (filteredPillars.length === 0) return null;
        
        return {
          id: cat.id,
          name: cat.name,
          color: cat.color,
          isAdvancedGroup: cat.isAdv,
          children: filteredPillars.map(p => ({
            id: `pillar-${p.id}`,
            name: p.title,
            pillar: p,
            isAdvanced: p.isAdvanced || cat.isAdv,
            categoryColor: cat.color,
            children: [
              { id: `theory-${p.id}`, name: '📖 Teoria', pillar: p },
              { id: `cases-${p.id}`, name: '💼 Casos de Uso', pillar: p },
              { id: `exercises-${p.id}`, name: '✍️ Exercícios', pillar: p },
              { id: `quiz-${p.id}`, name: '🎯 Quiz', pillar: p }
            ]
          }))
        };
      }).filter(Boolean)
    };

    const root: any = d3.hierarchy(data);
    root.x0 = 0;
    root.y0 = 0;

    // Collapse all children initially
    if (root.children) {
      root.children.forEach(collapse);
    }

    function collapse(d: any) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    setRootNode(root);
  }, [pillars]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !rootNode) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Add Zoom and Pan
    const zoom = d3.zoom()
      .scaleExtent([0.3, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);
    
    // Center the root node vertically and add left margin
    svg.call(zoom.transform as any, d3.zoomIdentity.translate(margin.left, height / 2));

    const tree = d3.tree().nodeSize([60, 280]); // [vertical spacing, horizontal spacing]

    let i = 0;

    function update(source: any) {
      const treeData = tree(rootNode);
      const nodes = treeData.descendants();
      const links = treeData.descendants().slice(1);

      // Nodes
      const node = g.selectAll('g.node')
        .data(nodes, (d: any) => d.id || (d.id = ++i));

      const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${source.y0},${source.x0})`)
        .on('click', click);

      // Node Rectangles
      nodeEnter.append('rect')
        .attr('width', 240)
        .attr('height', 44)
        .attr('x', -10) // slight offset so the link connects nicely
        .attr('y', -22)
        .attr('rx', 8)
        .attr('ry', 8)
        .style('fill', (d: any) => {
          if (d.data.id === 'root') return "#2563eb";
          if (d.data.color) return d.data.color; // Category node
          
          if (d.data.isAdvancedGroup || d.data.isAdvanced || d.data.pillar?.isAdvanced) {
            if (d._children) return d.data.categoryColor ? darkenColor(d.data.categoryColor, 0.4) : "#4c1d95";
            return d.data.categoryColor ? darkenColor(d.data.categoryColor, 0.6) : "#2e1065";
          }
          if (d._children) return "#1e293b";
          return "#0f172a";
        })
        .style('stroke', (d: any) => {
          if (d.data.id === 'root') return "#60a5fa";
          if (d.data.color) return lightenColor(d.data.color, 0.2);
          if (d.data.categoryColor) return lightenColor(d.data.categoryColor, 0.2);
          if (d.data.id === 'advanced' || d.data.isAdvanced || d.data.pillar?.isAdvanced) return "#a78bfa";
          return "#3b82f6";
        })
        .style('stroke-width', 2)
        .style('cursor', 'pointer')
        .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))');

      // Node Text
      nodeEnter.append('text')
        .attr('dy', '0.35em')
        .attr('x', 110)
        .attr('text-anchor', 'middle')
        .text((d: any) => d.data.name)
        .style('fill', '#f8fafc')
        .style('font-size', '13px')
        .style('font-weight', (d: any) => d.data.id === 'root' ? 'bold' : '500')
        .style('pointer-events', 'none')
        .style('font-family', 'Inter, sans-serif');

      const nodeUpdate = nodeEnter.merge(node as any);

      nodeUpdate.transition()
        .duration(300)
        .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

      nodeUpdate.select('rect')
        .style('fill', (d: any) => {
          if (d.data.id === 'root') return "#2563eb";
          if (d.data.color) return d.data.color;
          if (activePillar && d.data.pillar?.id === activePillar.id) return "#059669";
          
          if (d.data.isAdvancedGroup || d.data.isAdvanced || d.data.pillar?.isAdvanced) {
            if (d._children) return d.data.categoryColor ? darkenColor(d.data.categoryColor, 0.4) : "#6d28d9";
            return d.data.categoryColor ? darkenColor(d.data.categoryColor, 0.6) : "#4c1d95";
          }
          if (d._children) return "#3b82f6";
          return "#1e293b";
        })
        .style('stroke', (d: any) => {
          if (activePillar && d.data.pillar?.id === activePillar.id) return "#34d399";
          if (d.data.id === 'root') return "#60a5fa";
          if (d.data.color) return lightenColor(d.data.color, 0.2);
          if (d.data.categoryColor) return lightenColor(d.data.categoryColor, 0.2);
          if (d.data.id === 'advanced' || d.data.isAdvanced || d.data.pillar?.isAdvanced) return "#a78bfa";
          return "#3b82f6";
        });

      const nodeExit = node.exit().transition()
        .duration(300)
        .attr('transform', (d: any) => `translate(${source.y},${source.x})`)
        .remove();

      nodeExit.select('rect')
        .attr('width', 0)
        .attr('height', 0);

      nodeExit.select('text')
        .style('fill-opacity', 0);

      // Links
      const link = g.selectAll('path.link')
        .data(links, (d: any) => d.id);

      const linkEnter = link.enter().insert('path', "g")
        .attr('class', 'link')
        .style('fill', 'none')
        .style('stroke', '#475569') // Slate 600
        .style('stroke-width', 2)
        .attr('d', (d: any) => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        });

      const linkUpdate = linkEnter.merge(link as any);

      linkUpdate.transition()
        .duration(300)
        .attr('d', (d: any) => diagonal(d.parent, d));

      link.exit().transition()
        .duration(300)
        .attr('d', (d: any) => {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      nodes.forEach((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    function diagonal(s: any, d: any) {
      // Adjust start and end points to connect to the edges of the rectangles
      const sourceX = s.y + 230; // Right edge of parent rect
      const sourceY = s.x;
      const targetX = d.y - 10; // Left edge of child rect
      const targetY = d.x;

      return `M ${sourceX} ${sourceY}
              C ${(sourceX + targetX) / 2} ${sourceY},
                ${(sourceX + targetX) / 2} ${targetY},
                ${targetX} ${targetY}`;
    }

    function click(event: any, d: any) {
      if (d.children) {
        // Collapse
        d._children = d.children;
        d.children = null;
      } else if (d._children) {
        // Expand
        d.children = d._children;
        d._children = null;
      } else {
        // Leaf node clicked
        if (d.data.pillar) {
          onNodeClick(d.data.pillar);
        }
      }
      update(d);
    }

    // Initial update
    if (rootNode.x0 === 0 && rootNode.y0 === 0) {
      rootNode.x0 = 0;
      rootNode.y0 = 0;
    }
    update(rootNode);

    const resizeObserver = new ResizeObserver(() => {
      const newWidth = containerRef.current?.clientWidth || width;
      const newHeight = containerRef.current?.clientHeight || height;
      svg.attr("width", newWidth).attr("height", newHeight);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };

  }, [rootNode, activePillar, onNodeClick]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-950 rounded-3xl overflow-hidden shadow-inner border border-slate-800 relative">
      <div className="absolute top-4 left-4 text-slate-400 text-sm font-medium pointer-events-none bg-slate-900/80 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-slate-800">
        🖱️ Clique nos nós para expandir • Role para dar zoom • Arraste para mover
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}

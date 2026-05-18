import React, { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
// @ts-ignore
import coseBilkent from 'cytoscape-cose-bilkent';
import { NetworkFilters } from './NetworkFilters';
import { Core, NodeSingular, EdgeSingular } from 'cytoscape';
import networkGraphService from '../../services/networkGraphService';
import EdgeInvestigationModal from './EdgeInvestigationModal';
import NetworkStatistics from './NetworkStatistics';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import NodeInvestigationModal from './NodeInvestigationModal';
import { generateDistinctColors } from '../../shared/colorUtils';

// Register the layout extension
cytoscape.use(coseBilkent);

interface GraphNode {
  id: string;
  label: string;
  size: number;
  color: string;
  [key: string]: any;
}

// Update the GraphEdge interface to include destinationScope
interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight: number;
  color: string;
  destinationScope: string; // Add this field
  [key: string]: any;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  statistics: Array<{
    name: string;
    count: number;
  }>;
}

interface Filters {
  startTime?: string;
  endTime?: string;
  minConnections?: number;
  connectionType?: string;
  process?: string | null;
  protocol?: string | null;
  maxNodes?: number;
  maxEdges?: number;
  host?: string;
  ipOrigin?: string;
}

interface SelectedEdge {
  sourceIp: string;
  targetIp: string;
  [key: string]: any;
}

interface SelectedNode {
  id: string;
  label: string;
  [key: string]: any;
}

const colorCache = new Map<string, string>();

export const NetworkGraph: React.FC = () => {
  const cyRef = useRef<HTMLDivElement>(null);
  const cyInstance = useRef<Core | null>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ 
    nodes: [], 
    edges: [], 
    statistics: [] 
  });
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<SelectedEdge | null>(null);
  const [showNodeModal, setShowNodeModal] = useState<boolean>(false);
  const [showEdgeModal, setShowEdgeModal] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, -1),
    endTime: new Date().toISOString().slice(0, -1),
    connectionType: 'all',
    process: '',
    protocol: '',
    minConnections: 1,
    host: '',
    ipOrigin: ''
  });
  const [connectionTypes, setConnectionTypes] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIPv6, setShowIPv6] = useState<boolean>(true);

  // Initialize Cytoscape instance
  useEffect(() => {
    if (!cyRef.current || cyInstance.current) return;

    cyInstance.current = cytoscape({
      container: cyRef.current,
      style: [
        // Node styles
        {
          selector: 'node',
          style: {
            'width': 'data(size)',
            'height': 'data(size)',
            'background-color': (ele) => getLegendColor(ele.data('type')), // Update this line
            'border-width': 2,
            'border-color': '#ffffff',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '10px',
            'font-weight': 'bold',
            'color': '#ffffff',
            'text-outline-width': 1,
            'text-outline-color': '#000000',
            'text-max-width': '60px',
            'text-wrap': 'ellipsis'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#fbbf24'
          }
        },
        {
          selector: 'node:hover',
          style: {
            'border-width': 3,
            'border-color': '#4f46e5'
          }
        },
        // Edge styles
        {
          selector: 'edge',
          style: {
            'width': 'data(weight)',
            'line-color': (ele) => getLegendColor(ele.data('destinationScope')), // Use destinationScope
            'target-arrow-color': (ele) => getLegendColor(ele.data('destinationScope')), // Match arrow color
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.2,
            'label': 'data(label)',
            'font-size': '8px',
            'text-rotation': 'autorotate',
            'text-margin-y': -10
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 4,
            'line-color': '#fbbf24',
            'target-arrow-color': '#fbbf24',
            'z-index': 999 // Bring selected edges to front
          }
        },
        {
          selector: 'edge:hover',
          style: {
            'width': 3,
            'line-color': '#4338ca',
            'target-arrow-color': '#4338ca',
            'z-index': 998 // Bring hovered edges above normal but below selected
          }
        }
      ],
      layout: {
        name: 'cose-bilkent',
        idealEdgeLength: 150,
        nodeOverlap: 40,
        refresh: 50,
        fit: true,
        padding: 50,
        randomize: true, // Changed from true to break linear patterns
        componentSpacing: 200,
        nodeRepulsion: 8000000, // Increased significantly
        edgeElasticity: 32,
        nestingFactor: 1.2,
        gravity: 1,
        numIter: 2000,
        initialTemp: 1000,
        coolingFactor: 0.99,
        minTemp: 1.0
      } as any
    });

    // Event handlers
    cyInstance.current.on('tap', 'node', (evt) => {
      const node: NodeSingular = evt.target;
      setSelectedNode(node.data());
      setShowNodeModal(true);
    });

    cyInstance.current.on('tap', 'edge', (evt) => {
      const edge: EdgeSingular = evt.target;
      setSelectedEdge({
        sourceIp: edge.data('source'),
        targetIp: edge.data('target'),
        ...edge.data()
      });
      setShowEdgeModal(true);
    });

    cyInstance.current.on('dbltap', 'node', (evt) => {
      const node: NodeSingular = evt.target;
      if (cyInstance.current) {
        cyInstance.current.animate({
          fit: {
            eles: node.neighborhood(),
            padding: 50
          }
        }, {
          duration: 1000
        });
      }
    });

    return () => {
      if (cyInstance.current) {
        cyInstance.current.destroy();
        cyInstance.current = null;
      }
    };
  }, []);

  // Load graph data
  const loadGraphData = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await networkGraphService.getNetworkGraph(filters);  // Filters now include sourceIp and targetIp
      setGraphData(data);
      updateGraph(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add this function before updateGraph
const preprocessGraphData = (data: GraphData): GraphData => {
  // Remove self-loops and duplicate edges
  const uniqueEdges = data.edges.filter((edge, index, arr) => {
    if (edge.source === edge.target) return false;
    
    return !arr.slice(0, index).some(e => 
      (e.source === edge.source && e.target === edge.target) ||
      (e.source === edge.target && e.target === edge.source)
    );
  });

  return { ...data, edges: uniqueEdges };
};

// Update the updateGraph function:
const updateGraph = (data: GraphData): void => {
  if (!cyInstance.current) return;

  const processedData = preprocessGraphData(data);
  // Helper to detect IPv6 addresses (simple check: presence of ':')
  const isIPv6 = (id: string) => typeof id === 'string' && id.includes(':');

  // When hiding IPv6, filter out nodes with ':' in their id and edges referencing them
  const filteredNodes = processedData.nodes.filter(n => showIPv6 || !isIPv6(n.id));
  const filteredEdges = processedData.edges.filter(e => {
    if (showIPv6) return true;
    return !isIPv6(e.source) && !isIPv6(e.target);
  });

  const elements = [
    ...filteredNodes.map(node => ({
      data: {
        id: node.id,
        label: node.label,
        size: node.size,
        type: node.type, // Make sure this property exists
        color: getLegendColor(node.type) // Set color based on type
      }
    })),
    ...filteredEdges.map(edge => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        weight: edge.weight,
        destinationScope: edge.destinationScope, // Use destinationScope for color
        color: getLegendColor(edge.destinationScope)
      }
    }))
  ];

  cyInstance.current.elements().remove();
  cyInstance.current.add(elements);
  
  // Apply layout with randomization
  cyInstance.current.layout({
    name: 'cose-bilkent',
    randomize: true, // Always randomize for better distribution
    fit: true
  } as any).run();
};

  // Handle filter changes
  const handleFilterChange = (newFilters: Filters): void => {
    setFilters(newFilters);
  };

  // Apply filters and reload data
  const applyFilters = (): void => {
    loadGraphData();
  };

  // Reset filters
  const resetFilters = (): void => {
    const defaultFilters: Filters = {
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, -1),
      endTime: new Date().toISOString().slice(0, -1),
      connectionType: 'all',
      process: '',
      protocol: '',
      minConnections: 1,
      host: '',
      ipOrigin: ''
    };
    setFilters(defaultFilters);
  };

  // Graph control functions
  const fitGraph = (): void => {
    if (cyInstance.current) {
      cyInstance.current.fit();
    }
  };

  const centerGraph = (): void => {
    if (cyInstance.current) {
      cyInstance.current.center();
    }
  };

  const resetLayout = (): void => {
  if (cyInstance.current) {
    cyInstance.current.layout({ 
      name: 'cose-bilkent',
      randomize: true, // Force randomization on reset
      fit: true 
    } as any).run();
  }
};

  // Load data on component mount
  useEffect(() => {
    loadGraphData();
  }, []);

  // Re-run updateGraph when the showIPv6 toggle changes or when graphData updates
  useEffect(() => {
    // Ensure cytoscape instance exists before updating
    if (cyInstance.current) {
      updateGraph(graphData);
    }
  }, [showIPv6, graphData]);

  // Fetch connection types for legend and filters
  useEffect(() => {
    const fetchConnectionTypes = async () => {
      try {
        const types = await networkGraphService.getConnectionTypes();
        setConnectionTypes(types);
      } catch (error) {
        setConnectionTypes([]);
      }
    };
    fetchConnectionTypes();
  }, []);

  // Add fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = (): void => {
    if (!graphContainerRef.current) return;

    if (!document.fullscreenElement) {
      graphContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  return (
    <div className="network-graph-container h-screen flex flex-col">
      {/* Filters */}
      <NetworkFilters
        filters={filters}
        onChange={handleFilterChange}
        onApply={applyFilters}
        onReset={resetFilters}
        loading={loading}
        onRefresh={loadGraphData}
        connectionTypes={connectionTypes} // Pass down if needed
      />

      {/* Statistics */}
      <NetworkStatistics statistics={graphData.statistics} />

      {/* Graph Container */}
      <div 
        ref={graphContainerRef}
        className={`flex-1 relative bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      >
        {/* Graph Controls */}
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 space-y-2">
          <button
            onClick={fitGraph}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <i className="fas fa-expand-arrows-alt"></i>
            Fit
          </button>
          <button
            onClick={centerGraph}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <i className="fas fa-crosshairs"></i>
            Center
          </button>
          <button
            onClick={resetLayout}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <i className="fas fa-redo"></i>
            Reset
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          <div className="w-full flex items-center gap-2 pt-2">
            <input
              id="toggle-ipv6"
              type="checkbox"
              checked={showIPv6}
              onChange={() => setShowIPv6(prev => !prev)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="toggle-ipv6" className="text-sm text-gray-700">Show IPv6</label>
          </div>
        </div>

        {/* Dynamic Graph Legend */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3">
          <h3 className="font-semibold text-sm mb-2 text-gray-700">Legend</h3>
          <div className="space-y-1 text-xs max-h-80 overflow-y-auto">
            {connectionTypes.map((type) => {
              const color = getLegendColor(type);
              const count = graphData.statistics.find(stat => 
                stat.name === type || 
                graphData.edges.filter(edge => edge.destinationScope === type).length
              )?.count || 0;
              
              return (
                <div key={type} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span>{type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</span>
                  </div>
                  <span className="text-gray-500">({count})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center z-20">
            <LoadingSpinner message="Loading network graph..." />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <ErrorMessage message={error} onRetry={loadGraphData} />
          </div>
        )}

        {/* Cytoscape Container */}
        <div
          ref={cyRef}
          className="w-full h-full"
          style={{ minHeight: '500px' }}
        />
      </div>

      {/* Investigation Modals */}
      {showNodeModal && selectedNode && (
        <NodeInvestigationModal
          node={selectedNode}
          isOpen={showNodeModal}
          onClose={() => setShowNodeModal(false)}
           timeRange={{ 
            start: filters.startTime || '', 
            end: filters.endTime || '' 
          }}
        />
      )}

      {showEdgeModal && selectedEdge && (
        <EdgeInvestigationModal
          edge={selectedEdge}
          isOpen={showEdgeModal}
          onClose={() => setShowEdgeModal(false)}
          timeRange={{ 
            start: filters.startTime || '', 
            end: filters.endTime || '' 
          }}
        />
      )}
    </div>
  );
}

// Export the getLegendColor function
export function getLegendColor(type: string): string {
  if (!type) return '#a3a3a3'; // fallback for undefined/null

  // If we already assigned a color for this type, return it
  if (colorCache.has(type.toLowerCase())) {
    return colorCache.get(type.toLowerCase())!;
  }

  // If this is a new type, generate new colors for all types
  const allTypes = Array.from(new Set([...colorCache.keys(), type.toLowerCase()]));
  const colors = generateDistinctColors(allTypes.length);

  // Cache all colors
  allTypes.forEach((t, index) => {
    if (!colorCache.has(t)) {
      colorCache.set(t, colors[index]);
    }
  });

  return colorCache.get(type.toLowerCase()) || '#a3a3a3';
}
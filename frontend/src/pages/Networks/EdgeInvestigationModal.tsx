import React, { useState, useEffect } from 'react';
import networkGraphService from '../../services/networkGraphService';
import LoadingSpinner from './LoadingSpinner';

interface Connection {
  timestamp: string;
  protocol: string;
  port?: number;
  process: string;
  user: string;
  techniqueId?: string;
  riskLevel: 'high' | 'medium' | 'low';
}

interface Edge {
  sourceIp: string;
  targetIp: string;
}

interface EdgeInvestigationModalProps {
  edge: Edge;
  isOpen: boolean;
  onClose: () => void;
  timeRange: {
    start: string;
    end: string;
  };
}

const EdgeInvestigationModal: React.FC<EdgeInvestigationModalProps> = ({ 
  edge, 
  isOpen, 
  onClose, 
  timeRange 
}) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && edge) {
      loadConnections();
    }
  }, [isOpen, edge]);

  const loadConnections = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await networkGraphService.investigateEdge(
        edge.sourceIp,
        edge.targetIp,
        timeRange.start,
        timeRange.end
      );
      setConnections(data as Connection[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getRiskLevelStyles = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Connection Details: {edge.sourceIp} → {edge.targetIp}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && <div className="text-center py-8"><LoadingSpinner /></div>}
          {error && <div className="text-red-600 text-center py-8">Error: {error}</div>}
          
          {connections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protocol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Port</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Process</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technique</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {connections.map((conn, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(conn.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {conn.protocol.toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {conn.port || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={conn.process}>
                        {conn.process}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {conn.user}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {conn.techniqueId ? (
                          <span className="font-mono text-red-600">{conn.techniqueId.includes('=') ? conn.techniqueId.split('=')[1] : conn.techniqueId}</span>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && <div className="text-center py-8 text-gray-500">No connection details found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EdgeInvestigationModal;
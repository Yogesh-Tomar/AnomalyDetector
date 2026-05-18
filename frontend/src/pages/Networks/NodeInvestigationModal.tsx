import React, { useState, useEffect } from 'react';
import networkGraphService from '../../services/networkGraphService';
import LoadingSpinner from './LoadingSpinner';

interface Connection {
  timestamp: string;
  remoteIp: string;
  port?: number;
  protocol: string;
  process: string;
  riskLevel: 'high' | 'medium' | 'low';
}

interface Technique {
  techniqueId: string;
  count: number;
  lastSeen: string;
}

interface Investigation {
  ipAddress: string;
  hostname: string;
  nodeType: 'managed' | 'internal' | 'external';
  activityLevel: 'high' | 'medium' | 'low';
  lastActivity?: string;
  totalConnections: number;
  outgoingTargets: number;
  incomingSources: number;
  recentConnections: Connection[];
  topProcesses: string[];
  topUsers: string[];
  techniquesUsed: Technique[];
}

interface Node {
  id: string;
  label: string;
}

interface NodeInvestigationModalProps {
  node: Node;
  isOpen: boolean;
  onClose: () => void;
  timeRange: {
    start: string;
    end: string;
  };
}

const NodeInvestigationModal: React.FC<NodeInvestigationModalProps> = ({ 
  node, 
  isOpen, 
  onClose, 
  timeRange 
}) => {
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && node) {
      loadInvestigation();
    }
  }, [isOpen, node]);

  const loadInvestigation = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await networkGraphService.investigateNode(
        node.id,
        timeRange.start,
        timeRange.end
      );
      setInvestigation(data as Investigation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getNodeTypeStyles = (nodeType: string): string => {
    switch (nodeType) {
      case 'managed':
        return 'bg-green-100 text-green-800';
      case 'external':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getActivityLevelStyles = (activityLevel: string): string => {
    switch (activityLevel) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-4/5 overflow-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Node Investigation: {node.label}</h2>
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
          
          {investigation && (
            <div className="space-y-6">
              {/* Node Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Node Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>IP Address:</strong> {investigation.ipAddress}</div>
                    <div><strong>Hostname:</strong> {investigation.hostname}</div>
                    <div><strong>Type:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getNodeTypeStyles(investigation.nodeType)}`}>
                        {investigation.nodeType}
                      </span>
                    </div>                   
                    <div><strong>Last Activity:</strong> {investigation.lastActivity ? new Date(investigation.lastActivity).toLocaleString() : 'N/A'}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Connection Statistics</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{investigation.totalConnections}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{investigation.outgoingTargets}</div>
                      <div className="text-xs text-gray-600">Outgoing</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{investigation.incomingSources}</div>
                      <div className="text-xs text-gray-600">Incoming</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Connections */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Recent Connections</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remote IP</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Port</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Protocol</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Process</th>                          
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {investigation.recentConnections.slice(0, 20).map((conn, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-xs text-gray-900">
                              {new Date(conn.timestamp).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-xs font-mono text-gray-900">{conn.remoteIp}</td>
                            <td className="px-4 py-2 text-xs text-gray-900">{conn.port || 'N/A'}</td>
                            <td className="px-4 py-2 text-xs text-gray-900">{conn.protocol.toUpperCase()}</td>
                            <td className="px-4 py-2 text-xs text-gray-900 truncate max-w-32" title={conn.process}>
                              {conn.process}
                            </td>                           
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Top Processes and Users */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Top Processes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-1">
                      {investigation.topProcesses.map((process, idx) => (
                        <li key={idx} className="text-sm text-gray-700 font-mono truncate" title={process}>
                          {process}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Top Users</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-1">
                      {investigation.topUsers.map((user, idx) => (
                        <li key={idx} className="text-sm text-gray-700 font-mono">
                          {user}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Techniques Used */}
              {investigation.techniquesUsed.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">MITRE ATT&CK Techniques</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="space-y-2">
                      {investigation.techniquesUsed.map((technique, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="font-mono text-sm text-red-800">{technique.techniqueId.includes('=') ? technique.techniqueId.split('=')[1] : technique.techniqueId}</span>
                          <div className="flex items-center gap-4 text-xs text-red-600">
                            <span>Count: {technique.count}</span>
                            <span>Last: {new Date(technique.lastSeen).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeInvestigationModal;
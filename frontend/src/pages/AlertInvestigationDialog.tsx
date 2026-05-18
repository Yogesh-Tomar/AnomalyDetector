import { useState, useEffect, useRef } from 'react';
import { endpoints } from '../services/api';

interface AlertDetails {
  agentId: string;
  time: string;
  user: string;
  host: string;
  process: string;
  key: string;
  zScore: number;
  count: number;
  isRead: boolean;
  tsUtc: string;
  metric: number;
  keyId: number;
  entity?: {
    mean: number;
    sigma: number;
    bucketsSeen: number;
    initialized: boolean;
  };
  processMetadata?: {
    path: string;
    sha256: string;
    signer: string;
    parentProcess: string;
    commandLine: string;
  };
}

interface Props {
  alert: {
    agentId: string;
    tsUtc: string;
    metric: number;
    keyId: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (agentId: string, tsUtc: string, metric: number, keyId: number) => void;
}

export function AlertInvestigationDialog({ alert: alertInfo, isOpen, onClose, onMarkRead }: Props) {
  const [alert, setAlert] = useState<AlertDetails | null>(null);
  const [entityBaseline, setEntityBaseline] = useState<any | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<any | null>(null);
  const [analystNotes, setAnalystNotes] = useState<Array<{
    noteId: number;
    note: string;
    createdUtc: string;
    createdBy: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showExcludeModal, setShowExcludeModal] = useState(false);
  const [excludeForm, setExcludeForm] = useState<any>(null);
  const [excludeLoading, setExcludeLoading] = useState(false);
  const [excludeError, setExcludeError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && alertInfo) {
      fetchAlertDetails();
    }
  }, [isOpen, alertInfo]);

  const fetchAlertDetails = async () => {
    if (!alertInfo) return;
    
    setLoading(true);
    try {
      const params = { agentId: alertInfo?.agentId, tsUtc: alertInfo?.tsUtc, keyId: alertInfo?.keyId, metric: alertInfo?.metric };
      console.log('Fetching alert details with params:', params);
      const response = await endpoints.getAlertDetails(params);
      setAlert(response.data.alert);
      setEntityBaseline(response.data.entityBaseline);
      setRelatedEvents(response.data.relatedEvents);
      setAnalystNotes(response.data.analystNotes || []);
    } catch (error) {
      console.error('Failed to fetch alert details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async () => {
    if (!alert || !alertInfo) return;
    try {
      await endpoints.markAlertRead(alertInfo.agentId, alertInfo.tsUtc, alertInfo.metric, alertInfo.keyId);
      setAlert({ ...alert, isRead: true });
      onMarkRead(alertInfo.agentId, alertInfo.tsUtc, alertInfo.metric, alertInfo.keyId);
      onClose();
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleAddNote = async () => {
    if (!alert || !newNote.trim() || !alertInfo) return;
    setAddingNote(true);
    try {
      await endpoints.addAnalystNote(alertInfo.agentId, alertInfo.tsUtc, alertInfo.metric, alertInfo.keyId, newNote.trim());
      setNewNote('');
      await fetchAlertDetails();
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  const handleMuteKey = async () => {
    if (!alert?.entity || !alertInfo) return;
    try {
      await endpoints.muteKey(alertInfo.agentId);
    } catch (error) {
      console.error('Failed to mute key:', error);
    }
  };

  // Open Exclude Modal with pre-filled values
  const handleOpenExclude = () => {
    if (!alert) return;
    setExcludeForm({
      isEnabled: true,
      scopeType: 0,
      groupId: null,
      agentId: alert.agentId,
      metric: alert.metric,
      eventId: 0,
      keyId: alert.keyId,
      keyLike: alert.key,
      userLike: alert.user,
      tsUtc: alert.tsUtc,
      processLike: alert.process,
      reason: '',
      effectiveFromUtc: new Date().toISOString(),
      effectiveUntilUtc: new Date().toISOString(),
      createdBy: '', // Fill if available
      suppress: false,
      allowedStartHMMM: 0,
      allowedEndHMMM: 0,
      allowedDaysMask: 0,
      isActive: true,
      priority: 0,
      validFromUtc: new Date().toISOString(),
      validUntilUtc: null,
    });
    setShowExcludeModal(true);
    setExcludeError(null);
  };

  // Handle form changes
 const handleExcludeChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value, type } = e.target;
  if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
    const target = e.target as HTMLInputElement;
    setExcludeForm((prev: any) => ({
      ...prev,
      [name]: target.checked,
    }));
  } else {
    setExcludeForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  }
};

  // Submit exclude rule
  const handleExcludeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExcludeLoading(true);
    setExcludeError(null);
    try {
      await endpoints.excludeAlert(excludeForm); // Implement this API call in your endpoints
      setShowExcludeModal(false);
    } catch (err: any) {
      setExcludeError('Failed to exclude alert');
    } finally {
      setExcludeLoading(false);
    }
  };

  const formatNumber = (value: number | undefined | null): string => {
    return value != null && !isNaN(value) ? value.toFixed(2) : 'N/A';
  };

  const formatInteger = (value: number | undefined | null): string => {
    return value != null && !isNaN(value) ? value.toString() : 'N/A';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-4/5 overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Alert Investigation</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : alert ? (
                <div className="space-y-6">
                  {/* Alert Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-exclamation-triangle text-orange-500"></i>
                      Alert Summary
                      {!alert.isRead && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Unread</span>
                      )}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div><strong>Time:</strong> {alert.tsUtc || 'N/A'}</div>
                        <div><strong>User:</strong> <span className="font-mono text-xs break-all">{alert.user || 'N/A'}</span></div>
                        <div><strong>Host:</strong> {alert.host || 'N/A'}</div>
                      </div>
                      <div className="space-y-2">
                        <div><strong>Process:</strong> <span className="font-mono text-xs break-all">{alert.process || 'N/A'}</span></div>
                        <div><strong>Z-Score:</strong> <span className="font-mono">{formatNumber(alert.zScore)}</span></div>
                        <div><strong>Count:</strong> {formatInteger(alert.count)}</div>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <div><strong>Key:</strong> <span className="font-mono text-xs break-all">{alert.key || 'N/A'}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Baseline Context */}
                  {(entityBaseline) && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-chart-line text-blue-500"></i>
                        Baseline Context
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {entityBaseline ? (
                          <>
                            <div><strong>Mean:</strong> <span className="font-mono">{formatNumber(entityBaseline.mean)}</span></div>
                            <div><strong>Std Dev:</strong> <span className="font-mono">{formatNumber(entityBaseline.standardDeviation)}</span></div>
                            <div><strong>Lower Bound:</strong> <span className="font-mono">{formatNumber(entityBaseline.lowerBound)}</span></div>
                            <div><strong>Upper Bound:</strong> <span className="font-mono">{formatNumber(entityBaseline.upperBound)}</span></div>
                            <div><strong>Buckets Seen:</strong> {formatInteger(entityBaseline.bucketsSeen)}</div>
                            <div><strong>Initialized:</strong> {entityBaseline.initialized ? 'Yes' : 'No'}</div>
                            <div><strong>Last Updated:</strong> {entityBaseline.lastUpdated ? new Date(entityBaseline.lastUpdated).toLocaleString() : 'N/A'}</div>
                          </>
                        ) : alert.entity ? (
                          <>
                            <div><strong>Mean:</strong> <span className="font-mono">{formatNumber(alert.entity.mean)}</span></div>
                            <div><strong>Sigma (σ):</strong> <span className="font-mono">{formatNumber(alert.entity.sigma)}</span></div>
                            <div><strong>Mean ± 3σ:</strong> 
                              <span className="font-mono">
                                {alert.entity.mean != null && alert.entity.sigma != null && !isNaN(alert.entity.mean) && !isNaN(alert.entity.sigma)
                                  ? `${(alert.entity.mean - 3 * alert.entity.sigma).toFixed(2)} - ${(alert.entity.mean + 3 * alert.entity.sigma).toFixed(2)}`
                                  : 'N/A'
                                }
                              </span>
                            </div>
                            <div><strong>Buckets Seen:</strong> {formatInteger(alert.entity.bucketsSeen)}</div>
                            <div><strong>Initialized:</strong> {alert.entity.initialized ? 'Yes' : 'No'}</div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  )}                  

                  {/* Process Metadata */}
                  {alert.processMetadata && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-cog text-green-500"></i>
                        Process Metadata
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Path:</strong> <span className="font-mono text-xs">{alert.processMetadata.path || 'N/A'}</span></div>
                        <div><strong>SHA-256:</strong> <span className="font-mono text-xs">{alert.processMetadata.sha256 || 'N/A'}</span></div>
                        <div><strong>Signer:</strong> {alert.processMetadata.signer || 'N/A'}</div>
                        <div><strong>Parent Process:</strong> {alert.processMetadata.parentProcess || 'N/A'}</div>
                        <div><strong>Command Line:</strong> <span className="font-mono text-xs">{alert.processMetadata.commandLine || 'N/A'}</span></div>
                      </div>
                    </div>
                  )}

                  {/* Analyst Notes */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-sticky-note text-yellow-500"></i>
                      Analyst Notes
                    </h3>
                    
                    {/* Add new note */}
                    <div className="mb-4">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add your analysis notes..."
                        className="w-full p-3 border border-gray-300 rounded-md resize-none"
                        rows={3}
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim() || addingNote}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {addingNote ? 'Adding...' : 'Add Note'}
                      </button>
                    </div>

                    {/* Existing notes */}
                    <div className="space-y-3">
                      {analystNotes && analystNotes.length > 0 ? (
                        analystNotes.map((note) => (
                          <div key={note.noteId} className="bg-white p-3 rounded border">
                            <div className="text-sm text-gray-600 mb-1">
                              <strong>{note.createdBy || 'Unknown'}</strong> - {note.createdUtc ? new Date(note.createdUtc).toLocaleString() : 'Unknown date'}
                            </div>
                            <div>{note.note || ''}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 italic">No notes yet</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {!alert?.isRead && (
                      <button
                        onClick={handleMarkRead}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                      >
                        <i className="fa-solid fa-check"></i>
                        Mark as Read
                      </button>
                    )}
                    {/* <button
                      onClick={handleMuteKey}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-volume-mute"></i>
                      Mute Key
                    </button> */}
                    <button
                      onClick={handleOpenExclude}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-user-shield"></i>
                      Exclude Alert
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>

                  {/* Related Events */}
                  {/* {(relatedEvents) && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-list text-purple-500"></i>
                        Related Events
                      </h3>
                      <div className="space-y-4">
                        {relatedEvents.map((event: any) => (
                          <div key={event.eventId} className="bg-white p-4 rounded border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div><strong>Event ID:</strong> {event.eventId}</div>
                              <div><strong>Time:</strong> {event.tsUtc ? new Date(event.tsUtc).toLocaleString() : 'N/A'}</div>
                              <div><strong>User:</strong> <span className="font-mono text-xs break-all">{event.user || 'N/A'}</span></div>
                              <div><strong>Process:</strong> <span className="font-mono text-xs break-all">{event.process || 'N/A'}</span></div>
                              <div><strong>Process Path:</strong> <span className="font-mono text-xs break-all">{event.processPath || 'N/A'}</span></div>
                              <div><strong>Command Line:</strong> <span className="font-mono text-xs break-all">{event.commandLine || 'N/A'}</span></div>
                              <div><strong>Parent Image:</strong> <span className="font-mono text-xs break-all">{event.parentImage || 'N/A'}</span></div>
                              <div><strong>Technique:</strong> {event.technique || 'N/A'}</div>
                            </div>
                            <div className="mt-2">
                              <strong>Event Data:</strong>
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">{event.eventData || 'N/A'}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}
                </div>
              ) : (
                <div className="text-center py-8 text-red-600">Failed to load alert details</div>
              )}
            </div>
          </div>
        </div>
      )}
            
      {/* Exclude Modal */}
      {showExcludeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 h-4/5 overflow-y-auto">
            {/* <div className="overflow-y-auto"> */}
              <h3 className="text-xl font-bold mb-4">Exclude Alert (Whitelist)</h3>
              <form onSubmit={handleExcludeSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">Agent ID</label>
                  <input name="agentId" value={excludeForm.agentId} onChange={handleExcludeChange} disabled className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Metric</label>
                  <input name="metric" value={excludeForm.metric} onChange={handleExcludeChange} disabled className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Key ID</label>
                  <input name="keyId" value={excludeForm.keyId} onChange={handleExcludeChange} disabled className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Key Like</label>
                  <input name="keyLike" value={excludeForm.keyLike} onChange={handleExcludeChange} disabled className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">User Like</label>
                  <input name="userLike" value={excludeForm.userLike} onChange={handleExcludeChange} disabled className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Process Like</label>
                  <input name="processLike" value={excludeForm.processLike} onChange={handleExcludeChange} disabled className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Reason</label>
                  <textarea name="reason" value={excludeForm.reason} onChange={handleExcludeChange} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Effective From (UTC)</label>
                  <input type="date" name="effectiveFromUtc" value={excludeForm.effectiveFromUtc.slice(0, 10)} onChange={handleExcludeChange} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Effective Until (UTC)</label>
                  <input type="date" name="effectiveUntilUtc" value={excludeForm.effectiveUntilUtc.slice(0, 10)} onChange={handleExcludeChange} className="w-full border rounded p-2" />
                </div>
                {/* <div className="flex items-center gap-2 d-no">
                  <input type="checkbox" name="scopeType" checked onChange={e => setExcludeForm((prev: any) => ({ ...prev, scopeType: e.target.checked ? 1 : 0 }))} />
                  <label>Exclude for all users</label>
                </div> */}
                {excludeError && <div className="text-red-600">{excludeError}</div>}
                <div className="flex gap-2 mt-4">
                  <button type="submit" disabled={excludeLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    {excludeLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setShowExcludeModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                    Cancel
                  </button>
                </div>
              </form>
            {/* </div> */}
          </div>
        </div>
      )}
    </>
  );
}
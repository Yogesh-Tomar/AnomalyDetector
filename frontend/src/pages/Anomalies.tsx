import { useEffect, useState } from 'react'

type Anomaly = { id: string; timestamp: string; score: number; label?: string }

export function Anomalies() {
  const [rows, setRows] = useState<Anomaly[]>([])
  useEffect(() => {
    setRows([
      { id: 'a1', timestamp: '2025-09-10T10:03:12Z', score: 0.92, label: 'spike' },
      { id: 'a2', timestamp: '2025-09-10T12:44:02Z', score: 0.87 },
      { id: 'a3', timestamp: '2025-09-11T08:19:45Z', score: 0.96, label: 'drift' }
    ])
  }, [])

  return (
    <div className="card">
      <h2>Anomalies</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">ID</th>
              <th align="left">Timestamp</th>
              <th align="left">Score</th>
              <th align="left">Label</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{new Date(r.timestamp).toLocaleString()}</td>
                <td>{r.score.toFixed(2)}</td>
                <td>{r.label ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

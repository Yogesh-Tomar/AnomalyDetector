import { useState } from 'react'

export function Upload() {
  const [file, setFile] = useState<File | null>(null)

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
  }
  const onUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    // TODO: integrate with API
    alert(`Pretend uploading: ${file.name}`)
  }

  return (
    <form className="card" onSubmit={onUpload}>
      <h2>Upload dataset</h2>
      <input type="file" onChange={onSelect} />
      <div style={{ marginTop: 12 }}>
        <button disabled={!file} type="submit">Upload</button>
      </div>
    </form>
  )
}

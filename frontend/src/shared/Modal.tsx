import { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null
  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal">
        <button className="close-btn" onClick={onClose} aria-label="Close">&times;</button>
        {title && <h3>{title}</h3>}
        <div>{children}</div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000;
        }
        .modal {
          background: #fff; border-radius: 8px; max-width: 480px; width: 90%; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.2); position: relative;
        }
        .close-btn {
          position: absolute; right: 1rem; top: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #777;
        }
        .close-btn:hover { color: #333; }
      `}</style>
    </div>
  )
}

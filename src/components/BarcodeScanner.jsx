import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import './BarcodeScanner.css'

const READER_ID = 'barcode-reader'

function describeCameraError(err) {
  const text = String(err)

  if (!window.isSecureContext) {
    return 'The camera needs a secure (https) connection. Type the barcode number instead.'
  }
  if (text.includes('NotAllowed') || text.includes('Permission')) {
    return 'Camera access was blocked. Allow the camera in your browser settings, or type the barcode number instead.'
  }
  if (text.includes('NotFound') || text.includes('Requested device not found')) {
    return 'No camera was found on this device. Type the barcode number instead.'
  }
  if (text.includes('NotReadable') || text.includes('in use')) {
    return 'The camera is being used by another app. Close it and try again.'
  }
  return 'The camera could not be started. Type the barcode number instead.'
}

function BarcodeScanner({ onDetected, onClose }) {
  const scannerRef = useRef(null)
  const handledRef = useRef(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current
      scannerRef.current = null
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {})
      }
    }
  }, [])

  async function stopCamera() {
    const scanner = scannerRef.current
    scannerRef.current = null
    if (scanner) {
      try {
        await scanner.stop()
        scanner.clear()
      } catch {
        // The camera was already stopped, so there is nothing to do.
      }
    }
    setRunning(false)
  }

  async function startCamera() {
    setError('')
    handledRef.current = false

    const scanner = new Html5Qrcode(READER_ID, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ],
      verbose: false,
    })
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 140 } },
        (decodedText) => {
          if (handledRef.current) return
          handledRef.current = true
          stopCamera().then(() => onDetected(decodedText))
        },
        () => {}
      )
      setRunning(true)
    } catch (err) {
      scannerRef.current = null
      setError(describeCameraError(err))
    }
  }

  async function handleClose() {
    await stopCamera()
    onClose()
  }

  return (
    <div className="scanner">
      <div id={READER_ID} className="scanner-view" />

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <p className="food-note">
        Hold the barcode inside the frame, about 15 to 20 cm from the camera. The camera
        is only on while you are scanning.
      </p>

      {running ? (
        <button type="button" className="btn btn-secondary btn-full" onClick={stopCamera}>
          Stop camera
        </button>
      ) : (
        <button type="button" className="btn btn-full" onClick={startCamera}>
          Start camera
        </button>
      )}
      <button type="button" className="btn btn-secondary btn-full" onClick={handleClose}>
        Close scanner
      </button>
    </div>
  )
}

export default BarcodeScanner
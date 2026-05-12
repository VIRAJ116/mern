import { useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './LiveTrackingMap.css'

// ── Fixed store location (Adajan, Surat) ──────────────────────────
const STORE = {
  lat: 23.0225,
  lng: 72.4599,
  name: "La Pino'z Pizza South Bopal",
}
const ANIMATION_MS = 45_000 // 45 s to simulate full delivery run

// ── Helpers ───────────────────────────────────────────────────────
function haversineKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function lerp(a, b, t) {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t }
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

async function geocodeAddress(address) {
  try {
    const q = encodeURIComponent(address)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data[0])
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch (_) {
    // network error — fall through
  }
  return null
}

// ── Custom map icons ──────────────────────────────────────────────
const storeIcon = L.divIcon({
  html: `<div class="ltm-icon ltm-icon-store"><span>🏪</span></div>`,
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
})

const destIcon = L.divIcon({
  html: `<div class="ltm-icon ltm-icon-dest"><span>🏠</span></div>`,
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
})

const riderIcon = L.divIcon({
  html: `<div class="ltm-icon ltm-icon-rider"><div class="ltm-rider-ring"></div><span>🛵</span></div>`,
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
})

// ── Sub-component: fit map to store + destination once ────────────
function BoundsFitter({ store, dest }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (!fitted.current && dest) {
      map.fitBounds(
        L.latLngBounds([
          [store.lat, store.lng],
          [dest.lat, dest.lng],
        ]),
        { padding: [64, 64], maxZoom: 15 }
      )
      fitted.current = true
    }
  }, [map, store, dest])
  return null
}

// ── Main component ────────────────────────────────────────────────
export default function LiveTrackingMap({ order }) {
  const [dest, setDest] = useState(null)
  const [riderPos, setRiderPos] = useState({ lat: STORE.lat, lng: STORE.lng })
  const [progress, setProgress] = useState(0)
  const [eta, setEta] = useState(null)
  const [geoErr, setGeoErr] = useState(false)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  const { street, city, pincode } = order.deliveryAddress

  // Geocode delivery address
  useEffect(() => {
    geocodeAddress(`${street}, ${city}, ${pincode}, India`).then((coords) => {
      if (coords) {
        setDest(coords)
        const dist = haversineKm(STORE, coords)
        setEta(Math.max(8, Math.ceil((dist / 25) * 60)))
      } else {
        // fallback offset so map still shows something sensible
        const fallback = { lat: STORE.lat + 0.035, lng: STORE.lng + 0.045 }
        setDest(fallback)
        setEta(15)
        setGeoErr(true)
      }
    })
  }, [street, city, pincode])

  // Animate rider based on order status
  useEffect(() => {
    if (!dest) return
    cancelAnimationFrame(rafRef.current)

    const status = order.status

    if (status === 'placed' || status === 'preparing') {
      setRiderPos({ lat: STORE.lat, lng: STORE.lng })
      setProgress(0)
      return
    }

    if (status === 'delivered') {
      setRiderPos(dest)
      setProgress(1)
      setEta(0)
      return
    }

    // out-for-delivery → animate
    startRef.current = Date.now()

    function tick() {
      const elapsed = Date.now() - startRef.current
      const raw = Math.min(elapsed / ANIMATION_MS, 1)
      const t = easeInOut(raw)

      setProgress(t)
      const pos = lerp({ lat: STORE.lat, lng: STORE.lng }, dest, t)
      setRiderPos(pos)

      const remaining = haversineKm(pos, dest)
      setEta(Math.max(1, Math.ceil((remaining / 25) * 60)))

      if (raw < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [dest, order.status])

  // ── Loading state ──────────────────────────────────────────────
  if (!dest) {
    return (
      <div className="ltm-loading">
        <div className="ltm-spinner" />
        <p>Locating your delivery address…</p>
      </div>
    )
  }

  // ── Status pill config ─────────────────────────────────────────
  const statusMeta = {
    placed: { label: 'Order Placed', cls: 'waiting', dot: true },
    preparing: { label: 'Preparing', cls: 'waiting', dot: true },
    'out-for-delivery': { label: 'On the Way!', cls: 'active', dot: true },
    delivered: { label: 'Delivered ✓', cls: 'delivered', dot: false },
  }
  const sm = statusMeta[order.status] || statusMeta['placed']

  const mapCenter = lerp({ lat: STORE.lat, lng: STORE.lng }, dest, 0.5)

  return (
    <div className="ltm-wrapper">
      {/* ETA Banner */}
      <div className="ltm-eta-banner">
        <div className="ltm-eta-left">
          <span className="ltm-eta-icon">🛵</span>
          <div>
            <p className="ltm-eta-label">Estimated Arrival</p>
            <p className="ltm-eta-time">
              {order.status === 'delivered' ? 'Delivered!' : `${eta} min away`}
            </p>
          </div>
        </div>
        <div className="ltm-eta-right">
          <p className="ltm-store-label">Dispatched from</p>
          <p className="ltm-store-name">{STORE.name}</p>
        </div>
      </div>

      {/* Progress bar */}
      {order.status === 'out-for-delivery' && (
        <div className="ltm-progress-bar">
          <div
            className="ltm-progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Status / distance row */}
      <div className="ltm-status-row">
        <span className={`ltm-status-pill ${sm.cls}`}>
          {sm.dot && <span className="ltm-pulse-dot" />}
          {sm.label}
        </span>
        <span className="ltm-dist-text">
          {haversineKm(STORE, dest).toFixed(1)} km total
        </span>
      </div>

      {/* Leaflet Map */}
      <div className="ltm-map-container">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <BoundsFitter store={STORE} dest={dest} />

          {/* Store */}
          <Marker position={[STORE.lat, STORE.lng]} icon={storeIcon} />

          {/* Destination */}
          <Marker position={[dest.lat, dest.lng]} icon={destIcon} />

          {/* Rider (animated) */}
          <Marker position={[riderPos.lat, riderPos.lng]} icon={riderIcon} />

          {/* Route line */}
          <Polyline
            positions={[
              [STORE.lat, STORE.lng],
              [dest.lat, dest.lng],
            ]}
            color="#6366f1"
            weight={3}
            dashArray="10 7"
            opacity={0.65}
          />
        </MapContainer>
      </div>

      {geoErr && (
        <p className="ltm-geo-error">
          ⚠️ Could not precisely locate address — showing approximate route.
        </p>
      )}
    </div>
  )
}

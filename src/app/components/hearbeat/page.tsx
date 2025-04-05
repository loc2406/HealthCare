import { useEffect, useRef } from 'react'
import './heartbeat.scss'

export function HeartbeatPage() {
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (pathRef.current) {
      const totalLength = pathRef.current.getTotalLength()
      pathRef.current.style.strokeDasharray = `${totalLength}`
      pathRef.current.style.strokeDashoffset = `${totalLength}`
    }
  }, [])

  return (
    <div className="heartbeat-chart-container">
      <svg
        className="heartbeat-chart"
        viewBox="0 0 2000 200"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="url(#heartbeat-gradient)"
        strokeWidth="2"
      >
        <defs>
          <linearGradient id="heartbeat-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="limegreen">
              <animate
                attributeName="stop-color"
                values="limegreen;yellow;red;limegreen"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="yellow">
              <animate
                attributeName="stop-color"
                values="yellow;red;limegreen;yellow"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>

        <path
          ref={pathRef}
          className="heartbeat-path"
          d="M0 100 L50 100 L70 50 L90 150 L110 100 L200 100 L220 70 L240 100
             L300 100 L350 150 L400 50 L450 100 L500 100 L600 100 L620 70 L640 100
             L700 100 L750 150 L800 50 L850 100 L900 100 L1000 70 L1100 100
             L1200 100 L1250 150 L1300 50 L1350 100 L1400 100 L1500 100"
          strokeDasharray="2000"
          strokeDashoffset="2000"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="2000"
            to="0"
            dur="6s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  )
}

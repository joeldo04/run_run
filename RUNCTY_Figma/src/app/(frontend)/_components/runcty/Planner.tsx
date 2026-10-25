import { useMemo, useState } from 'react'
import {
  Check,
  Eraser,
  Flag,
  Navigation,
  Play,
  Plus,
  Route,
  Save,
  Sparkles,
  Undo2,
} from 'lucide-react'
import SafetyMap from './SafetyMap'
import {
  calculatePath,
  EXAMPLE_POINTS,
  length,
  nearestNode,
  routeScore,
  safety,
  uid,
  type Coordinate,
  type RouteData,
} from './data'
import { useDemo, useRoutes } from './store'
import {
  Button,
  EmptyState,
  PageTitle,
  RouteCard,
  SafetyNote,
  Score,
  TimeControl,
} from './components'

export default function Planner({
  mobile = false,
  open,
  run,
}: {
  mobile?: boolean
  open: (r: RouteData) => void
  run: (r: RouteData) => void
}) {
  const { state, user, update, notify } = useDemo(),
    allRoutes = useRoutes()
  const { draft } = state,
    [animateKey, setAnimateKey] = useState(0),
    [calculated, setCalculated] = useState(false)
  const [desired, setDesired] = useState(5),
    [level, setLevel] = useState('Todos'),
    [recommend, setRecommend] = useState(false),
    [savedId, setSavedId] = useState<string | null>(null)
  const [origin, setOrigin] = useState('jipiro'),
    [destination, setDestination] = useState('centro')
  const computed = useMemo(
    () => calculatePath(draft.points, state.time, state.date, state.incidents, state.risks, state.roads),
    [draft.points, state.time, state.date, state.incidents, state.risks, state.roads],
  )
  const manualGeometry = draft.points.map(point => nearestNode(point, state.roads))
  const geometry =
    draft.mode === 'manual'
      ? computed.geometry.length > 1
        ? computed.geometry
        : manualGeometry
      : computed.geometry
  const km = length(geometry)
  const preview: RouteData = useMemo(
    () => ({
      id: 'draft',
      name: draft.name,
      area: 'Loja · Recorrido personal',
      km: +km.toFixed(2),
      min: Math.max(1, Math.round(km * 7)),
      difficulty: km > 8 ? 'Avanzada' : km > 4 ? 'Intermedia' : 'Principiante',
      desc: 'Ruta privada planificada en RUNCTY. El índice es referencial; revisa el trazado antes de salir.',
      segmentIds: computed.segmentIds,
      geometry,
      owner: user?.name,
      owned: !!user,
      private: true,
      recommended: 'Consultar escenario horario',
    }),
    [draft.name, geometry, computed.segmentIds, km, user],
  )
  const result = routeScore(preview, state.time, state.date, state.incidents, state.risks, state.roads)
  const available = allRoutes.filter((r) => !r.private || r.status === 'Aprobado')
  const matches = available
    .filter(
      (r) =>
        Math.abs(r.km - desired) <= desired * 0.15 && (level === 'Todos' || r.difficulty === level),
    )
    .sort(
      (a, b) =>
        (routeScore(b, state.time, state.date, state.incidents, state.risks, state.roads).score ?? -1) -
        (routeScore(a, state.time, state.date, state.incidents, state.risks, state.roads).score ?? -1),
    )
    .slice(0, 5)
  const setPoints = (points: Coordinate[]) => {
    update((s) => ({ ...s, draft: { ...s.draft, points } }))
    setSavedId(null)
    if (draft.mode === 'manual') {
      setCalculated(points.length > 1)
      setAnimateKey((k) => k + 1)
    }
  }
  const example = () => {
    update((s) => ({
      ...s,
      draft: { ...s.draft, points: EXAMPLE_POINTS, name: 'Jipiro → Orillas del Zamora' },
    }))
    setCalculated(true)
    setAnimateKey((k) => k + 1)
    setSavedId(null)
  }
  const calculate = () => {
    const a =
      origin === 'jipiro'
        ? EXAMPLE_POINTS[0]
        : origin === 'valle'
          ? EXAMPLE_POINTS[1]
          : EXAMPLE_POINTS[2]
    const b =
      destination === 'centro'
        ? EXAMPLE_POINTS[2]
        : destination === 'valle'
          ? EXAMPLE_POINTS[1]
          : EXAMPLE_POINTS[0]
    if (origin === destination) {
      notify('Elige un origen y destino diferentes.')
      return
    }
    update((s) => ({ ...s, draft: { ...s.draft, points: [a, b], name: 'Mi ruta por Loja' } }))
    setCalculated(true)
    setAnimateKey((k) => k + 1)
    setSavedId(null)
  }
  const save = () => {
    if (savedId) {
      notify('Esta ruta ya está en Mis rutas.')
      return
    }
    if (geometry.length < 2 || km < 0.03) {
      notify('Añade al menos dos puntos diferentes.')
      return
    }
    const id = uid(),
      newRoute = { ...preview, id, date: state.date }
    const accepted = update((s) => ({
      ...s,
      customRoutes: [...s.customRoutes, newRoute],
      savedIds: [...s.savedIds, id],
    }))
    if (!accepted) return
    setSavedId(id)
    notify('Sincronizando tu ruta privada. Consulta el estado de guardado en pantalla.')
  }
  const mode = (next: 'manual' | 'calculate' | 'recommend') => {
    update((s) => ({ ...s, draft: { ...s.draft, mode: next } }))
    setRecommend(false)
    setCalculated(false)
  }
  const ready = geometry.length > 1 && (calculated || draft.mode === 'manual')
  return (
    <div className={`planner-screen ${mobile ? 'planner-mobile' : ''}`}>
      <PageTitle
        eyebrow="TU PRÓXIMO KILÓMETRO"
        title="Crea tu ruta"
        subtitle={
          mobile
            ? undefined
            : 'Tres formas de encontrar un recorrido. Un mismo mapa para decidir mejor.'
        }
      />
      <div className="mode-tabs" role="tablist" aria-label="Modo del planificador">
        <button
          role="tab"
          aria-selected={draft.mode === 'manual'}
          className={draft.mode === 'manual' ? 'active' : ''}
          onClick={() => mode('manual')}
        >
          <Plus />
          Trazar manualmente
        </button>
        <button
          role="tab"
          aria-selected={draft.mode === 'calculate'}
          className={draft.mode === 'calculate' ? 'active' : ''}
          onClick={() => mode('calculate')}
        >
          <Navigation />
          Entre dos puntos
        </button>
        <button
          role="tab"
          aria-selected={draft.mode === 'recommend'}
          className={draft.mode === 'recommend' ? 'active' : ''}
          onClick={() => mode('recommend')}
        >
          <Sparkles />
          Recomendar rutas
        </button>
      </div>
      <div className="planner-layout">
        <section className="planner-map-area">
          <SafetyMap
            drawing={draft.mode !== 'recommend'}
            points={draft.points}
            onPoints={(points) => setPoints(draft.mode === 'calculate' ? points.slice(-2) : points)}
            route={ready ? preview : null}
            animateKey={animateKey}
            fitRoute={ready}
            showReports
          />
          <div className="map-bottom-tools">
            <Button variant="secondary" onClick={example}>
              <Route />
              Crear ruta de ejemplo
            </Button>
            <span>{state.roads.length ? `${state.roads.length} tramos disponibles · Loja` : 'Sin red vial publicada · trazado manual sin puntuación'}</span>
          </div>
          <SafetyNote />
        </section>
        <aside className="planner-panel">
          <div className="planner-panel-heading">
            <span className="step-number">
              {draft.mode === 'manual' ? '01' : draft.mode === 'calculate' ? '02' : '03'}
            </span>
            <div>
              <h2>
                {draft.mode === 'manual'
                  ? 'Tu recorrido, punto a punto'
                  : draft.mode === 'calculate'
                    ? 'Elige origen y destino'
                    : 'Encuentra tu coincidencia'}
              </h2>
              <p>
                {draft.mode === 'manual'
                  ? state.roads.length ? 'Los puntos se ajustan a la red local.' : 'Trazado manual sin red validada ni índice. No se comprueba que el recorrido sea transitable.'
                  : draft.mode === 'calculate'
                    ? 'Calculamos considerando distancia e índice.'
                    : 'Distancia ±15 % · hasta cinco rutas.'}
              </p>
            </div>
          </div>
          <label className="field">
            Ciudad
            <select disabled aria-label="Ciudad del planificador">
              <option>Loja, Ecuador</option>
            </select>
          </label>
          {draft.mode === 'calculate' && (
            <div className="origin-destination">
              <label className="field">
                <span>
                  <i className="origin-dot" />
                  Origen
                </span>
                <select
                  aria-label="Punto de origen"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                >
                  <option value="jipiro">Parque Jipiro</option>
                  <option value="valle">El Valle</option>
                  <option value="centro">Orillas del Zamora</option>
                </select>
              </label>
              <label className="field">
                <span>
                  <Flag />
                  Destino
                </span>
                <select
                  aria-label="Punto de destino"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                >
                  <option value="centro">Orillas del Zamora</option>
                  <option value="valle">El Valle</option>
                  <option value="jipiro">Parque Jipiro</option>
                </select>
              </label>
            </div>
          )}
          {draft.mode === 'manual' && (
            <label className="field">
              Nombre de la ruta
              <input
                value={draft.name}
                onChange={(e) =>
                  update((s) => ({ ...s, draft: { ...s.draft, name: e.target.value } }))
                }
                maxLength={60}
                placeholder="Mi recorrido por Loja"
              />
            </label>
          )}
          {draft.mode === 'recommend' && (
            <div className="form-grid">
              <label className="field">
                Distancia deseada (km)
                <input
                  aria-label="Distancia deseada"
                  type="number"
                  min={1}
                  max={42}
                  step=".1"
                  value={desired}
                  onChange={(e) => {
                    setDesired(+e.target.value)
                    setRecommend(false)
                  }}
                />
                <small>Entre 1 y 42 km</small>
              </label>
              <label className="field">
                Nivel
                <select value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option>Todos</option>
                  <option>Principiante</option>
                  <option>Intermedia</option>
                  <option>Avanzada</option>
                </select>
              </label>
            </div>
          )}
          <label className="field scenario-field">
            Fecha y hora de consulta
            <TimeControl compact />
          </label>
          {draft.mode === 'manual' && (
            <div className="point-list">
              {draft.points.length === 0 ? (
                <p>Comienza pulsando sobre el mapa o prueba el recorrido de ejemplo.</p>
              ) : (
                draft.points.map((p, i) => (
                  <div key={i}>
                    <span className={i === 0 ? 'point-start' : ''}>
                      {i === 0 ? 'A' : i === draft.points.length - 1 ? 'B' : i + 1}
                    </span>
                    <p>
                      {i === 0
                        ? 'Inicio'
                        : i === draft.points.length - 1
                          ? 'Destino'
                          : 'Punto intermedio'}
                      <small>
                        {p[0].toFixed(4)}, {p[1].toFixed(4)}
                      </small>
                    </p>
                    <button
                      aria-label={`Eliminar punto ${i + 1}`}
                      onClick={() => setPoints(draft.points.filter((_, j) => j !== i))}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
          {draft.mode === 'calculate' && (
            <Button className="full" onClick={calculate}>
              <Navigation />
              Calcular ruta
            </Button>
          )}
          {draft.mode === 'recommend' && (
            <Button
              className="full"
              disabled={desired < 1 || desired > 42}
              onClick={() => setRecommend(true)}
            >
              <Sparkles />
              Buscar recomendaciones
            </Button>
          )}
          {draft.mode !== 'recommend' && (
            <>
              <div className="route-edit-tools">
                <Button
                  variant="ghost"
                  disabled={!draft.points.length}
                  onClick={() => setPoints(draft.points.slice(0, -1))}
                >
                  <Undo2 />
                  Deshacer
                </Button>
                <Button
                  variant="ghost"
                  disabled={!draft.points.length}
                  onClick={() => {
                    setPoints([])
                    setCalculated(false)
                  }}
                >
                  <Eraser />
                  Limpiar
                </Button>
              </div>
              {ready ? (
                <div className="route-result" aria-live="polite">
                  <div className="result-label">
                    <Check />
                    {computed.segmentIds.length ? 'Ruta sobre la red vial' : 'Trazado manual sin validar'}<span>{state.time}</span>
                  </div>
                  <div className="route-result-main">
                    <div>
                      <strong>
                        {km.toFixed(2)}
                        <small> km</small>
                      </strong>
                      <p>
                        {preview.min} min · {computed.segmentIds.length} tramos ·{' '}
                        {preview.difficulty}
                      </p>
                    </div>
                    <Score value={result.score} coverage={result.coverage} />
                  </div>
                  <Button
                    className="full"
                    onClick={save}
                    variant={savedId ? 'secondary' : 'primary'}
                  >
                    {savedId ? <Check /> : <Save />}
                    {savedId ? 'Guardada en Mis rutas' : 'Guardar ruta'}
                  </Button>
                  <div className="result-actions">
                    <button
                      onClick={() =>
                        open(
                          savedId ? (allRoutes.find((r) => r.id === savedId) ?? preview) : preview,
                        )
                      }
                    >
                      Ver detalles
                    </button>
                    <button onClick={() => run(preview)}>
                      <Play />
                      Correr esta ruta
                    </button>
                  </div>
                </div>
              ) : (
                <div className="planner-empty">
                  <Navigation />
                  <p>
                    {draft.mode === 'manual'
                      ? 'Añade al menos dos puntos para calcular.'
                      : 'Selecciona dos puntos o calcula con los lugares disponibles.'}
                  </p>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
      {draft.mode === 'recommend' && recommend && (
        <section className="recommendation-results">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PARA LAS {state.time}</span>
              <h2>{matches.length} rutas para ti</h2>
            </div>
            <span>Ordenadas por índice</span>
          </div>
          {matches.length ? (
            <div className="route-grid">
              {matches.map((r) => (
                <RouteCard key={r.id} route={r} onOpen={open} editorial />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sin coincidencias para esta distancia"
              description="Prueba una distancia diferente o cambia de nivel."
            />
          )}
          <div className="recommended-spaces">
            <h3>Espacios que coinciden con el horario</h3>
            {state.spaces
              .filter((s) => {
                const [start, end] = s.hours.split('–')
                return state.time >= start && state.time <= end
              })
              .map((s) => (
                <span key={s.id}>
                  {s.name} <small>{s.hours}</small>
                </span>
              ))}
          </div>
        </section>
      )}
    </div>
  )
}

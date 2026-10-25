/** Mock data ONLY for the explicit local demonstration mode; not verified street safety. */
import type { RouteData, Street, Sponsor, Banner, Space, Coordinate, TimeSlot } from './data'

const geometry: Coordinate[][] = [
  [[-3.9729,-79.2056],[-3.9737,-79.2027],[-3.9758,-79.2009]],
  [[-3.9758,-79.2009],[-3.9792,-79.2020],[-3.9815,-79.2002]],
  [[-3.9815,-79.2002],[-3.9857,-79.2027],[-3.9875,-79.2046]],
  [[-3.9875,-79.2046],[-3.9895,-79.2073],[-3.9917,-79.2054]],
  [[-3.9917,-79.2054],[-3.9940,-79.2028],[-3.9969,-79.2044]],
  [[-3.9758,-79.2009],[-3.9763,-79.1970],[-3.9781,-79.1945]],
  [[-3.9781,-79.1945],[-3.9832,-79.1948],[-3.9860,-79.1969]],
  [[-3.9860,-79.1969],[-3.9895,-79.1979],[-3.9920,-79.2012]],
  [[-3.9875,-79.2046],[-3.9874,-79.2100],[-3.9902,-79.2131]],
  [[-3.9902,-79.2131],[-3.9942,-79.2125],[-3.9965,-79.2104]],
  [[-3.9917,-79.2054],[-3.9920,-79.2012],[-3.9940,-79.2028]],
  [[-3.9815,-79.2002],[-3.9832,-79.1948],[-3.9860,-79.1969]],
]
const safetySamples: [number,number,number,number][] = [
  [67,88,82,52], [45,76,83,43], [43,79,85,35],
  [26,60,71,29], [30,55,78,28], [63,87,90,61],
  [59,79,82,39], [33,73,80,48], [28,58,76,37],
  [25,49,65,21], [58,84,90,53], [49,80,87,45],
]
export const DEMO_ROADS: Street[] = geometry.map((points, index) => {
  const scores = safetySamples[index]
  return {
    id: `demo-street-${index + 1}`,
    name: ['Av. Orillas del Zamora','Sendero Jipiro','Av. Universitaria','Calle Mercadillo','Vía occidental','Paseo del río','Sector El Valle','Conexión urbana','Camino Pucará','Sendero panorámico','Corredor central','Conexión San Cayetano'][index],
    points,
    scores: Object.fromEntries((['05:30','08:00','14:00','19:00'] as TimeSlot[]).map((t,i) => [t,scores[i]])) as Record<TimeSlot,number>,
    factors: ['Iluminación y características del tramo (simuladas)', 'Horario y contexto del recorrido (simulados)'],
  }
})
function exampleRoute(id: string, name: string, roadIndices: number[], difficulty: string, km: number, min: number, desc: string): RouteData {
  return {id, name, area:'Loja, Ecuador', km, min, difficulty, desc,
    geometry:roadIndices.flatMap(i=>geometry[i]), segmentIds:roadIndices.map(i=>`demo-street-${i+1}`),
    official: false, status:'Aprobado', recommended:'08:00–10:00 · 14:00–17:00',
  }
}
export const DEMO_ROUTES: RouteData[] = [
  exampleRoute('demo-jipiro','Circuito Jipiro',[0,1,5], 'Principiante',2.6,17,'Un recorrido de demostración por el entorno de Jipiro.'),
  exampleRoute('demo-zamora','Parque Lineal Zamora',[1,2,10], 'Intermedio',5.2,34,'Una opción de entrenamiento junto a corredores urbanos.'),
  exampleRoute('demo-pucara','Sendero Pucará',[8,9], 'Intermedio',4.8,38,'Recorrido panorámico de demostración.'),
  exampleRoute('demo-centro','Loja urbana',[2,3,4], 'Principiante',3.7,28,'Ruta urbana ilustrativa con varios índices según la hora.'),
  exampleRoute('demo-sancayetano','San Cayetano',[5,6,11], 'Avanzado',6.3,46,'Alternativa urbana para consultar horarios y tramos.'),
]
export const DEMO_SPACES: Space[] = [
  {id:'demo-space-1',name:'Parque Jipiro',type:'Parque',location:'Norte de Loja',hours:'05:30–19:00',coordinate:[-3.9736,-79.2027],description:'Espacio de ejemplo para explorar rutas.'},
  {id:'demo-space-2',name:'Parque Lineal Zamora',type:'Parque',location:'Ribera del Zamora',hours:'05:30–19:00',coordinate:[-3.9857,-79.2027],description:'Espacio de demostración para entrenar.'},
  {id:'demo-space-3',name:'Sendero Pucará',type:'Sendero',location:'Sector occidental',hours:'06:00–18:00',coordinate:[-3.9902,-79.2131],description:'Sendero de ejemplo para la planificación.'},
]
export const DEMO_SPONSORS: Sponsor[] = [
  {id:'demo-utpl',name:'UTPL',message:'Tu futuro también está en movimiento. Matrículas abiertas.',contact:'Campaña conceptual no oficial',active:true,visual:'university'},
  {id:'demo-cuxibamba',name:'Farmacias Cuxibamba',message:'¿Te duelen los pies después de correr? Tu bienestar también forma parte del recorrido.',contact:'Campaña conceptual no oficial',active:true,visual:'health'},
]
export const DEMO_BANNERS: Banner[] = [
 {id:'demo-banner-utpl',sponsorId:'demo-utpl',title:'Tu futuro también está en movimiento',start:'2026-01-01',end:'2030-12-31',placement:'explore',status:'Publicado'},
 {id:'demo-banner-cuxibamba',sponsorId:'demo-cuxibamba',title:'¿Te duelen los pies?',start:'2026-01-01',end:'2030-12-31',placement:'explore',status:'Publicado'},
]

export const BOID_SIZE = 18 // Three 6px simulation nodes; sprite scale is independent.
export const BOID_EMOJI_SIZE = 30 // Native 15px win-55-emoji GIFs at 2x.

// Looked up by the `halloween` tag in win-55-ui's emoji-categories.json:
// ghost (1AE), jack_o_lantern (51F), and candy (97B).
const HALLOWEEN_EMOJI = ['👻', '🎃', '🍬']
const SPEED = 4
const MAX_TURN = Math.PI / 18 // 10 degrees per 50ms simulation tick.
const ACCELERATION = 0.5
const NEIGHBOR_RADIUS = 144
const SEPARATION_RADIUS = 72
const ENTRANCE_DELAY_MS = 2000
const ENTRANCE_INTERVAL_MS = 500

type EntranceSide = 'top' | 'left' | 'right'
const ENTRANCE_SIDES: EntranceSide[] = ['top', 'left', 'right']
const SPRITE_MARGIN = (BOID_EMOJI_SIZE - BOID_SIZE) / 2
type Entrance = { x: number; y: number; vx: number; vy: number }
type EnteringFlock = { emoji: string; side: EntranceSide; remaining: number; nextSpawnMs: number; entrance: Entrance | null }

export function createBoidEntrance() {
  return { elapsedMs: 0, nextId: 0, flocks: null as EnteringFlock[] | null }
}

type BoidEntrance = ReturnType<typeof createBoidEntrance>

export interface Boid {
  id: number
  emoji: string
  x: number
  y: number
  vx: number
  vy: number
  wanderPhase?: number
  heading?: number
  steeringTarget?: number
  enteringFrom?: EntranceSide
}

export interface BoidWorld {
  cells: Uint8Array
  columns: number
  rows: number
  cellSize: number
}

type SensedWorld = BoidWorld & { occupiedSums: Uint32Array }
let occupiedSums = new Uint32Array()

function senseTerrain(world: BoidWorld): SensedWorld {
  const stride = world.columns + 1
  const length = stride * (world.rows + 1)
  if (occupiedSums.length !== length) occupiedSums = new Uint32Array(length)
  // One summed-area table makes all footprint probes constant-time.
  for (let y = 0; y < world.rows; y++) {
    let rowSum = 0
    const sourceRow = y * world.columns
    const destinationRow = (y + 1) * stride
    for (let x = 0; x < world.columns; x++) {
      rowSum += Number(world.cells[sourceRow + x] !== 0)
      occupiedSums[destinationRow + x + 1] = occupiedSums[y * stride + x + 1] + rowSum
    }
  }
  return { ...world, occupiedSums }
}

function terrainIsClear(world: SensedWorld, x: number, y: number, enteringFrom?: EntranceSide): boolean {
  const { columns, rows, cellSize, occupiedSums } = world
  if (!Number.isFinite(x) || !Number.isFinite(y)
    || (x < 0 && enteringFrom !== 'left') || (y < 0 && enteringFrom !== 'top')
    || (x + BOID_SIZE > columns * cellSize && enteringFrom !== 'right')
    || y + BOID_SIZE > rows * cellSize) return false
  const stride = columns + 1
  // Only the visible part of an entering body's footprint can contain terrain.
  const left = Math.max(0, Math.min(columns, Math.floor(x / cellSize)))
  const right = Math.max(0, Math.min(columns, Math.ceil((x + BOID_SIZE) / cellSize)))
  const top = Math.max(0, Math.min(rows, Math.floor(y / cellSize))) * stride
  const bottom = Math.max(0, Math.min(rows, Math.ceil((y + BOID_SIZE) / cellSize))) * stride
  return occupiedSums[bottom + right] - occupiedSums[bottom + left]
    - occupiedSums[top + right] + occupiedSums[top + left] === 0
}

function clearPath(world: SensedWorld, x: number, y: number, dx: number, dy: number): boolean {
  const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)))
  for (let i = 1; i <= steps; i++) {
    if (!terrainIsClear(world, x + dx * i / steps, y + dy * i / steps)) return false
  }
  return true
}

function findFreePosition(world: SensedWorld, boid: Boid, occupied: Boid[]) {
  let closest: { x: number; y: number } | null = null
  let distance = Infinity
  const footprintNodes = Math.ceil(BOID_SIZE / world.cellSize)
  const originX = Math.round(boid.x / world.cellSize)
  const originY = Math.round(boid.y / world.cellSize)
  function consider(column: number, row: number) {
    if (column < 0 || row < 0 || column > world.columns - footprintNodes || row > world.rows - footprintNodes) return
    const x = column * world.cellSize
    const y = row * world.cellSize
    const squared = (x - boid.x) ** 2 + (y - boid.y) ** 2
    if (squared < distance && terrainIsClear(world, x, y)
      && occupied.every(other => (other.x - x) ** 2 + (other.y - y) ** 2 >= (BOID_EMOJI_SIZE + 12) ** 2)) {
      closest = { x, y }
      distance = squared
    }
  }
  // Search nearby rings first, rather than traversing the entire grid for
  // every sand contact. Stop once further rings cannot improve the distance.
  for (let radius = 0; radius <= 6; radius++) {
    for (let x = originX - radius; x <= originX + radius; x++) {
      consider(x, originY - radius)
      if (radius) consider(x, originY + radius)
    }
    for (let y = originY - radius + 1; y < originY + radius; y++) {
      consider(originX - radius, y)
      consider(originX + radius, y)
    }
    if (closest && ((radius + 0.5) * world.cellSize) ** 2 >= distance) break
  }
  return closest
}

function chooseEntrance(world: SensedWorld, side: EntranceSide, reserved: Entrance[]): Entrance | null {
  const maxX = world.columns * world.cellSize - BOID_SIZE
  const maxY = world.rows * world.cellSize - BOID_SIZE
  if (maxX < 0 || maxY < 0) return null
  let best: Entrance | null = null
  let bestScore = -Infinity
  function consider(x: number, y: number, vx: number, vy: number) {
    if (!terrainIsClear(world, x, y) || !clearPath(world, x, y, vx * 3, vy * 3)) return
    // Prefer a mostly empty runway and keep different types' entrances apart.
    let score = Math.random() * 0.1
    for (let look = 1; look <= 10; look++) {
      if (terrainIsClear(world, x + vx * look, y + vy * look)) score++
    }
    for (const other of reserved) {
      score -= Math.max(0, 1 - Math.hypot(other.x - x, other.y - y) / NEIGHBOR_RADIUS) * 10
    }
    if (score > bestScore) {
      bestScore = score
      best = { x, y, vx, vy }
    }
  }
  if (side === 'top') {
    for (let x = SPRITE_MARGIN; x <= maxX - SPRITE_MARGIN; x += world.cellSize) {
      consider(x, 0, 0, SPEED)
    }
  } else {
    for (let y = SPRITE_MARGIN; y <= maxY - SPRITE_MARGIN; y += world.cellSize) {
      consider(side === 'left' ? 0 : maxX, y, side === 'left' ? SPEED : -SPEED, 0)
    }
  }
  return best
}

export function stepBoids(input: BoidWorld, previous: Boid[], entranceState: BoidEntrance, deltaMs = 50): Boid[] {
  const world = senseTerrain(input)
  entranceState.elapsedMs += deltaMs
  const flock: Boid[] = []
  for (const boid of previous) {
    // Relocate only when terrain has appeared underneath the small body.
    // Preserve momentum; ordinary movement below is still avoidance-only.
    const position = boid.enteringFrom || terrainIsClear(world, boid.x, boid.y)
      ? boid : findFreePosition(world, boid, flock) ?? boid
    flock.push({ ...boid, x: position.x, y: position.y })
  }

  if (entranceState.elapsedMs >= ENTRANCE_DELAY_MS) {
    if (!entranceState.flocks) {
      const targetCount = Math.min(40, Math.max(8, Math.floor(world.columns * world.rows / 300))) /2
      // Shuffle without replacement: every type claims its own side for this run.
      const sides = [...ENTRANCE_SIDES]
      for (let i = sides.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[sides[i], sides[j]] = [sides[j]!, sides[i]!]
      }
      entranceState.flocks = HALLOWEEN_EMOJI.map((emoji, index) => ({
        emoji,
        side: sides[index]!,
        remaining: Math.floor(targetCount / HALLOWEEN_EMOJI.length)
          + Number(index < targetCount % HALLOWEEN_EMOJI.length),
        nextSpawnMs: ENTRANCE_DELAY_MS,
        entrance: null,
      }))
    }
    const reserved = entranceState.flocks.flatMap(group => group.entrance ? [group.entrance] : [])
    for (const group of entranceState.flocks) {
      if (!group.remaining || group.entrance) continue
      group.entrance = chooseEntrance(world, group.side, reserved)
      if (group.entrance) reserved.push(group.entrance)
    }
    for (const group of entranceState.flocks) {
      const entrance = group.entrance
      if (!group.remaining || !entrance || entranceState.elapsedMs < group.nextSpawnMs) continue
      // If evolving terrain blocks the entrance, wait for it to clear.
      if (!terrainIsClear(world, entrance.x, entrance.y)) continue
      const width = world.columns * world.cellSize
      flock.push({ id: entranceState.nextId++, emoji: group.emoji, ...entrance,
        x: group.side === 'left' ? -BOID_SIZE - SPRITE_MARGIN
          : group.side === 'right' ? width + SPRITE_MARGIN : entrance.x,
        y: group.side === 'top' ? -BOID_SIZE - SPRITE_MARGIN : entrance.y,
        enteringFrom: group.side })
      group.remaining--
      group.nextSpawnMs = entranceState.elapsedMs + ENTRANCE_INTERVAL_MS
    }
  }

  // All steering reads the same snapshot, independent of iteration order.
  return flock.map(boid => {
    let alignmentX = 0
    let alignmentY = 0
    let cohesionX = 0
    let cohesionY = 0
    let separationX = 0
    let separationY = 0
    let sameTypeNeighbors = 0
    for (const other of flock) {
      if (other.id === boid.id) continue
      const dx = other.x - boid.x
      const dy = other.y - boid.y
      const distance = Math.hypot(dx, dy)
      if (distance >= NEIGHBOR_RADIUS) continue
      // Gather and align with the same emoji type; separate from every type.
      if (other.emoji === boid.emoji) {
        sameTypeNeighbors++
        alignmentX += other.vx
        alignmentY += other.vy
        cohesionX += dx
        cohesionY += dy
      }
      if (distance < SEPARATION_RADIUS) {
        // A substantial steering force in pixels/tick, with extra urgency
        // inside the body radius. The old inverse-square force was negligible.
        const urgency = (1 - distance / SEPARATION_RADIUS) ** 2
        if (distance > 0) {
          separationX -= dx / distance * urgency
          separationY -= dy / distance * urgency
        } else {
          // Coincident boids must receive opposite escape directions.
          separationX += boid.id < other.id ? -1 : 1
        }
      }
    }
    const cohesionDistance = Math.hypot(cohesionX, cohesionY)
    // Cap attraction so a large flock cannot overpower personal space.
    const cohesionStrength = cohesionDistance > 0 ? 0.18 / cohesionDistance : 0
    const currentHeading = boid.heading ?? Math.atan2(boid.vy, boid.vx)
    // Heading is independent of speed: a stopped boid still knows which way
    // it is facing and can complete a turn instead of resetting toward +X.
    const forwardX = Math.cos(currentHeading) * SPEED
    const forwardY = Math.sin(currentHeading) * SPEED
    const vx = forwardX + (sameTypeNeighbors ? (alignmentX / sameTypeNeighbors - forwardX) * 0.12 : 0)
      + cohesionX * cohesionStrength + separationX * 8
    const vy = forwardY + (sameTypeNeighbors ? (alignmentY / sameTypeNeighbors - forwardY) * 0.12 : 0)
      + cohesionY * cohesionStrength + separationY * 8
    const wanderPhase = (boid.wanderPhase ?? boid.id * 2.39996) + 0.045
    // Gentle, continuous wandering gives solitary boids exploratory motion.
    const heading = Math.atan2(vy, vx) + Math.sin(wanderPhase) * 0.07
    let best: { angle: number } | null = null
    let bestScore = -Infinity
    // Terrain only influences steering. Score the small sensing body ahead;
    // even an occupied current position can find a direction toward open space.
    for (let i = 0; i < 32; i++) {
      const angle = heading + i * Math.PI / 16
      const dx = Math.cos(angle) * SPEED
      const dy = Math.sin(angle) * SPEED
      let obstacleCost = 0
      for (let look = 1; look <= 10; look++) {
        if (!terrainIsClear(world, boid.x + dx * look, boid.y + dy * look, boid.enteringFrom)) {
          obstacleCost += (11 - look) / 10
        }
      }
      // Anticipate other boids' paths, rather than reacting only after overlap.
      // Use the closest approach over four ticks to steer around oncoming birds.
      let crowding = 0
      for (const other of flock) {
        if (other.id === boid.id) continue
        const rx = other.x - boid.x
        const ry = other.y - boid.y
        if (Math.hypot(rx, ry) > NEIGHBOR_RADIUS) continue
        const relativeX = other.vx - dx
        const relativeY = other.vy - dy
        const relativeSpeed = relativeX ** 2 + relativeY ** 2
        const closestTime = relativeSpeed > 0
          ? Math.max(1, Math.min(4, -(rx * relativeX + ry * relativeY) / relativeSpeed)) : 1
        const distance = Math.hypot(rx + relativeX * closestTime, ry + relativeY * closestTime)
        crowding += Math.max(0, 1 - distance / SEPARATION_RADIUS) ** 2
      }
      // Favor the desired course in open space; turn decisively near obstacles.
      const score = Math.cos(angle - heading) * 4 - obstacleCost * 3 - crowding * 16
      if (score > bestScore) {
        bestScore = score
        best = { angle }
      }
    }
    // The sampled route is a steering target, never an immediate velocity flip.
    // Keep heading even while stopped so braking cannot reset our orientation.
    // Commit to a turn until it completes. Replanning left/right every tick
    // can otherwise leave a braked boid oscillating against the same obstacle.
    // Commit to the inward runway until the whole sprite has entered. Flock
    // separation outside the viewport would otherwise turn the queue around.
    const targetHeading = boid.enteringFrom
      ? boid.enteringFrom === 'top' ? Math.PI / 2 : boid.enteringFrom === 'left' ? 0 : Math.PI
      : boid.steeringTarget ?? best?.angle
        ?? currentHeading + (boid.id % 2 ? MAX_TURN : -MAX_TURN)
    const turn = Math.atan2(Math.sin(targetHeading - currentHeading), Math.cos(targetHeading - currentHeading))
    const nextHeading = currentHeading + Math.max(-MAX_TURN, Math.min(MAX_TURN, turn))
    const steeringTarget = Math.abs(turn) > MAX_TURN ? targetHeading : undefined
    const targetSpeed = SPEED * Math.max(0.5, Math.cos(turn))
    const currentSpeed = Math.hypot(boid.vx, boid.vy)
    const speed = currentSpeed + Math.max(-ACCELERATION, Math.min(ACCELERATION, targetSpeed - currentSpeed))
    const nextVx = Math.cos(nextHeading) * speed
    const nextVy = Math.sin(nextHeading) * speed
    const maxX = Math.max(0, world.columns * world.cellSize - BOID_SIZE)
    const maxY = Math.max(0, world.rows * world.cellSize - BOID_SIZE)
    const x = Math.max(boid.enteringFrom === 'left' ? -Infinity : 0,
      Math.min(boid.enteringFrom === 'right' ? Infinity : maxX, boid.x + nextVx))
    const y = Math.max(boid.enteringFrom === 'top' ? -Infinity : 0, Math.min(maxY, boid.y + nextVy))
    // Restore the entry boundary permanently once the entire emoji is inside.
    const fullyOnScreen = x >= SPRITE_MARGIN && x <= maxX - SPRITE_MARGIN
      && y >= SPRITE_MARGIN && y <= maxY - SPRITE_MARGIN
    // No terrain collision blocking or stopping during movement. Constrain only
    // the outer viewport; keep subpixel positions throughout the simulation.
    return { ...boid,
      x, y, enteringFrom: fullyOnScreen ? undefined : boid.enteringFrom,
      vx: nextVx, vy: nextVy, heading: nextHeading, wanderPhase, steeringTarget }
  })
}

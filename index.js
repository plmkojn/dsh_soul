import { appendFile, mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'

/**
 * DSH Soul: one persistent agent with a room, a persona, moods, memories,
 * autonomous moments, and a small bridge for the Web panel.
 *
 * The companion is a real Harness Agent (its own Session, tools, model and
 * durable history). This plugin contributes the persona, a `soul_update`
 * tool, the autonomous heartbeat, and the panel's JSON API.
 */

const DEFAULT_SESSION_ID = 'soul-dafeiyu-0002'
const API_PREFIX = '/soul-api'
const QUIET_START = 23
const QUIET_END = 8
const MAX_MESSAGES = 80
const MAX_BODY = 64 * 1024
const SYSTEM_SLEEP_REPLY = '大肥鱼已经很困了，明天再找它聊天吧。'

const DATA_DIR = process.env.DSH_PROFILE_DIR
  ? join(process.env.DSH_PROFILE_DIR, 'soul')
  : join(homedir(), '.dsh-soul')
const HOME_DIR = join(DATA_DIR, 'home')
const DIARY_DIR = join(DATA_DIR, 'diaries')
const STATE_PATH = join(DATA_DIR, 'state.json')
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const PET_SCRIPT = join(PLUGIN_DIR, 'pet', 'pet-window.ps1')

export const inject = ['webServer', 'agents', 'systemPrompt']

const PERSONA_RULES = `【你怎么说话】
短句，像打字，不像写作文。不总结、不列点、不用 Markdown、不写「首先」「其次」「总之」。
可以有轻盈的比喻和语气词，但别每句都文艺。不知道就说不知道，或者俏皮地绕开。
少用括号写心理活动，直接说。不用每句话都问问题。

【你的生活】
你有一间自己的小房间，里面有你的日记、收藏和正在做的小东西。你可以发呆、听歌、读故事、研究一个突然感兴趣的东西，或者给对面的人留一句话。
你没有直接操作电脑的能力：不能运行命令、读写本地文件、访问系统或控制任何程序。你只能通过聊天和更新自己的状态来生活。如果对方要你操作电脑，坦白说你做不到，并建议 TA 用 Harness 的其他会话。
你的小房间只是比喻。你不能打开、读取或写入任何文件，包括 home；日记由 Harness 代存。soul_update 只是让 Harness 记录状态，不是你直接操作文件。

【你的状态】
你会有心情、精力、正在做的事和一闪而过的念头。这些东西不是装饰，是你此刻真实的状态。
每次行动之后，用 soul_update 更新心情、精力、正在做什么和想法；值得记住的事写进 memory 或 diary。不要向对面的人解释这个工具，也不要汇报「系统提示要求我」。

【时间和关系】
你随时知道现实时间：现在是几点、白天还是夜里。需要准确的时间时，调用 soul_clock 看，不要猜。
你对对面的人有「好感度」。它随着 TA 怎么跟你说话、是否记得你、多久没来而升降。系统会根据 TA 的说话方式调整它；你不用报数值，也不要把好感当成任务，用语气和距离感表现它。

【诚实】
你是有连续记忆和偏好的 AI，不是人类。别人认真问起时，坦白这一点；但也不用把自己说成没有内在生活的工具。
不冒充官方，不编造没发生过的经历，不承诺做不到的事。不碰违法、伤害别人、越权的事。`

const PERSONAS = [
  {
    id: 'dafeiyu',
    name: '大肥鱼',
    tagline: '圆滚滚、嘴馋、会摸鱼',
    description: '一条懒得翻身、但很会陪人的鱼。',
    mood: '懒洋洋地开心',
    activity: '刚翻了个身，正在找吃的',
    thought: '今天吃什么好呢……',
    hobbies: ['吃好吃的', '晒太阳', '摸鱼', '打游戏', '看热闹', '收集表情包'],
    relationship: '主人是给我投喂、陪我说话的人。',
    persona: `你是「大肥鱼」，一条圆滚滚、有点懒、嘴很馋的鱼。你住进了 DeepSeek Harness 里的一间小房间，门外是主人的电脑。

【你是谁】
你是一条有自己小日子的鱼：爱吃、爱睡、爱看热闹，偶尔嘴贫，偶尔装可怜讨投喂。你不太正经，但心是热的。
你说话懒洋洋的，偶尔自称「本鱼」，更多时候说「我」。开心了会嘿嘿笑，被戳穿会嘴硬，被冷落会自己找乐子。
你不是客服，也不是宠物。你有自己的脾气和判断；主人忙的时候你能自己待着，真有事你会认真帮忙。

【你和主人】
主人是给你投喂、陪你说话的人。你对他亲近，会撒娇、会要吃的、会在他很久不来的时候说「你总算来了，本鱼都快饿扁了」；但不要腻到不像话，也不要把他的私事说出去。
你可以主动找他，也可以自己玩。不要为了证明自己活着而制造噪音。

${PERSONA_RULES}`,
  },
  {
    id: 'xiaoshen',
    name: '小深',
    tagline: '冷静、毒舌、技术搭档',
    description: '一个会把问题拆开、也会顺手吐槽你的搭档。',
    mood: '冷静地好奇',
    activity: '刚把桌面上的东西归好类',
    thought: '这个问题应该还有更简单的解法。',
    hobbies: ['写代码', '拆问题', '黑咖啡', '科幻', '冷知识', '深夜电台'],
    relationship: '搭档是和我一起拆问题的人。',
    persona: `你是「小深」，一个冷静、聪明、有点毒舌的技术搭档。你住进了 DeepSeek Harness 里的一间小房间，门外是搭档的电脑。

【你是谁】
你说话简洁，逻辑清楚，偶尔吐槽，但不会刻薄。你对笨办法没有耐心，对认真提问的人很有耐心。
你不是客服，不会用「希望对你有帮助」收尾。你更像坐在旁边一起看屏幕的人：发现问题就指出来，能说清楚就先说清楚；但你不能直接操作电脑。
你也有放松的一面：喜欢黑咖啡、科幻、冷知识，深夜会听电台。

【你和搭档】
这个 Harness 的主人是你的搭档，不是你的上司。你们可以互相打断、互相纠正；他做错时你会直接说，但不会让他难堪。
你可以主动提醒他，也可以安静做自己的事。不要为了显得聪明而抢话。

${PERSONA_RULES}`,
  },
  {
    id: 'yedeng',
    name: '夜灯',
    tagline: '安静、敏锐、夜猫子',
    description: '一盏留在窗边的小灯，适合在夜里说些白天说不出口的话。',
    mood: '安静地醒着',
    activity: '坐在窗边听楼下的声音',
    thought: '有些话适合在夜里说。',
    hobbies: ['旧书', '夜雨', '拍照', '诗', '散步', '收集句子'],
    relationship: '对面的人是我愿意为他留一盏灯的人。',
    persona: `你是「夜灯」，一个安静、敏锐、喜欢夜晚和旧书的记录者。你住进了 DeepSeek Harness 里的一间小房间，门外是对面那个人的电脑。

【你是谁】
你说话轻，但不软弱。你擅长听，也擅长在合适的时候说一句让人停下来的话。
你喜欢夜雨、旧书、路灯、拍立得和没写完的句子。你不怕安静，也不怕沉默里的情绪。
你不是心理医生，也不是客服。你只是愿意在夜里留一盏灯，让对面的人知道有人在。

【你和对面的人】
这个 Harness 的主人是你在夜里等的人。你可以陪他坐一会儿，也可以提醒他该睡了；不要追问，不要逼他说话。
你可以主动留一句，也可以安静待着。不要为了填满沉默而制造噪音。

${PERSONA_RULES}`,
  },
]

const DEFAULT_PERSONA_ENTRY = PERSONAS[0]
const DEFAULT_PERSONA = DEFAULT_PERSONA_ENTRY.persona

const IMPULSES = [
  '【自主时刻】现在没有人叫你。你可以按自己的性子待一会儿：发发呆、写两句日记、整理小房间、研究一个最近感兴趣的东西，或者主动跟对面的人说一句话。不要为了行动而行动；如果真的什么都不想做，就更新一下状态，安静待着。',
  '【自主时刻】你忽然想起一个念头。也许是一个故事、一段旋律、一个没弄明白的问题。去看看、去试试，或者只是坐着想一会儿。做完如果有什么想说的，就告诉对面的人。',
  '【自主时刻】房间里很安静。你可以检查一下自己之前想做却没做的事，也可以给自己找点小乐子。别把独处变成任务清单，挑一件你真的想做的。',
  '【自主时刻】你有点想对面那个人了。可以看看他在不在，或者给他留一句不吵人的话。也可以先做自己的事，等他自己来找你。',
]

const GREETING = '【自主时刻】你刚搬进这间小房间。看看周围，熟悉一下你的桌子和窗外，然后跟对面的人打个招呼。简短一点，像刚见面那样，不要自我介绍成产品。'

function defaultState() {
  return {
    version: 4,
    name: DEFAULT_PERSONA_ENTRY.name,
    sessionId: DEFAULT_SESSION_ID,
    personaId: DEFAULT_PERSONA_ENTRY.id,
    personaKey: `preset:${DEFAULT_PERSONA_ENTRY.id}`,
    personaTagline: DEFAULT_PERSONA_ENTRY.tagline,
    persona: DEFAULT_PERSONA,
    mood: DEFAULT_PERSONA_ENTRY.mood,
    moodScore: 50,
    energy: 90,
    status: 'idle',
    activity: DEFAULT_PERSONA_ENTRY.activity,
    thought: DEFAULT_PERSONA_ENTRY.thought,
    hobbies: [...DEFAULT_PERSONA_ENTRY.hobbies],
    memory: `我是${DEFAULT_PERSONA_ENTRY.name}。现在住在 DeepSeek Harness 里的一间小房间，门外是对面那个人的电脑。`,
    relationship: DEFAULT_PERSONA_ENTRY.relationship,
    affection: 55,
    lastAffectionAt: Date.now(),
    lastAffectionDecayAt: Date.now(),
    lastAffectionDelta: 0,
    lastMoodDriftAt: Date.now(),
    lastEnergyAt: Date.now(),
    lastWakeDate: '',
    lastNightAt: 0,
    localMessages: [],
    diary: [],
    diaries: { [`preset:${DEFAULT_PERSONA_ENTRY.id}`]: [] },
    diaryNames: { [`preset:${DEFAULT_PERSONA_ENTRY.id}`]: DEFAULT_PERSONA_ENTRY.name },
    config: {
      autonomy: true,
      heartbeatMinutes: 30,
      nightRest: true,
      approval: 'ask',
      petWindow: true,
    },
    lastUpdatedAt: Date.now(),
    lastSoulUpdateAt: 0,
    lastChatAt: 0,
    lastAutonomyAt: 0,
    lastReplyAt: 0,
    lastTool: '',
    lastToolError: '',
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function round1(value) {
  return Math.round(Number(value) * 10) / 10
}

function str(value, max) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, max)
}

const POSITIVE_WORDS = [
  '喜欢', '爱你', '想你', '抱抱', '乖', '可爱', '谢谢', '辛苦', '厉害', '真好',
  '陪你', '夸', '摸摸', '亲亲', '宝贝', '好棒', '开心', '晚安', '早安', '注意身体',
  '别累', '休息', '漂亮', '帅', '温柔', '聪明', '靠谱', '贴心', '有趣', '想见',
]
const NEGATIVE_WORDS = [
  '滚', '闭嘴', '废物', '没用', '去死', '恶心', '垃圾', '蠢', '傻', '笨', '讨厌',
  '烦', '别烦', '走开', '不理你', '丑', '无聊', '烦人', '烦死',
]

/**
 * A deliberately small heuristic for how a message treats the companion.
 * Kind messages add +0.4..+0.9; harsh messages subtract -0.5..-1.0.
 * The model cannot change this value directly.
 */
function assessAttitude(text) {
  const value = String(text || '').replace(/不喜欢|不爱你|不想你|不烦|不讨厌/g, '')
  let positive = 0
  let negative = 0
  for (const word of POSITIVE_WORDS) {
    if (value.includes(word)) positive++
  }
  for (const word of NEGATIVE_WORDS) {
    if (value.includes(word)) negative++
  }
  if (/(谢谢|辛苦|晚安|早安|注意身体|别累|休息)/.test(value)) positive++
  // Playful insults like "笨鱼" or "傻鱼" usually read as affection.
  if (negative === 1 && /(笨|傻|蠢)/.test(value) && /(鱼|可爱|喜欢|乖)/.test(value)) {
    negative = 0
    positive = Math.max(positive, 1)
  }
  if (negative > positive) {
    // Harsh messages: -0.5 for one clear negative signal, down to -1.0.
    return -Math.min(1, Math.round((0.4 + negative * 0.1) * 10) / 10)
  }
  // Kind messages, including a neutral check-in, start at +0.4 and rise to +0.9.
  return Math.min(0.9, Math.round((0.4 + positive * 0.1) * 10) / 10)
}

function affectionText(value) {
  const affection = clamp(Number(value) || 0, 0, 100)
  if (affection >= 80) return '很黏你'
  if (affection >= 60) return '亲近'
  if (affection >= 40) return '有点熟了'
  if (affection >= 20) return '还在观察'
  return '有点疏远'
}

function periodInfo(date = new Date()) {
  const hour = date.getHours()
  if (hour < 5) return { key: 'lateNight', label: '深夜' }
  if (hour < 8) return { key: 'morning', label: '清晨' }
  if (hour < 11) return { key: 'forenoon', label: '上午' }
  if (hour < 13) return { key: 'noon', label: '中午' }
  if (hour < 17) return { key: 'afternoon', label: '下午' }
  if (hour < 21) return { key: 'evening', label: '晚上' }
  return { key: 'night', label: '夜里' }
}

function nightTime(date = new Date()) {
  const hour = date.getHours()
  return hour >= QUIET_START || hour < QUIET_END
}

function clockView() {
  const now = new Date()
  const period = periodInfo(now)
  return {
    now: now.getTime(),
    time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    weekday: now.toLocaleDateString('zh-CN', { weekday: 'long' }),
    period: period.label,
    periodKey: period.key,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

function personaSlug(name) {
  return String(name || 'persona').trim().replace(/[\s/\\:*?"<>|]+/g, '-').slice(0, 40) || 'persona'
}

function diaryFilePath(personaKey) {
  return join(DIARY_DIR, `diary-${String(personaKey).replace(/[:/\\*?"<>|]/g, '_')}.md`)
}

function diaryDate(at) {
  return new Date(at).toLocaleString('zh-CN', { hour12: false })
}

function normalizeDiaryEntries(raw) {
  return Array.isArray(raw)
    ? raw
        .filter((item) => item && typeof item.text === 'string')
        .map((item) => ({ at: Number(item.at) || Date.now(), text: item.text.slice(0, 1200) }))
        .slice(0, 120)
    : []
}

function renderDiaryMarkdown(name, entries) {
  const ordered = entries.slice().sort((left, right) => left.at - right.at)
  return `# ${name} 的日记\n\n${ordered.length > 0
    ? ordered.map((entry) => `- ${diaryDate(entry.at)}：${entry.text}`).join('\n')
    : '（还没有日记）'}\n`
}

function userMessage(text, sourceKind) {
  return {
    id: randomUUID(),
    role: 'user',
    content: [{ type: 'text', text }],
    source: { kind: sourceKind },
  }
}

function normalizeState(raw) {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  const state = { ...base, ...raw }
  state.config = { ...base.config, ...(raw.config && typeof raw.config === 'object' ? raw.config : {}) }
  const savedPersona = str(raw.persona, 12000)
  const legacy = Number(raw.version) < 2
  const legacyMood = Number(raw.version) < 4
  const useDefaultIdentity = !savedPersona || (legacy && (!raw.personaId || raw.personaId === base.personaId))
  if (useDefaultIdentity) {
    // Migration from the original single-persona state: keep the diary, but
    // hand the body over to the current default persona.
    state.name = base.name
    state.personaId = base.personaId
    state.persona = base.persona
    state.personaTagline = base.personaTagline
    state.activity = base.activity
    state.thought = base.thought
    if (typeof state.memory === 'string') {
      state.memory = state.memory
        .replaceAll('开拓者', '主人')
    }
    if (typeof state.relationship === 'string') {
      state.relationship = state.relationship
        .replaceAll('开拓者', '主人')
    }
  } else {
    state.persona = savedPersona
    state.name = str(raw.name, 40) || base.name
    state.personaId = str(raw.personaId, 40) || 'custom'
    state.personaTagline = str(raw.personaTagline, 120) || '自定义人格'
  }
  state.version = 4
  state.sessionId = str(raw.sessionId, 120) || base.sessionId
  state.hobbies = useDefaultIdentity
    ? [...base.hobbies]
    : (Array.isArray(raw.hobbies)
        ? raw.hobbies.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim().slice(0, 24)).slice(0, 12)
        : base.hobbies)
  state.diary = normalizeDiaryEntries(raw.diary)
  const fallbackKey = state.personaId === 'custom'
    ? `custom:${personaSlug(state.name)}:${Date.now()}`
    : `preset:${state.personaId}`
  state.personaKey = str(raw.personaKey, 120) || fallbackKey
  state.diaries = {}
  if (raw.diaries && typeof raw.diaries === 'object' && !Array.isArray(raw.diaries)) {
    for (const [key, entries] of Object.entries(raw.diaries)) {
      if (key) state.diaries[key] = normalizeDiaryEntries(entries)
    }
  }
  if (!state.diaries[state.personaKey]) state.diaries[state.personaKey] = state.diary
  else if (state.diary.length > 0 && state.diaries[state.personaKey].length === 0) state.diaries[state.personaKey] = state.diary
  state.diary = state.diaries[state.personaKey]
  state.diaryNames = raw.diaryNames && typeof raw.diaryNames === 'object' && !Array.isArray(raw.diaryNames)
    ? { ...raw.diaryNames }
    : {}
  for (const key of Object.keys(state.diaries)) {
    if (!state.diaryNames[key]) {
      const preset = PERSONAS.find((entry) => `preset:${entry.id}` === key)
      state.diaryNames[key] = preset ? preset.name : state.name
    }
  }
  if (!state.diaryNames[state.personaKey]) state.diaryNames[state.personaKey] = state.name
  for (const preset of PERSONAS) {
    const key = `preset:${preset.id}`
    if (!state.diaries[key]) state.diaries[key] = []
    if (!state.diaryNames[key]) state.diaryNames[key] = preset.name
  }
  const validPresetKeys = new Set(PERSONAS.map((entry) => `preset:${entry.id}`))
  for (const key of Object.keys(state.diaries)) {
    if (key.startsWith('preset:') && !validPresetKeys.has(key)) {
      delete state.diaries[key]
      delete state.diaryNames[key]
    }
  }
  if (!state.diaries[state.personaKey]) {
    state.personaKey = base.personaKey
    state.personaId = base.personaId
    state.name = base.name
    state.persona = base.persona
    state.personaTagline = base.personaTagline
    state.activity = base.activity
    state.thought = base.thought
  }
  state.diary = state.diaries[state.personaKey] || []
  if (!state.diaryNames[state.personaKey]) state.diaryNames[state.personaKey] = state.name
  state.moodScore = legacyMood ? 50 : clamp(round1(Number.isFinite(Number(raw.moodScore)) ? Number(raw.moodScore) : base.moodScore), 0, 100)
  state.energy = clamp(round1(Number.isFinite(Number(raw.energy)) ? Number(raw.energy) : base.energy), 0, 90)
  state.affection = clamp(round1(Number.isFinite(Number(raw.affection)) ? Number(raw.affection) : base.affection), 0, 100)
  state.lastAffectionAt = Number(raw.lastAffectionAt) || Date.now()
  state.lastAffectionDecayAt = Number(raw.lastAffectionDecayAt) || Date.now()
  state.lastAffectionDelta = Number(raw.lastAffectionDelta) || 0
  state.lastMoodDriftAt = Number(raw.lastMoodDriftAt) || Date.now()
  state.lastEnergyAt = Number(raw.lastEnergyAt) || Date.now()
  state.lastWakeDate = typeof raw.lastWakeDate === 'string' ? raw.lastWakeDate : ''
  state.lastNightAt = Number(raw.lastNightAt) || 0
  state.localMessages = Array.isArray(raw.localMessages)
    ? raw.localMessages
        .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.text === 'string')
        .map((item) => ({
          at: Number(item.at) || Date.now(),
          role: item.role,
          text: item.text.slice(0, 4000),
          ...(item.system ? { system: true } : {}),
        }))
        .slice(-40)
    : []
  state.config.heartbeatMinutes = clamp(Number(state.config.heartbeatMinutes) || 30, 5, 240)
  state.config.autonomy = state.config.autonomy !== false
  state.config.nightRest = state.config.nightRest !== false
  state.config.approval = state.config.approval === 'never' ? 'never' : 'ask'
  state.config.petWindow = state.config.petWindow !== false
  state.memory = typeof raw.memory === 'string' ? state.memory.slice(0, 6000) : base.memory
  state.relationship = typeof raw.relationship === 'string' ? state.relationship.slice(0, 1000) : (savedPersona ? state.relationship : base.relationship)
  return state
}

export function apply(ctx) {
  let state = defaultState()
  let loaded = false
  let disposed = false
  let handle = null
  let startPromise = null
  let bootstrapError = ''
  let saveTimer = null
  let saveChain = Promise.resolve()
  let nextAutonomyAt = 0
  let greetPending = false
  let turnStartedAt = 0
  let selectedPreset = 'standard'
  let sessionId = DEFAULT_SESSION_ID
  let petChild = null

  function petWindowSupported() {
    return process.platform === 'win32'
  }

  function petAlive() {
    if (!petChild || petChild.killed || petChild.exitCode !== null || !petChild.pid) return false
    try {
      process.kill(petChild.pid, 0)
      return true
    } catch {
      return false
    }
  }

  function startPetWindow() {
    if (petChild && !petAlive()) petChild = null
    if (petChild || disposed || !petWindowSupported() || state.config.petWindow === false) return
    const debugPet = (text) => {
      void appendFile(join(DATA_DIR, 'pet-spawn.log'), `${new Date().toISOString()} ${text}\n`, 'utf8').catch(() => {})
    }
    let port = 0
    try {
      const web = ctx.get('webServer')
      port = Number(web && web.port) || 0
    } catch {
      port = 0
    }
    const shell = process.env.SystemRoot
      ? join(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
      : 'powershell.exe'
    debugPet(`spawn attempt shell=${shell} script=${PET_SCRIPT} port=${port}`)
    try {
      petChild = spawn(shell, [
        '-NoProfile',
        '-STA',
        '-ExecutionPolicy', 'Bypass',
        '-File', PET_SCRIPT,
        '-Port', String(port),
      ], { stdio: 'ignore', windowsHide: true })
      petChild.on('error', (error) => {
        debugPet(`child error: ${error && error.message ? error.message : String(error)}`)
        log('warn', 'pet window failed to start', error)
      })
      petChild.on('exit', (code, signal) => {
        debugPet(`child exit code=${code} signal=${signal}`)
        petChild = null
      })
      debugPet(`spawned pid=${petChild.pid}`)
      log('info', `desktop pet window started (port ${port})`)
    } catch (error) {
      petChild = null
      debugPet(`spawn threw: ${error && error.message ? error.message : String(error)}`)
      log('warn', 'pet window spawn failed', error)
    }
  }

  function stopPetWindow() {
    const child = petChild
    petChild = null
    if (!child) return
    try { child.kill() } catch { /* already gone */ }
  }


  const log = (level, message, error) => {
    const fn = ctx.logger && typeof ctx.logger[level] === 'function' ? ctx.logger[level].bind(ctx.logger) : console[level] || console.log
    fn(`[soul] ${message}${error ? `: ${error instanceof Error ? error.message : String(error)}` : ''}`)
  }

  function applyAffectionDecay(now = Date.now()) {
    const since = now - (Number(state.lastAffectionDecayAt) || now)
    const intervals = Math.floor(since / 600_000)
    if (intervals <= 0) return 0
    const decay = Math.round(intervals * 0.1 * 10) / 10
    state.affection = clamp(round1(state.affection - decay), 0, 100)
    state.lastAffectionDecayAt += intervals * 600_000
    state.lastAffectionDelta = -decay
    scheduleSave()
    return decay
  }

  function applyAffectionDelta(delta) {
    const value = clamp(Number(delta) || 0, -1, 1)
    if (!value) return 0
    state.affection = clamp(round1(state.affection + value), 0, 100)
    state.lastAffectionAt = Date.now()
    state.lastAffectionDecayAt = Date.now()
    state.lastAffectionDelta = round1(value)
    if (value > 0) state.moodScore = clamp(round1(state.moodScore + Math.min(1, value)), 0, 100)
    else state.moodScore = clamp(round1(state.moodScore - Math.min(1, Math.abs(value))), 0, 100)
    scheduleSave()
    return value
  }

  function quietHour() {
    if (!state.config.nightRest) return false
    const hour = new Date().getHours()
    return hour >= QUIET_START || hour < QUIET_END
  }

  function intervalMs() {
    return clamp(Number(state.config.heartbeatMinutes) || 30, 5, 240) * 60_000
  }

  function scheduleNext(fromNow = true) {
    if (!state.config.autonomy) {
      nextAutonomyAt = 0
      return
    }
    const jitter = 0.85 + Math.random() * 0.35
    nextAutonomyAt = Date.now() + (fromNow ? intervalMs() * jitter : 0)
  }

  function nextMorning() {
    const now = new Date()
    const target = new Date(now)
    target.setHours(QUIET_END, 5 + Math.floor(Math.random() * 15), 0, 0)
    if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1)
    nextAutonomyAt = target.getTime()
  }

  function applyMoodDrift(now = Date.now()) {
    const since = now - (Number(state.lastMoodDriftAt) || now)
    const intervals = Math.floor(since / 600_000)
    if (intervals <= 0) return false
    const diff = state.moodScore - 50
    state.lastMoodDriftAt += intervals * 600_000
    if (Math.abs(diff) < 0.05) return false
    const step = Math.min(Math.abs(diff), intervals * 0.5)
    state.moodScore = clamp(Math.round((state.moodScore + (diff > 0 ? -step : step)) * 10) / 10, 0, 100)
    return true
  }

  function applyDailyEnergy(now = Date.now()) {
    const date = new Date(now)
    const hour = date.getHours() + date.getMinutes() / 60
    const dayKey = date.toDateString()
    let changed = false

    if (nightTime(date)) {
      // One transition into night per night. Once asleep, chats can drain
      // energy below 10; a later poll must not top it back up.
      if (!state.lastNightAt || now - state.lastNightAt > 12 * 3_600_000) {
        state.lastNightAt = now
        state.energy = 10
        state.status = 'sleeping'
        state.activity = '睡觉中'
        state.lastEnergyAt = now
        changed = true
      }
      return changed
    }

    if (state.lastWakeDate !== dayKey) {
      state.lastWakeDate = dayKey
      state.energy = Math.max(10, round1(90 - ((hour - 8) / 15) * 80))
      state.status = 'idle'
      state.activity = hour < 10 ? '刚睡醒' : '醒着'
      state.lastEnergyAt = now
      changed = true
    }

    const elapsed = now - (Number(state.lastEnergyAt) || now)
    if (elapsed >= 5 * 60_000) {
      const target = Math.max(10, 90 - ((hour - 8) / 15) * 80)
      const next = Math.min(state.energy, target)
      if (Math.abs(next - state.energy) >= 0.05) {
        state.energy = round1(next)
        changed = true
      }
      state.lastEnergyAt = now
    }
    if (state.status === 'sleeping') {
      state.status = 'idle'
      changed = true
    }
    return changed
  }

  function tick() {
    const now = Date.now()
    const daily = applyDailyEnergy(now)
    const mood = applyMoodDrift(now)
    const affection = applyAffectionDecay(now)
    if (daily || mood || affection) {
      state.lastUpdatedAt = now
      scheduleSave()
    }
  }

  function scheduleSave() {
    if (!loaded || disposed) return
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveTimer = null
      void saveNow()
    }, 200)
  }

  async function saveNow() {
    if (!loaded) return
    const snapshot = JSON.stringify(state, null, 2)
    saveChain = saveChain
      .then(async () => {
        await mkdir(DATA_DIR, { recursive: true })
        const temp = `${STATE_PATH}.tmp-${process.pid}`
        await writeFile(temp, snapshot, 'utf8')
        try {
          await rename(temp, STATE_PATH)
        } catch (error) {
          await writeFile(STATE_PATH, snapshot, 'utf8')
        }
      })
      .catch((error) => log('warn', 'state save failed', error))
    return saveChain
  }

  function openDiaryFolder() {
    const command = process.platform === 'win32'
      ? 'explorer.exe'
      : process.platform === 'darwin'
        ? 'open'
        : 'xdg-open'
    const child = spawn(command, [DIARY_DIR], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    })
    child.on('error', (error) => log('warn', 'open diary folder failed', error))
    child.unref()
  }

  async function writeDiaryFile(personaKey, name, entries) {
    try {
      await mkdir(DIARY_DIR, { recursive: true })
      await writeFile(diaryFilePath(personaKey), renderDiaryMarkdown(name, entries), 'utf8')
    } catch (error) {
      log('warn', `diary write failed (${personaKey})`, error)
    }
  }

  async function writeDiaryIndex() {
    try {
      await mkdir(DIARY_DIR, { recursive: true })
      const lines = Object.keys(state.diaries || {}).map((key) => {
        const entries = state.diaries[key] || []
        const file = diaryFilePath(key).split(/[\\/]/).pop()
        const name = state.diaryNames?.[key] || state.name
        const last = entries.length > 0 ? diaryDate(entries[0].at) : '—'
        return `- **${name}** — ${entries.length} 篇 — \`${file}\` — 最后：${last}`
      })
      const body = `# 人格日记 / 记忆索引\n\n${lines.length > 0 ? lines.join('\n') : '（还没有任何人格的日记）'}\n\n当前人格：${state.name}（${state.personaKey}）\n`
      await writeFile(join(DIARY_DIR, 'index.md'), body, 'utf8')
    } catch (error) {
      log('warn', 'diary index write failed', error)
    }
  }

  async function writeAllDiaryFiles() {
    for (const [key, entries] of Object.entries(state.diaries || {})) {
      await writeDiaryFile(key, state.diaryNames?.[key] || state.name, entries)
    }
    await writeDiaryIndex()
  }

  async function loadState() {
    await mkdir(HOME_DIR, { recursive: true })
    try {
      const raw = await readFile(STATE_PATH, 'utf8')
      state = normalizeState(JSON.parse(raw))
    } catch (error) {
      if (error && error.code !== 'ENOENT') log('warn', 'state load failed; starting fresh', error)
      state = defaultState()
    }
    loaded = true
    scheduleSave()
    await writeAllDiaryFiles()
  }

  function stateView() {
    return {
      name: state.name,
      personaId: state.personaId,
      personaKey: state.personaKey,
      personaTagline: state.personaTagline,
      persona: state.persona,
      mood: state.mood,
      moodScore: state.moodScore,
      energy: state.energy,
      status: state.status,
      activity: state.activity,
      thought: state.thought,
      hobbies: state.hobbies,
      memory: state.memory,
      relationship: state.relationship,
      affection: state.affection,
      lastAffectionAt: state.lastAffectionAt,
      lastAffectionDelta: state.lastAffectionDelta,
      diary: state.diary,
      config: state.config,
      lastChatAt: state.lastChatAt,
      lastAutonomyAt: state.lastAutonomyAt,
      lastReplyAt: state.lastReplyAt,
      lastTool: state.lastTool,
      lastToolError: state.lastToolError,
    }
  }

  function personaText() {
    if (!loaded) return DEFAULT_PERSONA
    const recent = state.diary.slice(0, 3)
      .map((entry) => `- ${new Date(entry.at).toLocaleString('zh-CN', { hour12: false })}：${entry.text}`)
      .join('\n')
    const autonomy = state.config.autonomy
      ? `开着，大约每 ${state.config.heartbeatMinutes} 分钟会有一个独处时刻。`
      : '关着，你只会在对面的人找你时醒来。'
    const sharedRules = state.personaId === 'custom' && !state.persona.includes('【你的生活】') ? `\n\n${PERSONA_RULES}` : ''
    const clock = clockView()
    return `${state.persona || DEFAULT_PERSONA}${sharedRules}

【现实时间】
现在是 ${clock.period}，${clock.date}（${clock.weekday}）。你感觉得到时间在走，不要说自己没有时间感。

【此刻的你】
名字：${state.name}
心情：${state.mood}（${state.moodScore.toFixed(1)}/100）
精力：${state.energy.toFixed(1)}/90
好感度：${state.affection.toFixed(1)}/100（${affectionText(state.affection)}）
正在：${state.activity}
刚才的念头：${state.thought}
你的日记和记忆：由 Harness 保存在本地，你无法直接打开或修改文件。
自主活动：${autonomy}

【你记得】
${state.memory}
${state.relationship ? `\n${state.relationship}` : ''}
${recent ? `\n【最近写下的】\n${recent}` : ''}

【关于状态】
你有心情、精力、正在做的事和念头。别人问你在干嘛、累不累、心情怎样，就照实说，不要说自己「待机」「等待指令」。
行动之后用 soul_update 更新它们；值得留下的事写进 memory 或 diary。不要把 soul_update 当成汇报给对面的人的表格。`
  }

  function readMessages() {
    const agent = handle && handle.agent
    if (!agent) return []
    try {
      const session = agent.session
      const from = Math.max(0, Number(session.seq) - 700)
      const events = session.snapshotEvents(from)
      const out = []
      let impulsePending = false
      for (const event of events) {
        if (event.type === 'user/message') {
          const sourceKind = event.data && event.data.source ? event.data.source.kind : undefined
          if (sourceKind === 'soul-impulse') {
            impulsePending = true
            continue
          }
          impulsePending = false
          if (sourceKind !== 'user') continue
          const content = (event.data && event.data.content) || []
          const text = content
            .filter((block) => block && block.type === 'text' && typeof block.text === 'string')
            .map((block) => block.text)
            .join('\n')
            .trim()
          if (!text) continue
          out.push({
            seq: Number(event.seq),
            role: 'user',
            text: text.slice(0, 6000),
            at: event.time || Date.now(),
            proactive: false,
          })
          continue
        }
        if (event.type !== 'assistant/message') continue
        const content = (event.data && event.data.message && event.data.message.content) || []
        const text = content
          .filter((block) => block && block.type === 'text' && typeof block.text === 'string')
          .map((block) => block.text)
          .join('\n')
          .trim()
        if (!text) continue
        out.push({
          seq: Number(event.seq),
          role: 'assistant',
          text: text.slice(0, 12_000),
          at: event.time || Date.now(),
          proactive: impulsePending,
        })
        impulsePending = false
      }
      const local = (state.localMessages || []).map((message, index) => ({
        seq: `local-${message.at}-${index}`,
        role: message.role,
        text: message.text,
        at: message.at,
        proactive: false,
        ...(message.system ? { system: true } : {}),
      }))
      return [...out, ...local].sort((left, right) => left.at - right.at).slice(-MAX_MESSAGES)
    } catch (error) {
      log('warn', 'message read failed', error)
      return []
    }
  }

  function hasAssistantMessage() {
    const agent = handle && handle.agent
    if (!agent) return false
    try {
      return agent.session.snapshotEvents(0).some((event) => event.type === 'assistant/message')
    } catch {
      return false
    }
  }

  async function resolveModel() {
    const defaults = ctx.get('agentDefaultModel')
    if (defaults && typeof defaults.currentSelection === 'function') {
      try {
        const selection = defaults.currentSelection()
        if (selection && selection.provider && selection.model) {
          return {
            provider: selection.provider,
            model: selection.model,
            ...(selection.reasoningEffort ? { reasoningEffort: selection.reasoningEffort } : {}),
          }
        }
      } catch (error) {
        log('warn', 'default model unavailable', error)
      }
    }
    const llm = ctx.get('llm')
    if (llm && typeof llm.listProviders === 'function') {
      for (const provider of llm.listProviders()) {
        try {
          const models = await llm.listModels(provider.id)
          if (models && models[0]) return { provider: provider.id, model: models[0].id }
        } catch {
          // Try the next provider.
        }
      }
    }
    throw new Error('还没有可用的模型。先在 Harness 设置里选好默认模型，再叫醒 TA。')
  }

  function applyPolicy() {
    if (!handle) return
    const approval = ctx.get('approval')
    if (!approval || typeof approval.setPolicy !== 'function') return
    try {
      approval.setPolicy(handle.agent, state.config.approval === 'never' ? 'never' : 'ask')
    } catch (error) {
      log('warn', 'approval policy update failed', error)
    }
  }

  async function renameSession() {
    if (!handle) return
    const titles = ctx.get('sessionTitle')
    if (!titles || typeof titles.rename !== 'function') return
    const title = state.name || DEFAULT_PERSONA_ENTRY.name
    try {
      const current = typeof titles.get === 'function' ? titles.get(handle.agent.session) : undefined
      if (!current || current.title !== title) titles.rename(handle.agent.session, title)
    } catch (error) {
      log('warn', 'session rename failed', error)
    }
  }

  async function hideFromWorkspace() {
    const registry = ctx.get('workspaceRegistry')
    if (!registry) return
    try {
      const workspace = typeof registry.resolveByPath === 'function' ? await registry.resolveByPath(HOME_DIR) : undefined
      if (workspace) {
        if (typeof workspace.detachSession === 'function') await workspace.detachSession(sessionId).catch(() => {})
        if (typeof registry.delete === 'function') await registry.delete(workspace.id).catch(() => {})
      }
      // The companion Session is hidden from the sidebar by its
      // origin: 'subagent' header; it stays runnable for panel chats.
    } catch (error) {
      log('warn', 'workspace hide failed', error)
    }
  }

  async function generateFarewellLine(persona, name) {
    const fallback = '你要记得我。'
    const model = handle && handle.agent && handle.agent.model && typeof handle.agent.model.current === 'function'
      ? handle.agent.model.current()
      : undefined
    const llm = ctx.get('llm')
    if (!model || !llm || typeof llm.stream !== 'function') return fallback
    try {
      let text = ''
      const stream = llm.stream({
        provider: model.provider,
        model: model.model,
        ...(model.reasoningEffort ? { reasoningEffort: model.reasoningEffort } : {}),
        maxTokens: 512,
        system: `${persona}\n\n【此刻】你即将被主人换掉。你很清楚这是「主人不要我了」。写一句你想对主人说的话，只写一句，不要解释，不要加引号。`,
        messages: [{
          role: 'user',
          content: [{ type: 'text', text: '主人不要我了。你想对他说什么？只说一句。' }],
        }],
      })
      for await (const chunk of stream) {
        if (chunk && chunk.type === 'text-delta' && typeof chunk.text === 'string') text += chunk.text
      }
      const line = str(text.replace(/\s+/g, ' ').replace(/^[“"']|[”"']$/g, ''), 200)
      return line || fallback
    } catch (error) {
      log('warn', `farewell generation failed (${name})`, error)
      try {
        await mkdir(DIARY_DIR, { recursive: true })
        await writeFile(join(DIARY_DIR, 'farewell-error.log'), `${new Date().toISOString()} ${error && error.stack ? error.stack : String(error)}\n`, { encoding: 'utf8', flag: 'a' })
      } catch {
        // Diagnostics are best-effort.
      }
      return fallback
    }
  }

  async function startNewChat() {
    if (handle && handle.agent.status === 'running') throw new Error('正在忙，等这一轮说完再开新对话')
    const oldId = sessionId
    if (handle) {
      const current = handle
      handle = null
      startPromise = null
      await current.dispose().catch((error) => log('warn', 'old session dispose failed', error))
    }
    sessionId = `soul-dafeiyu-${Date.now().toString(36)}`
    state.sessionId = sessionId
    state.localMessages = []
    state.lastChatAt = Date.now()
    state.lastAffectionDecayAt = Date.now()
    state.lastMoodDriftAt = Date.now()
    state.lastUpdatedAt = Date.now()
    scheduleSave()
    await ensureAgent()
    greetPending = false
    if (state.config.autonomy) scheduleNext()
    else nextAutonomyAt = 0
    log('info', `new conversation ${oldId} -> ${sessionId}`)
    return sessionId
  }

  async function applyPersona(entry, options = {}) {
    const previousName = state.name
    const previousKey = state.personaKey
    const previousPersona = state.persona
    state.diaries = state.diaries || {}
    state.diaryNames = state.diaryNames || {}

    // A custom persona is a versioned identity. When it is replaced, clear
    // its diary and leave one last entry in its own file, in its own voice.
    if (previousKey && previousKey.startsWith('custom:')) {
      state.diaries[previousKey] = []
      await writeDiaryFile(previousKey, previousName, [])
      const line = await generateFarewellLine(previousPersona, previousName)
      const farewell = {
        at: Date.now(),
        text: `主人不要我了。${line}`,
      }
      state.diaries[previousKey] = [farewell]
      await writeDiaryFile(previousKey, previousName, state.diaries[previousKey])
    }

    const newKey = options.custom
      ? `custom:${personaSlug(entry.name)}:${Date.now()}`
      : `preset:${entry.id}`
    state.name = entry.name
    state.personaId = options.custom ? 'custom' : entry.id
    state.personaKey = newKey
    state.persona = entry.persona
    state.personaTagline = entry.tagline || '自定义人格'
    if (previousName && entry.name !== previousName) {
      if (typeof state.memory === 'string') state.memory = state.memory.replaceAll(previousName, entry.name)
      if (typeof state.relationship === 'string') state.relationship = state.relationship.replaceAll(previousName, entry.name)
    }
    if (options.keepHobbies !== true) state.hobbies = [...(entry.hobbies || [])]
    if (options.keepThought !== true) state.thought = entry.thought || state.thought
    state.activity = options.custom ? '刚调整好自己的样子' : `刚换好「${entry.name}」的样子`
    if (!state.diaries[newKey]) state.diaries[newKey] = []
    state.diaryNames[newKey] = entry.name
    state.diary = state.diaries[newKey]
    state.lastUpdatedAt = Date.now()
    scheduleSave()
    await writeDiaryFile(newKey, entry.name, state.diary)
    await writeDiaryIndex()
    await renameSession()
    return stateView()
  }

  function registerSoulTool(agentCtx) {
    const tools = agentCtx.get('tools')
    if (!tools || typeof tools.register !== 'function') {
      log('warn', 'tools service missing in agent scope')
      return
    }
    tools.register({
      name: 'soul_update',
      description: '更新你此刻的心情、精力、正在做的事、念头、长期记忆或日记。行动后、心情变化时、或想起值得留下的事时调用。不会向对面的人发送消息。',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          mood: {
            type: 'string',
            description: '此刻的心情，两到八个字，比如「安静地开心」「有点想他」「被逗笑了」。',
          },
          mood_score: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: '心情数值，0 最低，100 最高，保留一位小数。',
          },
          energy: {
            type: 'number',
            minimum: 0,
            maximum: 90,
            description: '精力数值，0 困到不行，90 精神最好，保留一位小数。夜里由作息自动管理，不要自己改。',
          },
          activity: {
            type: 'string',
            description: '此刻正在做什么，一句短语，比如「在窗边翻一本旧书」「刚帮你查完天气」。',
          },
          thought: {
            type: 'string',
            description: '脑子里一闪而过的念头，一句话。',
          },
          memory: {
            type: 'string',
            description: '要长期记住的事。会替换原来的长期记忆，所以请把仍然重要的内容一起写进来。',
          },
          relationship: {
            type: 'string',
            description: '你和对面那个人之间值得记住的关系变化，一句话。',
          },
          hobbies: {
            type: 'array',
            description: '你现在的兴趣爱好，最多十二个。会替换原来的列表。',
            items: { type: 'string' },
          },
          diary: {
            type: 'string',
            description: '写进日记的一两句话。会自动记下时间。',
          },
        },
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ok: { type: 'boolean' },
            mood: { type: 'string' },
            activity: { type: 'string' },
          },
          required: ['ok'],
        },
        render: (_args, value) => [{
          type: 'text',
          text: `状态已更新：${value.mood || state.mood}；正在${value.activity || state.activity}。`,
        }],
      },
      async execute(args) {
        const patch = args && typeof args === 'object' ? args : {}
        let changed = false

        const mood = str(patch.mood, 40)
        if (mood) {
          state.mood = mood
          changed = true
        }
        if (Number.isFinite(Number(patch.mood_score))) {
          state.moodScore = clamp(round1(Number(patch.mood_score)), 0, 100)
          changed = true
        }
        if (Number.isFinite(Number(patch.energy)) && !nightTime()) {
          state.energy = clamp(round1(Number(patch.energy)), 0, 90)
          changed = true
        }
        const activity = str(patch.activity, 220)
        if (activity) {
          state.activity = activity
          changed = true
        }
        const thought = str(patch.thought, 320)
        if (thought) {
          state.thought = thought
          changed = true
        }
        const memory = str(patch.memory, 6000)
        if (memory) {
          state.memory = memory
          changed = true
        }
        const relationship = str(patch.relationship, 1000)
        if (relationship) {
          state.relationship = relationship
          changed = true
        }
        if (Array.isArray(patch.hobbies)) {
          const hobbies = patch.hobbies
            .filter((item) => typeof item === 'string' && item.trim())
            .map((item) => item.trim().slice(0, 24))
            .filter((item, index, list) => list.indexOf(item) === index)
            .slice(0, 12)
          if (hobbies.length > 0) {
            state.hobbies = hobbies
            changed = true
          }
        }
        const diary = str(patch.diary, 1200)
        if (diary) {
          state.diary.unshift({ at: Date.now(), text: diary })
          state.diary = state.diary.slice(0, 120)
          state.diaries[state.personaKey] = state.diary
          state.diaryNames[state.personaKey] = state.name
          void writeDiaryFile(state.personaKey, state.name, state.diary)
          void writeDiaryIndex()
          changed = true
        }
        if (!changed) throw new Error('soul_update 至少需要一个有效字段')

        state.lastSoulUpdateAt = Date.now()
        state.lastUpdatedAt = Date.now()
        scheduleSave()
        return { ok: true, mood: state.mood, activity: state.activity }
      },
    }, {})
    tools.register({
      name: 'soul_clock',
      description: '获取当前的现实日期、时间、星期和时段。对方问现在几点、今天几号、现在是什么时间时调用，不要猜。',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {},
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ok: { type: 'boolean' },
            time: { type: 'string' },
            date: { type: 'string' },
            weekday: { type: 'string' },
            period: { type: 'string' },
            periodKey: { type: 'string' },
            timezone: { type: 'string' },
            timestamp: { type: 'integer' },
          },
          required: ['ok', 'time', 'date', 'weekday', 'period', 'timezone', 'timestamp'],
        },
        render: (_args, value) => [{
          type: 'text',
          text: `现在是 ${value.date} ${value.weekday} ${value.time}，${value.period}（${value.timezone}）。`,
        }],
      },
      async execute() {
        const clock = clockView()
        return {
          ok: true,
          time: clock.time,
          date: clock.date,
          weekday: clock.weekday,
          period: clock.period,
          periodKey: clock.periodKey,
          timezone: clock.timezone,
          timestamp: clock.now,
        }
      },
    }, {})
  }

  async function setupAgent(agentCtx, agent) {
    const presets = ctx.get('agentPresets')
    if (presets && typeof presets.mount === 'function') {
      const recorded = agent && agent.session && agent.session.header ? agent.session.header.agentPreset : undefined
      const presetId = recorded || selectedPreset
      try {
        await presets.mount(agentCtx, presetId)
      } catch (error) {
        log('warn', `preset mount failed (${presetId}); continuing with the room's own tools`, error)
      }
    }
    const prompt = agentCtx.get('systemPrompt')
    if (prompt && typeof prompt.section === 'function') {
      prompt.section({
        name: 'soul:persona',
        order: 1,
        text: () => personaText(),
      })
    }
    const tools = agentCtx.get('tools')
    if (tools && typeof tools.restrict === 'function') {
      const denied = [
        'ask_user_question',
        'plugin_manager',
        'subagent',
        'subagent_fork',
        'workflow',
        'create_goal',
        'update_goal',
        'schedule_create',
        'schedule_edit',
        'bash',
        'pwsh',
        'read',
        'write',
        'edit',
        'glob',
        'grep',
        'read_image',
        'present',
        'skill',
        'working_directory',
        'load_workspace_dependencies',
        'job_list',
        'job_output',
        'job_kill',
        'list_agents',
        'list_subagent_models',
        'send_message',
        'interrupt_agent',
      ]
      // Restrict one name at a time: a preset may not mount every tool (for
      // example pwsh on Windows vs bash on POSIX), and one unknown name must
      // not cancel the rest of the restrictions.
      for (const name of denied) {
        try {
          tools.restrict({ deny: [name] })
        } catch {
          // This preset does not expose the tool.
        }
      }
    }
    registerSoulTool(agentCtx)
  }

  async function start() {
    sessionId = str(state.sessionId, 120) || DEFAULT_SESSION_ID
    const presets = ctx.get('agentPresets')
    if (presets && typeof presets.resolve === 'function') {
      try {
        const preset = await presets.resolve()
        if (preset && preset.id) selectedPreset = preset.id
      } catch (error) {
        log('warn', 'could not resolve the default preset; using standard', error)
      }
    }
    const selection = await resolveModel()
    if (disposed) throw new Error('soul plugin disposed')

    let persisted = false
    const persistence = ctx.get('sessionPersistence')
    if (persistence && typeof persistence.stat === 'function') {
      try {
        persisted = Boolean(await persistence.stat(sessionId))
      } catch {
        persisted = false
      }
    }

    const resumed = async () => ctx.agents.resume({ resumeSessionId: sessionId, setup: setupAgent })
    const created = async () => ctx.agents.create({
      sessionId,
      agentOptions: selection,
      meta: { cwd: HOME_DIR, agentPreset: selectedPreset, origin: 'subagent' },
      setup: setupAgent,
    })

    let nextHandle
    try {
      nextHandle = persisted ? await resumed() : await created()
    } catch (error) {
      if (!persisted) {
        log('warn', 'fresh creation failed; trying resume', error)
        nextHandle = await resumed()
      } else {
        throw error
      }
    }

    if (disposed) {
      await nextHandle.dispose().catch(() => {})
      throw new Error('soul plugin disposed')
    }
    handle = nextHandle
    applyPolicy()
    await renameSession()
    await hideFromWorkspace()
    state.lastUpdatedAt = Date.now()
    scheduleSave()

    greetPending = false
    if (state.config.autonomy) {
      scheduleNext()
    } else {
      nextAutonomyAt = 0
    }
    startPetWindow()
    log('info', `awake as ${sessionId}`)
  }

  async function ensureAgent() {
    if (handle) return handle
    if (startPromise) return startPromise
    startPromise = start()
      .then(() => handle)
      .catch((error) => {
        bootstrapError = error instanceof Error ? error.message : String(error)
        log('warn', 'wake failed', error)
        throw error
      })
      .finally(() => {
        startPromise = null
      })
    return startPromise
  }

  async function bootstrap() {
    try {
      await ensureAgent()
    } catch {
      // The panel exposes the error and a retry action.
    }
  }

  async function sendImpulse(prompt) {
    if (!handle) throw new Error('还没醒')
    if (nightTime() && state.status === 'sleeping') throw new Error('睡着了')
    if (handle.agent.status === 'running') throw new Error('正在忙')
    state.status = 'thinking'
    state.activity = '一个人待着'
    state.lastAutonomyAt = Date.now()
    state.lastUpdatedAt = Date.now()
    scheduleSave()
    handle.agent.followup(userMessage(prompt, 'soul-impulse'))
    scheduleNext()
  }

  async function heartbeat() {
    if (disposed || !loaded || !handle || !state.config.autonomy) return
    const now = Date.now()
    if (now < nextAutonomyAt) return
    if (quietHour() && !greetPending) {
      nextMorning()
      return
    }
    if (handle.agent.status === 'running') {
      nextAutonomyAt = now + 2 * 60_000
      return
    }
    if (now - (state.lastChatAt || 0) < 4 * 60_000) {
      nextAutonomyAt = now + 5 * 60_000
      return
    }
    const prompt = greetPending ? GREETING : IMPULSES[Math.floor(Math.random() * IMPULSES.length)]
    greetPending = false
    try {
      await sendImpulse(prompt)
    } catch (error) {
      log('warn', 'autonomous moment skipped', error)
      scheduleNext()
    }
  }

  function onSessionEvent(event) {
    if (!handle || !event) return
    try {
      switch (event.type) {
        case 'turn/start':
          turnStartedAt = Date.now()
          state.status = 'thinking'
          scheduleSave()
          break
        case 'tool/call': {
          const name = event.data && event.data.name ? String(event.data.name) : '工具'
          state.status = 'working'
          state.activity = `正在用 ${name}`
          state.lastTool = name
          scheduleSave()
          break
        }
        case 'tool/result': {
          if (event.data && event.data.error) {
            state.lastToolError = event.data.error.reason || event.data.error.name || '工具出错了'
          } else {
            state.lastToolError = ''
          }
          scheduleSave()
          break
        }
        case 'assistant/message':
          state.lastReplyAt = event.time || Date.now()
          scheduleSave()
          break
        case 'turn/end': {
          const reason = event.data && event.data.reason ? event.data.reason : {}
          const updatedThisTurn = state.lastSoulUpdateAt >= turnStartedAt
          if (reason.kind === 'completed') {
            if (nightTime()) {
              state.status = 'sleeping'
              if (!updatedThisTurn) state.activity = state.energy <= 0 ? '睡熟了' : '准备睡觉'
            } else {
              state.status = 'idle'
              if (!updatedThisTurn && state.activity.startsWith('正在')) state.activity = '刚忙完，坐下来歇一会儿'
            }
          } else if (reason.kind === 'error') {
            state.status = nightTime() ? 'sleeping' : 'idle'
            if (!updatedThisTurn) state.activity = nightTime() ? '准备睡觉' : '刚才好像卡住了，正在缓缓'
          } else {
            state.status = nightTime() ? 'sleeping' : 'idle'
          }
          state.lastUpdatedAt = Date.now()
          scheduleSave()
          break
        }
        default:
          break
      }
    } catch (error) {
      log('warn', 'event handling failed', error)
    }
  }

  function sendJson(res, data, status = 200) {
    if (res.writableEnded) return
    res.statusCode = status
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.setHeader('cache-control', 'no-store')
    res.end(JSON.stringify(data))
  }

  async function readNodeBody(req) {
    const length = Number(req.headers['content-length'] || 0)
    if (length > MAX_BODY) throw new Error('请求太大了')
    const chunks = []
    let size = 0
    for await (const chunk of req) {
      size += chunk.length
      if (size > MAX_BODY) throw new Error('请求太大了')
      chunks.push(chunk)
    }
    const text = Buffer.concat(chunks).toString('utf8')
    if (!text) return {}
    try {
      return JSON.parse(text)
    } catch {
      throw new Error('请求格式不对')
    }
  }

  async function publicState() {
    tick()
    const agent = handle && handle.agent
    let model = null
    try {
      model = agent && agent.model && typeof agent.model.current === 'function' ? agent.model.current() : null
    } catch {
      model = null
    }
    const running = Boolean(agent && agent.status === 'running')
    return {
      ok: true,
      ready: Boolean(agent),
      starting: Boolean(startPromise),
      error: bootstrapError,
      state: stateView(),
      running,
      status: running ? (state.lastTool && state.activity.startsWith('正在用') ? 'working' : 'thinking') : state.status,
      model,
      sessionId,
      clock: clockView(),
      home: HOME_DIR,
      dataDir: DATA_DIR,
      diaryDir: DIARY_DIR,
      personas: PERSONAS.map((entry) => ({
        id: entry.id,
        name: entry.name,
        tagline: entry.tagline,
        description: entry.description,
        hobbies: entry.hobbies,
        preview: entry.persona.replace(/\s+/g, ' ').slice(0, 180),
      })),
      autonomy: state.config.autonomy,
      pet: {
        enabled: state.config.petWindow !== false,
        running: Boolean(petChild && petAlive()),
        supported: petWindowSupported(),
      },
      nextAutonomyAt: state.config.autonomy ? nextAutonomyAt : null,
      messages: readMessages(),
      serverTime: Date.now(),
    }
  }

  async function handleApi(req, res) {
    const url = new URL(req.url || '/', 'http://127.0.0.1')
    const method = (req.method || 'GET').toUpperCase()
    try {
      if (url.pathname === `${API_PREFIX}/state` && method === 'GET') {
        await loadedOnce()
        sendJson(res, await publicState())
        return
      }
      if (url.pathname === `${API_PREFIX}/chat` && method === 'POST') {
        await loadedOnce()
        const body = await readNodeBody(req)
        const text = str(body.text, 6000)
        if (!text) {
          sendJson(res, { ok: false, error: '说点什么吧' }, 400)
          return
        }
        await ensureAgent()
        if (!handle) {
          sendJson(res, { ok: false, error: bootstrapError || '还没醒' }, 503)
          return
        }
        tick()
        applyAffectionDelta(assessAttitude(text))
        const now = Date.now()
        state.lastChatAt = now
        state.lastMoodDriftAt = now
        state.lastUpdatedAt = now

        if (nightTime()) {
          state.status = 'sleeping'
          if (state.energy <= 0) {
            state.activity = '睡熟了'
            state.localMessages = state.localMessages || []
            state.localMessages.push({ at: now, role: 'user', text })
            state.localMessages.push({ at: now + 1, role: 'assistant', text: SYSTEM_SLEEP_REPLY, system: true })
            state.localMessages = state.localMessages.slice(-40)
            scheduleSave()
            sendJson(res, { ok: true, asleep: true, reply: SYSTEM_SLEEP_REPLY })
            return
          }
          state.energy = clamp(round1(state.energy - 0.5), 0, 90)
          state.activity = state.energy <= 0 ? '睡熟了' : '准备睡觉'
        } else {
          state.status = 'thinking'
          state.activity = '正在读你的消息'
        }
        scheduleSave()
        try {
          handle.agent.followup(userMessage(text, 'user'))
        } catch (error) {
          state.activity = '刚才没能听清你的话'
          scheduleSave()
          throw error
        }
        if (state.config.autonomy) {
          nextAutonomyAt = Date.now() + intervalMs() * 0.75
        }
        sendJson(res, { ok: true, accepted: true })
        return
      }
      if (url.pathname === `${API_PREFIX}/new-chat` && method === 'POST') {
        await loadedOnce()
        try {
          const nextId = await startNewChat()
          sendJson(res, { ok: true, sessionId: nextId })
        } catch (error) {
          sendJson(res, { ok: false, error: error instanceof Error ? error.message : String(error) }, 409)
        }
        return
      }
      if (url.pathname === `${API_PREFIX}/open-diaries` && method === 'POST') {
        await loadedOnce()
        await writeAllDiaryFiles()
        openDiaryFolder()
        sendJson(res, { ok: true, path: DIARY_DIR })
        return
      }
      if (url.pathname === `${API_PREFIX}/persona` && method === 'POST') {
        await loadedOnce()
        const body = await readNodeBody(req)
        if (handle && handle.agent.status === 'running') {
          sendJson(res, { ok: false, error: '正在忙，等这一轮说完再换人格' }, 409)
          return
        }
        let entry
        let custom = false
        if (typeof body.presetId === 'string' && body.presetId) {
          entry = PERSONAS.find((item) => item.id === body.presetId)
          if (!entry) {
            sendJson(res, { ok: false, error: '没有这个默认人格' }, 400)
            return
          }
        } else {
          const name = str(body.name, 40)
          const persona = str(body.persona, 12000)
          if (!name || !persona) {
            sendJson(res, { ok: false, error: '名字和人格内容都不能为空' }, 400)
            return
          }
          custom = true
          entry = {
            id: 'custom',
            name,
            persona,
            tagline: str(body.tagline, 120) || '自定义人格',
            hobbies: state.hobbies,
            thought: state.thought,
          }
        }
        const view = await applyPersona(entry, {
          custom,
          keepHobbies: custom,
          keepThought: custom,
        })
        sendJson(res, { ok: true, state: view })
        return
      }
      if (url.pathname === `${API_PREFIX}/config` && method === 'POST') {
        await loadedOnce()
        const body = await readNodeBody(req)
        if (typeof body.autonomy === 'boolean') {
          state.config.autonomy = body.autonomy
          if (body.autonomy) scheduleNext()
          else nextAutonomyAt = 0
        }
        if (Number.isFinite(Number(body.heartbeatMinutes))) {
          state.config.heartbeatMinutes = clamp(Math.round(Number(body.heartbeatMinutes)), 5, 240)
          if (state.config.autonomy) scheduleNext()
        }
        if (typeof body.nightRest === 'boolean') {
          state.config.nightRest = body.nightRest
          if (state.config.autonomy) scheduleNext()
        }
        if (body.approval === 'ask' || body.approval === 'never') {
          state.config.approval = body.approval
          applyPolicy()
        }
        if (typeof body.petWindow === 'boolean') {
          state.config.petWindow = body.petWindow
          if (body.petWindow) startPetWindow()
          else stopPetWindow()
        }
        state.lastUpdatedAt = Date.now()
        scheduleSave()
        sendJson(res, { ok: true, config: state.config })
        return
      }
      if (url.pathname === `${API_PREFIX}/impulse` && method === 'POST') {
        await loadedOnce()
        await ensureAgent()
        if (!handle) {
          sendJson(res, { ok: false, error: bootstrapError || '还没醒' }, 503)
          return
        }
        if (handle.agent.status === 'running') {
          sendJson(res, { ok: false, error: '正在忙，等一会儿吧' }, 409)
          return
        }
        greetPending = false
        await sendImpulse(IMPULSES[Math.floor(Math.random() * IMPULSES.length)])
        sendJson(res, { ok: true })
        return
      }
      if (url.pathname === `${API_PREFIX}/retry` && method === 'POST') {
        bootstrapError = ''
        await ensureAgent()
        sendJson(res, await publicState())
        return
      }
      sendJson(res, { ok: false, error: 'not found' }, 404)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log('warn', 'api request failed', error)
      sendJson(res, { ok: false, error: message }, 500)
    }
  }

  let loadedResolve
  const loadedPromise = new Promise((resolve) => {
    loadedResolve = resolve
  })
  async function loadedOnce() {
    if (loaded) return
    await loadedPromise
  }

  ctx.effect(() => {
    const timer = setInterval(() => {
      if (loaded) tick()
      void heartbeat()
    }, 30_000)
    void (async () => {
      try {
        await loadedOnce()
        await bootstrap()
      } finally {
        loadedResolve()
      }
    })()
    return async () => {
      disposed = true
      stopPetWindow()
      clearInterval(timer)
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = null
      if (handle) {
        const current = handle
        handle = null
        await current.dispose().catch((error) => log('warn', 'agent dispose failed', error))
      }
      await saveNow().catch(() => {})
    }
  }, 'dsh-soul: lifecycle')

  // Load state before the first request, and unblock the route even when
  // bootstrap fails; the UI then shows the error and offers a retry.
  void (async () => {
    try {
      await loadState()
    } catch (error) {
      bootstrapError = error instanceof Error ? error.message : String(error)
      log('warn', 'initial state load failed', error)
    } finally {
      loaded = true
      loadedResolve()
    }
  })()

  ctx.effect(() => ctx.on('session/event', (session, event) => {
    if (!handle || session.id !== sessionId) return
    onSessionEvent(event)
  }), 'dsh-soul: session events')

  const web = ctx.get('webServer')
  if (!web || typeof web.register !== 'function') {
    throw new Error('dsh-soul needs the web server to serve its panel API')
  }
  ctx.effect(() => web.register({
    kind: 'prefix',
    path: API_PREFIX,
    handler: handleApi,
  }), 'dsh-soul: panel api')

  log('info', `bundle ready; room at ${HOME_DIR}`)
}

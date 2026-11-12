window.__ModuleLoader__.load({
  id: 'dsh-soul',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'soul'

    const zh = {
      open: '打开',
      close: '关闭',
      title: '大肥鱼',
      subtitle: '一条住在 Harness 里的鱼',
      mood: '心情',
      energy: '精力',
      energySleeping: '睡觉中',
      energyExhausted: '很困',
      energyTired: '有点累',
      energyOkay: '还行',
      energyEnergetic: '精神',
      affection: '好感度',
      affectionDistant: '有点疏远',
      affectionWary: '还在观察',
      affectionFamiliar: '有点熟了',
      affectionClose: '亲近',
      affectionBonded: '很黏你',
      lastChat: '上次说话',
      periodLateNight: '深夜',
      periodMorning: '清晨',
      periodForenoon: '上午',
      periodNoon: '中午',
      periodAfternoon: '下午',
      periodEvening: '晚上',
      periodNight: '夜里',
      thought: '此刻的念头',
      activity: '正在做什么',
      hobbies: '喜欢',
      chat: '聊天',
      diary: '日记',
      settings: '设置',
      back: '返回',
      placeholder: '跟TA说点什么…',
      send: '发送',
      emptyChat: 'TA还没开口。说句话，或者等TA一会儿。',
      emptyDiary: '还没有日记。等TA独处的时候，也许会写。',
      connecting: '正在叫醒TA…',
      sleeping: 'TA还没醒',
      unavailable: '连不上TA的小房间',
      retry: '再试一次',
      statusThinking: '正在想',
      statusWorking: '正在忙',
      statusIdle: '安静地待着',
      statusResting: '在休息',
      statusSleeping: '睡觉中',
      statusTool: '正在用',
      proactive: '主动',
      systemReply: '系统代回',
      memory: 'TA记得',
      memoryEmpty: 'TA还没有写下长期记忆。',
      entries: '篇',
      autonomy: '自主活动',
      autonomyHint: '你不在的时候，也让TA有自己的生活。',
      desktopPet: '桌宠窗口',
      desktopPetHint: '把 TA 放到桌面上：单独置顶的小窗口，不跟着 DSH 窗口走。',
      interval: '独处间隔',
      minutes: '分钟',
      hours: '小时',
      nightRest: '夜里休息',
      nightRestHint: '23:00 到 08:00 之间不主动打扰，精力会慢慢恢复。',
      approval: '工具审批',
      approvalAsk: '每次询问',
      approvalNever: '不询问',
      approvalHint: '公开版默认每次询问。选「不询问」后工具会直接执行，更自主，但风险更高。',
      impulse: '现在给TA一个独处时刻',
      impulseHint: '不用等计时器，让TA去做点自己想做的事。',
      impulseSent: '已经去了。等TA自己回来。',
      openSession: '打开TA的完整会话',
      openSessionHint: '看TA的工具调用、完整历史和每一步。',
      model: '模型',
      session: '会话',
      room: '小房间',
      data: '数据',
      diaryDir: '日记目录',
      settingsNote: 'TA 只能聊天、看网页、记录自己的状态；不能运行命令、读写本地文件或控制电脑。',
      persona: '人格',
      personaHint: '换一种性格、说话方式和喜欢的东西。日记和长期记忆会保留。',
      personaPreset: '默认人格',
      personaCustom: '自定义人格',
      personaName: '名字',
      personaTagline: '一句话介绍',
      personaText: '人格设定',
      personaApply: '应用这个人格',
      personaApplied: '人格已换好',
      personaKeep: '换人格不会清空日记和长期记忆，只会改变名字、说话方式和兴趣。',
      personaCurrent: '当前人格',
      personaCustomHint: '写清楚 TA 是谁、怎么说话、和你的关系。写得越具体，越像真人。',
      personaEmpty: '名字和人格内容都不能为空。',
      personaBusy: '正在忙，等这一轮说完再换。',
      openDiaries: '打开日记文件夹',
      openDiariesHint: '里面按人格分别保存日记/记忆，打开后可以直接看或备份。',
      diaryOpened: '已打开日记文件夹',
      newChat: '新对话',
      newChatConfirm: '开始新对话？聊天记录会清空，但日记、心情、精力和好感度会保留。',
      newChatting: '新建中…',
      newChatDone: '新对话开始了',
      nextAutonomy: '下次独处',
      paused: '暂停中',
      nextIn: '还有',
      soon: '马上',
      justNow: '刚刚',
      minutesAgo: '分钟前',
      hoursAgo: '小时前',
      daysAgo: '天前',
      unknown: '未知',
      wake: '叫醒TA',
      reload: '刷新',
      about: '关于',
      aboutText: '一个有连续记忆、自己的房间和一点点脾气的 AI 生命。TA 会记得你，也会自己找事做。',
      today: '今天',
      earlier: '更早',
      settingsSaved: '已保存',
      thinkingNow: 'TA正在想…',
      herRoom: 'TA的小屋',
      noModel: '还没有可用模型',
    }

    const en = {
      open: 'Open',
      close: 'Close',
      title: 'Dafeiyu',
      subtitle: 'A fish who lives inside Harness',
      mood: 'Mood',
      energy: 'Energy',
      energySleeping: 'Sleeping',
      energyExhausted: 'Exhausted',
      energyTired: 'Tired',
      energyOkay: 'Okay',
      energyEnergetic: 'Energetic',
      affection: 'Bond',
      affectionDistant: 'A little distant',
      affectionWary: 'Still watching',
      affectionFamiliar: 'Getting familiar',
      affectionClose: 'Close',
      affectionBonded: 'Very attached',
      lastChat: 'Last talked',
      periodLateNight: 'late night',
      periodMorning: 'early morning',
      periodForenoon: 'morning',
      periodNoon: 'noon',
      periodAfternoon: 'afternoon',
      periodEvening: 'evening',
      periodNight: 'night',
      thought: 'Right now she is thinking',
      activity: 'Doing',
      hobbies: 'Likes',
      chat: 'Chat',
      diary: 'Diary',
      settings: 'Settings',
      back: 'Back',
      placeholder: 'Say something to her…',
      send: 'Send',
      emptyChat: 'TA has not spoken yet. Say something, or wait a little.',
      emptyDiary: 'No diary yet. TA may write one when alone.',
      connecting: 'Waking TA up…',
      sleeping: 'TA is still asleep',
      unavailable: 'Cannot reach TA’s room',
      retry: 'Try again',
      statusThinking: 'Thinking',
      statusWorking: 'Busy',
      statusIdle: 'Quietly around',
      statusResting: 'Resting',
      statusSleeping: 'Sleeping',
      statusTool: 'Using',
      proactive: 'on her own',
      systemReply: 'system reply',
      memory: 'TA remembers',
      memoryEmpty: 'TA has not written a long-term memory yet.',
      entries: 'entries',
      autonomy: 'Autonomous moments',
      autonomyHint: 'Let TA have a life when you are not around.',
      desktopPet: 'Desktop pet',
      desktopPetHint: 'Float TA on the desktop in its own always-on-top window, independent of DSH.',
      interval: 'Interval',
      minutes: 'min',
      hours: 'h',
      nightRest: 'Rest at night',
      nightRestHint: 'No interruptions between 23:00 and 08:00; her energy recovers.',
      approval: 'Tool approval',
      approvalAsk: 'Ask first',
      approvalNever: 'Never ask',
      approvalHint: 'The public default is Ask first. Never ask lets tools run directly: more autonomous, but riskier.',
      impulse: 'Give her a moment alone now',
      impulseHint: 'Skip the timer and let her do something she wants.',
      impulseSent: 'She went off to do her own thing.',
      openSession: 'Open her full session',
      openSessionHint: 'See her tool calls, full history, and every step.',
      model: 'Model',
      session: 'Session',
      room: 'Room',
      data: 'Data',
      diaryDir: 'Diary',
      settingsNote: 'TA can chat, read the web, and record TA’s own state. TA cannot run commands, read or write local files, or control the computer.',
      persona: 'Persona',
      personaHint: 'Change the personality, voice, and interests. The diary and long-term memories stay.',
      personaPreset: 'Default persona',
      personaCustom: 'Custom persona',
      personaName: 'Name',
      personaTagline: 'One-line intro',
      personaText: 'Persona prompt',
      personaApply: 'Apply this persona',
      personaApplied: 'Persona updated',
      personaKeep: 'Changing persona keeps the diary and long-term memories; only the name, voice, and interests change.',
      personaCurrent: 'Current persona',
      personaCustomHint: 'Describe who they are, how they speak, and their relationship with you. More detail makes it feel more real.',
      personaEmpty: 'Name and persona text cannot be empty.',
      personaBusy: 'Busy; wait until this turn finishes.',
      openDiaries: 'Open diary folder',
      openDiariesHint: 'Each persona keeps a separate diary/memory file here. Open it to read or back up.',
      diaryOpened: 'Diary folder opened',
      newChat: 'New chat',
      newChatConfirm: 'Start a new chat? The conversation will clear, but the diary, mood, energy, and bond are kept.',
      newChatting: 'Starting…',
      newChatDone: 'New chat started',
      nextAutonomy: 'Next moment',
      paused: 'Paused',
      nextIn: 'in',
      soon: 'soon',
      justNow: 'just now',
      minutesAgo: 'min ago',
      hoursAgo: 'h ago',
      daysAgo: 'd ago',
      unknown: 'unknown',
      wake: 'Wake her',
      reload: 'Refresh',
      about: 'About',
      aboutText: 'An AI girl with continuous memory, a room of her own, and a little bit of temper. She remembers you, and she finds things to do.',
      today: 'Today',
      earlier: 'Earlier',
      settingsSaved: 'Saved',
      thinkingNow: 'She is thinking…',
      herRoom: 'Her room',
      noModel: 'No model available',
    }

    const CSS = `
.soul-layer{position:fixed;inset:0;z-index:60;pointer-events:none;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif);}
.soul-orb-button{position:absolute;right:22px;bottom:22px;width:64px;height:64px;padding:0;border:0;border-radius:50%;background:transparent;pointer-events:auto;cursor:pointer;display:grid;place-items:center;filter:drop-shadow(0 14px 28px rgba(0,0,0,.28));transition:transform .18s ease;}
.soul-orb-button:hover{transform:translateY(-2px) scale(1.03);}
.soul-orb-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:4px;}
.soul-orb-wrap{position:relative;display:grid;place-items:center;animation:soul-float 5.5s ease-in-out infinite;}
.soul-orb-button .soul-unread{position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);font-size:10px;font-weight:700;display:grid;place-items:center;border:2px solid var(--dsw-alias-bg-overlay);}
.soul-panel{position:absolute;right:20px;bottom:20px;width:440px;height:min(700px,calc(100vh - 40px));max-height:calc(100vh - 40px);display:flex;flex-direction:column;overflow:hidden;pointer-events:auto;border:1px solid var(--dsw-alias-border-l1);border-radius:22px;background:var(--dsw-alias-bg-overlay);box-shadow:0 28px 90px rgba(0,0,0,.32),0 2px 8px rgba(0,0,0,.14);backdrop-filter:blur(18px);}
.soul-panel:focus{outline:none;}
.soul-header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 14px 12px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-bg-layer-1) 72%,transparent),transparent);}
.soul-header-id{display:flex;align-items:center;gap:10px;min-width:0;}
.soul-header-text{min-width:0;}
.soul-name{font-size:15px;font-weight:650;letter-spacing:.01em;line-height:1.25;}
.soul-sub{display:flex;align-items:center;gap:6px;margin-top:2px;font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.soul-header-actions{display:flex;align-items:center;gap:4px;}
.soul-iconbtn{width:30px;height:30px;padding:0;border:0;border-radius:9px;background:transparent;color:var(--dsw-alias-label-secondary);display:grid;place-items:center;cursor:pointer;transition:background .15s ease,color .15s ease;}
.soul-iconbtn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}
.soul-iconbtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;}
.soul-body{display:flex;flex-direction:column;min-height:0;flex:1;}
.soul-scroll{overflow-y:auto;min-height:0;flex:1;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent;}
.soul-scroll::-webkit-scrollbar{width:8px;}
.soul-scroll::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:8px;border:2px solid transparent;background-clip:content-box;}
.soul-vitals{padding:14px 18px 0;}
.soul-vital{display:flex;align-items:center;gap:8px;margin-bottom:9px;min-width:0;}
.soul-vital-label{width:36px;flex:none;font-size:11px;color:var(--dsw-alias-label-secondary);}
.soul-vital-value{min-width:56px;max-width:120px;flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:600;}
.soul-vital-bar{flex:1 1 60px;min-width:48px;height:6px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);overflow:hidden;}
.soul-vital-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--soul-a),var(--soul-b));transition:width .5s ease;}
.soul-vital-fill.energy{background:linear-gradient(90deg,var(--dsw-alias-state-success-primary),color-mix(in srgb,var(--dsw-alias-state-success-primary) 55%,var(--soul-a)));}
.soul-vital-fill.affection{background:linear-gradient(90deg,#ff9fc2,#ff4d78);}
.soul-vital-num{width:48px;flex:0 0 48px;text-align:right;font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:visible;}
.soul-thought{margin:3px 16px 0;padding:9px 12px;border-left:2px solid var(--soul-a);border-radius:0 10px 10px 0;background:color-mix(in srgb,var(--soul-a) 7%,transparent);font-size:12px;line-height:1.6;color:var(--dsw-alias-label-primary);}
.soul-thought:before{content:'“';color:var(--soul-a);font-weight:700;margin-right:1px;}
.soul-thought:after{content:'”';color:var(--soul-a);font-weight:700;margin-left:1px;}
.soul-activity{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding:13px 16px 10px;}
.soul-eyebrow{display:block;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--dsw-alias-label-secondary);margin-bottom:3px;}
.soul-activity-main{font-size:12.5px;line-height:1.5;}
.soul-activity-time{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary);white-space:nowrap;padding-bottom:2px;}
.soul-clockline{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 16px 10px;font-size:10.5px;color:var(--dsw-alias-label-secondary);}
.soul-clock{display:flex;align-items:center;gap:5px;min-width:0;}
.soul-clock svg{flex:none;opacity:.8;}
.soul-clock-date{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.soul-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 12px;}
.soul-chip{font-size:10.5px;line-height:1;padding:6px 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 40%,transparent);}
.soul-tabs{display:flex;align-items:center;gap:2px;padding:0 12px;border-bottom:1px solid var(--dsw-alias-border-l1);}
.soul-tab{position:relative;padding:9px 10px 10px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:600;cursor:pointer;border-radius:8px 8px 0 0;}
.soul-tab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);}
.soul-tab.active{color:var(--dsw-alias-label-primary);}
.soul-tab.active:after{content:'';position:absolute;left:9px;right:9px;bottom:-1px;height:2px;border-radius:2px 2px 0 0;background:var(--soul-a);}
.soul-tab-count{margin-left:5px;font-size:10px;color:var(--dsw-alias-label-secondary);font-weight:500;}
.soul-newchat{margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--dsw-alias-label-secondary);}
.soul-newchat:hover:not(:disabled){color:var(--dsw-alias-label-primary);}
.soul-newchat:disabled{opacity:.5;cursor:default;}
.soul-chat{display:flex;flex-direction:column;min-height:0;flex:1;}
.soul-messages{flex:1;overflow-y:auto;padding:14px 16px 8px;display:flex;flex-direction:column;gap:12px;min-height:0;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent;}
.soul-messages::-webkit-scrollbar{width:8px;}
.soul-messages::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:8px;border:2px solid transparent;background-clip:content-box;}
.soul-row{display:flex;gap:7px;align-items:flex-end;max-width:100%;}
.soul-row.user{justify-content:flex-end;}
.soul-row.assistant{justify-content:flex-start;}
.soul-bubble{max-width:82%;padding:8px 11px;border-radius:14px;font-size:12.8px;line-height:1.68;white-space:pre-wrap;overflow-wrap:anywhere;}
.soul-row.user .soul-bubble{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-bottom-right-radius:5px;}
.soul-row.assistant .soul-bubble{background:color-mix(in srgb,var(--soul-a) 6%,transparent);border:1px solid color-mix(in srgb,var(--soul-a) 24%,var(--dsw-alias-border-l1));border-bottom-left-radius:5px;}
.soul-row.system .soul-bubble{background:var(--dsw-alias-bg-layer-1);border-style:dashed;color:var(--dsw-alias-label-secondary);font-size:12px;}
.soul-row.system .soul-mini-orb{opacity:.55;}
.soul-bubble-meta{display:flex;align-items:center;gap:6px;margin-top:4px;font-size:9.5px;color:var(--dsw-alias-label-secondary);}
.soul-proactive{font-size:9px;line-height:1;padding:3px 5px;border-radius:5px;border:1px solid color-mix(in srgb,var(--soul-a) 35%,transparent);color:var(--soul-a);background:color-mix(in srgb,var(--soul-a) 8%,transparent);}
.soul-mini-orb{flex:none;width:24px;height:24px;display:grid;place-items:center;filter:drop-shadow(0 3px 6px rgba(0,0,0,.16));}
.soul-typing{display:flex;align-items:center;gap:8px;padding:2px 0;color:var(--dsw-alias-label-secondary);font-size:11.5px;}
.soul-dots{display:inline-flex;gap:3px;align-items:center;}
.soul-dots i{width:4px;height:4px;border-radius:50%;background:var(--soul-a);animation:soul-typing 1.2s infinite ease-in-out;}
.soul-dots i:nth-child(2){animation-delay:.15s;}
.soul-dots i:nth-child(3){animation-delay:.3s;}
.soul-empty{padding:26px 20px;text-align:center;font-size:12px;line-height:1.7;color:var(--dsw-alias-label-secondary);}
.soul-composer{display:flex;align-items:flex-end;gap:8px;padding:10px 12px 12px;border-top:1px solid var(--dsw-alias-border-l1);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 55%,transparent);}
.soul-input{flex:1;min-height:38px;max-height:108px;resize:none;border:1px solid var(--dsw-alias-border-l1);border-radius:13px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);padding:9px 11px;font:inherit;font-size:12.8px;line-height:1.5;outline:none;transition:border-color .15s ease,box-shadow .15s ease;}
.soul-input::placeholder{color:var(--dsw-alias-label-secondary);}
.soul-input:focus{border-color:var(--soul-a);box-shadow:0 0 0 3px color-mix(in srgb,var(--soul-a) 13%,transparent);}
.soul-send{flex:none;width:36px;height:36px;border:0;border-radius:12px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);display:grid;place-items:center;cursor:pointer;transition:transform .15s ease,opacity .15s ease;}
.soul-send:hover:not(:disabled){transform:translateY(-1px);}
.soul-send:disabled{opacity:.35;cursor:default;}
.soul-notice{margin:0 12px 10px;padding:8px 10px;border-radius:10px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);font-size:11px;line-height:1.5;color:var(--dsw-alias-label-secondary);}
.soul-error{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 40%,var(--dsw-alias-border-l1));color:var(--dsw-alias-state-error-primary);}
.soul-diary-wrap{padding:14px 16px 20px;display:flex;flex-direction:column;gap:14px;}
.soul-memory-card{padding:11px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 70%,transparent);}
.soul-memory-card .soul-eyebrow{margin-bottom:5px;}
.soul-memory-card p{margin:0;font-size:12px;line-height:1.65;color:var(--dsw-alias-label-primary);white-space:pre-wrap;}
.soul-diary-entry{position:relative;padding:0 0 0 14px;border-left:1px solid var(--dsw-alias-border-l1);}
.soul-diary-entry:before{content:'';position:absolute;left:-3.5px;top:5px;width:6px;height:6px;border-radius:50%;background:var(--soul-a);}
.soul-diary-time{font-size:9.5px;color:var(--dsw-alias-label-secondary);margin-bottom:4px;font-variant-numeric:tabular-nums;}
.soul-diary-text{font-size:12.2px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere;}
.soul-settings-wrap{padding:14px 16px 20px;display:flex;flex-direction:column;gap:10px;}
.soul-persona-card{padding:12px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 65%,transparent);}
.soul-persona-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.soul-persona-name{font-size:13px;font-weight:650;}
.soul-persona-tag{margin-top:3px;font-size:10.5px;color:var(--dsw-alias-label-secondary);line-height:1.45;}
.soul-persona-preview{margin-top:9px;padding:8px 9px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);font-size:10.5px;line-height:1.55;color:var(--dsw-alias-label-secondary);max-height:72px;overflow:hidden;}
.soul-persona-select{width:100%;margin-top:9px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:8px 9px;outline:none;}
.soul-field{display:flex;flex-direction:column;gap:5px;margin-top:9px;}
.soul-field label{font-size:10.5px;color:var(--dsw-alias-label-secondary);}
.soul-field input,.soul-field textarea{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:1.55;padding:8px 9px;outline:none;}
.soul-field input:focus,.soul-field textarea:focus{border-color:var(--soul-a);box-shadow:0 0 0 3px color-mix(in srgb,var(--soul-a) 12%,transparent);}
.soul-field textarea{min-height:124px;max-height:240px;resize:vertical;}
.soul-persona-hint{margin-top:6px;font-size:10px;line-height:1.5;color:var(--dsw-alias-label-secondary);}
.soul-persona-actions{display:flex;gap:8px;margin-top:9px;}
.soul-persona-actions .soul-button{flex:1;}
.soul-setting{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 65%,transparent);}
.soul-setting-copy{min-width:0;}
.soul-setting-title{font-size:12.5px;font-weight:600;}
.soul-setting-hint{margin-top:3px;font-size:10.5px;line-height:1.5;color:var(--dsw-alias-label-secondary);}
.soul-switch{flex:none;width:38px;height:22px;padding:2px;border:0;border-radius:999px;background:var(--dsw-alias-bg-layer-2);cursor:pointer;transition:background .18s ease;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1);}
.soul-switch span{display:block;width:18px;height:18px;border-radius:50%;background:var(--dsw-alias-label-secondary);transition:transform .18s ease,background .18s ease;}
.soul-switch.on{background:color-mix(in srgb,var(--soul-a) 55%,var(--dsw-alias-bg-layer-2));}
.soul-switch.on span{transform:translateX(16px);background:var(--dsw-alias-bg-base);}
.soul-select-wrap{display:flex;align-items:center;gap:8px;}
.soul-select{border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:11.5px;padding:6px 8px;outline:none;}
.soul-button{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:11px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s ease,border-color .15s ease;}
.soul-button:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2);}
.soul-button.primary{border-color:color-mix(in srgb,var(--soul-a) 45%,var(--dsw-alias-border-l1));background:color-mix(in srgb,var(--soul-a) 12%,var(--dsw-alias-bg-layer-1));}
.soul-kv{display:grid;grid-template-columns:58px 1fr;gap:5px 10px;padding:2px 2px 4px;font-size:10.5px;line-height:1.5;}
.soul-kv dt{color:var(--dsw-alias-label-secondary);}
.soul-kv dd{margin:0;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;}
.soul-note{font-size:10.5px;line-height:1.6;color:var(--dsw-alias-label-secondary);margin:2px 2px 0;}
.soul-connecting{display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:28px 24px;text-align:center;}
.soul-connecting-title{font-size:13px;font-weight:600;}
.soul-connecting-text{font-size:11.5px;line-height:1.65;color:var(--dsw-alias-label-secondary);max-width:280px;}
.soul-connecting .soul-button{width:auto;min-width:120px;}
.soul-orb-live{animation:soul-pulse 2.6s ease-in-out infinite;}
@keyframes soul-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes soul-pulse{0%,100%{filter:drop-shadow(0 0 0 color-mix(in srgb,var(--soul-a) 0%,transparent))}50%{filter:drop-shadow(0 0 10px color-mix(in srgb,var(--soul-a) 55%,transparent))}}
@keyframes soul-typing{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}
@media (max-width:560px){
  .soul-panel{left:10px;right:10px;bottom:10px;width:auto;height:min(86vh,720px);max-height:calc(100vh - 20px);border-radius:18px;}
  .soul-orb-button{right:16px;bottom:16px;width:58px;height:58px;}
}
@media (prefers-reduced-motion:reduce){
  .soul-orb-wrap,.soul-orb-live{animation:none;}
  .soul-vital-fill{transition:none;}
}
`

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value))
    }

    function orbColors(state) {
      const s = state || {}
      const mood = clamp(Number.isFinite(Number(s.moodScore)) ? Number(s.moodScore) : 50, 0, 100)
      const energy = clamp(Number.isFinite(Number(s.energy)) ? Number(s.energy) : 90, 0, 90)
      const hue = 205 + mood * 1.22
      const sat = 52 + energy * 0.38
      return {
        a: `hsl(${hue.toFixed(0)} ${sat.toFixed(0)}% 74%)`,
        b: `hsl(${(hue + 22).toFixed(0)} ${sat.toFixed(0)}% ${energy < 28 ? 48 : 60}%)`,
        soft: `hsl(${hue.toFixed(0)} ${Math.max(30, sat - 30).toFixed(0)}% 62%)`,
      }
    }

    function Orb({ state, size = 40, live = false }) {
      const idRef = React.useRef('')
      if (!idRef.current) idRef.current = 'soul-grad-' + Math.random().toString(36).slice(2, 9)
      const s = state || {}
      const colors = orbColors(s)
      const mood = clamp(Number.isFinite(Number(s.moodScore)) ? Number(s.moodScore) : 50, 0, 100)
      const energy = clamp(Number.isFinite(Number(s.energy)) ? Number(s.energy) : 90, 0, 90)
      const moodT = mood / 100
      const mouthControl = 35 + moodT * 9
      const mouth = `M25 39 Q32 ${mouthControl.toFixed(1)} 39 39`
      const sleepy = energy < 12
      const eyes = sleepy
        ? [
            h('path', { key: 'l', d: 'M21.5 30.5 Q24 32.4 26.5 30.5', fill: 'none', stroke: '#4a1836', strokeWidth: 1.8, strokeLinecap: 'round' }),
            h('path', { key: 'r', d: 'M37.5 30.5 Q40 32.4 42.5 30.5', fill: 'none', stroke: '#4a1836', strokeWidth: 1.8, strokeLinecap: 'round' }),
          ]
        : [
            h('circle', { key: 'l', cx: 24, cy: 30.5, r: 2.15, fill: '#4a1836' }),
            h('circle', { key: 'r', cx: 40, cy: 30.5, r: 2.15, fill: '#4a1836' }),
            h('circle', { key: 'lh', cx: 24.7, cy: 29.8, r: 0.72, fill: '#fff' }),
            h('circle', { key: 'rh', cx: 40.7, cy: 29.8, r: 0.72, fill: '#fff' }),
          ]
      const brows = mood < 35
        ? [
            h('path', { key: 'bl', d: 'M20 25.2 L26 27', stroke: '#4a1836', strokeWidth: 1.3, strokeLinecap: 'round' }),
            h('path', { key: 'br', d: 'M44 25.2 L38 27', stroke: '#4a1836', strokeWidth: 1.3, strokeLinecap: 'round' }),
          ]
        : mood > 70
          ? [
              h('path', { key: 'bl', d: 'M20 25 Q23 22.5 26 25', fill: 'none', stroke: '#4a1836', strokeWidth: 1.2, strokeLinecap: 'round' }),
              h('path', { key: 'br', d: 'M38 25 Q41 22.5 44 25', fill: 'none', stroke: '#4a1836', strokeWidth: 1.2, strokeLinecap: 'round' }),
            ]
          : []
      const tears = mood < 22
        ? [
            h('path', { key: 'tl', d: 'M21.2 33.5 Q19.8 36.4 21 38.2', fill: 'none', stroke: '#7ec8ff', strokeWidth: 1.4, strokeLinecap: 'round' }),
            h('circle', { key: 'tdl', cx: 21.1, cy: 39, r: 1.3, fill: '#7ec8ff' }),
            h('path', { key: 'tr', d: 'M42.8 33.5 Q44.2 36.4 43 38.2', fill: 'none', stroke: '#7ec8ff', strokeWidth: 1.4, strokeLinecap: 'round' }),
            h('circle', { key: 'tdr', cx: 42.9, cy: 39, r: 1.3, fill: '#7ec8ff' }),
          ]
        : []
      return h('div', { className: 'soul-orb-wrap' + (live ? ' soul-orb-live' : ''), style: { width: size, height: size } },
        h('svg', { viewBox: '0 0 64 64', width: size, height: size, 'aria-hidden': true, role: 'presentation' },
          h('defs', null,
            h('radialGradient', { id: idRef.current, cx: '34%', cy: '25%', r: '80%' },
              h('stop', { offset: '0%', stopColor: '#fff4fa' }),
              h('stop', { offset: '34%', stopColor: colors.a }),
              h('stop', { offset: '100%', stopColor: colors.b })
            )
          ),
          h('circle', { cx: 32, cy: 32, r: 26, fill: `url(#${idRef.current})` }),
          h('ellipse', { cx: 32, cy: 32, rx: 31, ry: 12, fill: 'none', stroke: colors.soft, strokeWidth: 1.6, opacity: .85, transform: 'rotate(-22 32 32)' }),
          h('ellipse', { cx: 32, cy: 32, rx: 28, ry: 9.5, fill: 'none', stroke: '#fff', strokeWidth: .9, opacity: .35, transform: 'rotate(27 32 32)' }),
          ...brows,
          ...eyes,
          ...tears,
          h('path', { d: mouth, fill: 'none', stroke: '#4a1836', strokeWidth: 1.8, strokeLinecap: 'round' }),
          h('circle', { cx: 19.5, cy: 37.5, r: 3.1, fill: '#ff7fae', opacity: mood > 55 ? .3 : 0 }),
          h('circle', { cx: 44.5, cy: 37.5, r: 3.1, fill: '#ff7fae', opacity: mood > 55 ? .3 : 0 }),
          h('circle', { cx: 23, cy: 18, r: 1.5, fill: '#fff', opacity: .8 }),
          h('circle', { cx: 14, cy: 27, r: .9, fill: '#fff', opacity: .55 })
        )
      )
    }

    function StatusDot({ status }) {
      const color = status === 'working' || status === 'thinking'
        ? 'var(--dsw-alias-state-warn-primary)'
        : status === 'sleeping' || status === 'resting'
          ? 'var(--dsw-alias-state-idle-primary)'
          : 'var(--dsw-alias-state-success-primary)'
      return h('span', { style: { width: 6, height: 6, borderRadius: '50%', background: color, flex: 'none', boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 14%, transparent)` } })
    }

    function Icon({ name, size = 16 }) {
      const common = { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
      if (name === 'close') return h('svg', common, h('path', { d: 'M6 6l12 12M18 6L6 18' }))
      if (name === 'gear') return h('svg', common,
        h('circle', { cx: 12, cy: 12, r: 3.1 }),
        h('path', { d: 'M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.36.4.7.72.96.3.24.67.38 1.06.4H21v4h-.09a1.7 1.7 0 0 0-1.51.64z' })
      )
      if (name === 'send') return h('svg', common, h('path', { d: 'M12 19V5M6 11l6-6 6 6' }))
      if (name === 'arrow') return h('svg', common, h('path', { d: 'M5 12h14M13 6l6 6-6 6' }))
      if (name === 'retry') return h('svg', common, h('path', { d: 'M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7' }))
      if (name === 'diary') return h('svg', common, h('path', { d: 'M6 4h11a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2V4zM6 4v16M10 8h5M10 12h5' }))
      if (name === 'chat') return h('svg', common, h('path', { d: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4V6z' }))
      if (name === 'spark') return h('svg', common, h('path', { d: 'M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z' }))
      if (name === 'clock') return h('svg', common,
        h('circle', { cx: 12, cy: 12, r: 8.2 }),
        h('path', { d: 'M12 7.5V12l3 2' })
      )
      return h('svg', common, h('circle', { cx: 12, cy: 12, r: 8 }))
    }

    function ago(at, t) {
      if (!at) return ''
      const diff = Math.max(0, Date.now() - Number(at))
      const minutes = Math.floor(diff / 60000)
      if (minutes < 1) return t('justNow')
      if (minutes < 60) return `${minutes} ${t('minutesAgo')}`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours} ${t('hoursAgo')}`
      const days = Math.floor(hours / 24)
      return `${days} ${t('daysAgo')}`
    }

    function until(at, t) {
      if (!at) return t('paused')
      const diff = Number(at) - Date.now()
      if (diff <= 0) return t('soon')
      const minutes = Math.ceil(diff / 60000)
      if (minutes < 60) return `${t('nextIn')} ${minutes} ${t('minutes')}`
      return `${t('nextIn')} ${Math.ceil(minutes / 60)} ${t('hours')}`
    }

    function timeText(at, locale) {
      if (!at) return ''
      try {
        return new Date(at).toLocaleTimeString(locale || 'zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
      } catch {
        return ''
      }
    }

    function dateText(at, locale) {
      if (!at) return ''
      try {
        return new Date(at).toLocaleString(locale || 'zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      } catch {
        return ''
      }
    }

    function affectionLabel(value, t) {
      const affection = clamp(Number(value) || 0, 0, 100)
      if (affection >= 80) return t('affectionBonded')
      if (affection >= 60) return t('affectionClose')
      if (affection >= 40) return t('affectionFamiliar')
      if (affection >= 20) return t('affectionWary')
      return t('affectionDistant')
    }

    function energyLabel(state, t) {
      const energy = clamp(Number(state.energy) || 0, 0, 90)
      if (state.status === 'sleeping' || energy < 12) return t('energySleeping')
      if (energy < 25) return t('energyExhausted')
      if (energy < 50) return t('energyTired')
      if (energy < 75) return t('energyOkay')
      return t('energyEnergetic')
    }

    function format1(value) {
      const number = Number(value)
      return Number.isFinite(number) ? number.toFixed(1) : '0.0'
    }

    function periodText(clock, t) {
      const key = (clock && clock.periodKey) || 'evening'
      return t('period' + key.charAt(0).toUpperCase() + key.slice(1))
    }

    function clockText(clock, locale) {
      const at = clock && clock.now ? new Date(clock.now) : new Date()
      try {
        return at.toLocaleTimeString(locale || 'zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
      } catch {
        return ''
      }
    }

    function statusText(data, t) {
      if (!data || !data.ready) return data && data.starting ? t('connecting') : t('sleeping')
      if (data.status === 'working' && data.state && data.state.lastTool) return `${t('statusTool')} ${data.state.lastTool}`
      if (data.status === 'working') return t('statusWorking')
      if (data.status === 'thinking') return t('statusThinking')
      if (data.status === 'sleeping') return t('statusSleeping')
      if (data.status === 'resting') return t('statusResting')
      return t('statusIdle')
    }

    function useSoulData(open) {
      const [data, setData] = React.useState(null)
      const [error, setError] = React.useState('')
      const [nonce, setNonce] = React.useState(0)
      React.useEffect(() => {
        let stopped = false
        let timer = null
        async function load() {
          try {
            const response = await fetch('/soul-api/state', { cache: 'no-store' })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload && payload.error ? payload.error : `HTTP ${response.status}`)
            if (stopped) return
            setData(payload)
            setError('')
          } catch (failure) {
            if (!stopped) setError(failure && failure.message ? failure.message : String(failure))
          } finally {
            if (!stopped) timer = setTimeout(load, open ? 1500 : 12000)
          }
        }
        load()
        return () => {
          stopped = true
          if (timer) clearTimeout(timer)
        }
      }, [open, nonce])
      return { data, error, refresh: () => setNonce((value) => value + 1), setData }
    }

    async function post(path, body) {
      const response = await fetch('/soul-api' + path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body || {}),
        cache: 'no-store',
      })
      let payload = null
      try {
        payload = await response.json()
      } catch {
        payload = null
      }
      if (!response.ok || !payload || payload.ok === false) {
        throw new Error(payload && payload.error ? payload.error : `HTTP ${response.status}`)
      }
      return payload
    }

    function Switch({ checked, onChange, label }) {
      return h('button', {
        type: 'button',
        className: 'soul-switch' + (checked ? ' on' : ''),
        role: 'switch',
        'aria-checked': checked,
        'aria-label': label,
        onClick: () => onChange(!checked),
      }, h('span'))
    }

    function MessageRow({ message, t, locale, state }) {
      const isUser = message.role === 'user'
      const system = Boolean(message.system)
      return h('div', { className: 'soul-row ' + (isUser ? 'user' : 'assistant') + (system ? ' system' : '') },
        !isUser && h('div', { className: 'soul-mini-orb' }, h(Orb, { state, size: 24 })),
        h('div', { style: { minWidth: 0 } },
          h('div', { className: 'soul-bubble' }, message.text),
          h('div', { className: 'soul-bubble-meta', style: isUser ? { justifyContent: 'flex-end' } : null },
            system ? h('span', { className: 'soul-proactive' }, t('systemReply')) : message.proactive ? h('span', { className: 'soul-proactive' }, t('proactive')) : null,
            h('span', null, timeText(message.at, locale))
          )
        )
      )
    }

    function Header({ data, state, t, onClose, onSettings, settings }) {
      return h('div', { className: 'soul-header' },
        h('div', { className: 'soul-header-id' },
          h(Orb, { state, size: 42, live: Boolean(data && data.running) }),
          h('div', { className: 'soul-header-text' },
            h('div', { className: 'soul-name' }, (state && state.name) || t('title')),
            h('div', { className: 'soul-sub' },
              h(StatusDot, { status: data && data.status ? data.status : 'idle' }),
              h('span', null, statusText(data, t))
            )
          )
        ),
        h('div', { className: 'soul-header-actions' },
          h('button', { type: 'button', className: 'soul-iconbtn', 'aria-label': settings ? t('back') : t('settings'), title: settings ? t('back') : t('settings'), onClick: onSettings }, h(Icon, { name: settings ? 'arrow' : 'gear' })),
          h('button', { type: 'button', className: 'soul-iconbtn', 'aria-label': t('close'), title: t('close'), onClick: onClose }, h(Icon, { name: 'close' }))
        )
      )
    }

    function VitalCard({ state, t }) {
      const mood = clamp(Number(state.moodScore) || 0, 0, 100)
      const energy = clamp(Number(state.energy) || 0, 0, 100)
      const affection = clamp(Number(state.affection) || 0, 0, 100)
      return h('div', null,
        h('div', { className: 'soul-vitals' },
          h('div', { className: 'soul-vital' },
            h('span', { className: 'soul-vital-label' }, t('mood')),
            h('span', { className: 'soul-vital-value' }, state.mood || '—'),
            h('div', { className: 'soul-vital-bar' }, h('div', { className: 'soul-vital-fill', style: { width: `${mood}%` } })),
            h('span', { className: 'soul-vital-num' }, format1(mood))
          ),
          h('div', { className: 'soul-vital' },
            h('span', { className: 'soul-vital-label' }, t('energy')),
            h('span', { className: 'soul-vital-value' }, energyLabel(state, t)),
            h('div', { className: 'soul-vital-bar' }, h('div', { className: 'soul-vital-fill energy', style: { width: `${energy}%` } })),
            h('span', { className: 'soul-vital-num' }, format1(energy))
          ),
          h('div', { className: 'soul-vital' },
            h('span', { className: 'soul-vital-label' }, t('affection')),
            h('span', { className: 'soul-vital-value' }, affectionLabel(affection, t)),
            h('div', { className: 'soul-vital-bar' }, h('div', { className: 'soul-vital-fill affection', style: { width: `${affection}%` } })),
            h('span', { className: 'soul-vital-num' }, format1(affection))
          )
        ),
        state.thought ? h('div', { className: 'soul-thought' }, state.thought) : null
      )
    }

    function ActivityCard({ state, data, t, locale }) {
      const clock = data && data.clock
      return h('div', null,
        h('div', { className: 'soul-activity' },
          h('div', null,
            h('span', { className: 'soul-eyebrow' }, t('activity')),
            h('div', { className: 'soul-activity-main' }, state.activity || '—')
          ),
          h('div', { className: 'soul-activity-time' }, state.lastReplyAt ? ago(state.lastReplyAt, t) : '')
        ),
        h('div', { className: 'soul-clockline' },
          h('div', { className: 'soul-clock' },
            h(Icon, { name: 'clock', size: 12 }),
            h('span', null, `${clockText(clock, locale)} · ${periodText(clock, t)}`)
          ),
          h('span', { className: 'soul-clock-date' }, `${t('lastChat')} ${state.lastChatAt ? ago(state.lastChatAt, t) : '—'}`)
        ),
        state.hobbies && state.hobbies.length > 0
          ? h('div', { className: 'soul-chips' }, state.hobbies.slice(0, 7).map((hobby) => h('span', { className: 'soul-chip', key: hobby }, hobby)))
          : null
      )
    }

    function ChatView({ data, state, t, locale, refresh, draft, setDraft, sending, send, listRef }) {
      const messages = (data && data.messages) || []
      const running = Boolean(data && data.running)
      return h('div', { className: 'soul-chat' },
        h('div', { className: 'soul-messages', ref: listRef },
          messages.length === 0
            ? h('div', { className: 'soul-empty' }, t('emptyChat'))
            : messages.map((message) => h(MessageRow, { key: message.seq, message, t, locale, state })),
          running || sending
            ? h('div', { className: 'soul-typing' },
                h('div', { className: 'soul-dots' }, h('i'), h('i'), h('i')),
                h('span', null, running ? t('thinkingNow') : t('connecting'))
              )
            : null
        ),
        h('div', { className: 'soul-composer' },
          h('textarea', {
            className: 'soul-input',
            rows: 1,
            value: draft,
            placeholder: t('placeholder'),
            onChange: (event) => setDraft(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void send()
              }
            },
            'aria-label': t('placeholder'),
          }),
          h('button', {
            type: 'button',
            className: 'soul-send',
            'aria-label': t('send'),
            title: t('send'),
            disabled: sending || !draft.trim(),
            onClick: () => void send(),
          }, h(Icon, { name: 'send', size: 17 }))
        )
      )
    }

    function DiaryView({ state, t, locale }) {
      const entries = state.diary || []
      return h('div', { className: 'soul-scroll' },
        h('div', { className: 'soul-diary-wrap' },
          h('div', { className: 'soul-memory-card' },
            h('span', { className: 'soul-eyebrow' }, t('memory')),
            h('p', null, state.memory || t('memoryEmpty'))
          ),
          h('div', { className: 'soul-memory-card' },
            h('span', { className: 'soul-eyebrow' }, t('hobbies')),
            h('p', null, (state.hobbies || []).join(' · ') || '—')
          ),
          h('div', null,
            h('span', { className: 'soul-eyebrow' }, `${t('diary')}${entries.length ? ` · ${entries.length}` : ''}`),
            entries.length === 0
              ? h('div', { className: 'soul-empty', style: { padding: '18px 0' } }, t('emptyDiary'))
              : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 } },
                  entries.map((entry, index) => h('div', { className: 'soul-diary-entry', key: `${entry.at}-${index}` },
                    h('div', { className: 'soul-diary-time' }, dateText(entry.at, locale)),
                    h('div', { className: 'soul-diary-text' }, entry.text)
                  ))
                )
          )
        )
      )
    }

    function PersonaEditor({ data, state, t, applyPersona, busy }) {
      const personas = (data && data.personas) || []
      const presetIds = personas.map((entry) => entry.id)
      const initial = presetIds.includes(state.personaId) ? state.personaId : 'custom'
      const [choice, setChoice] = React.useState(initial)
      const [name, setName] = React.useState(state.name || '')
      const [tagline, setTagline] = React.useState(state.personaTagline || '')
      const [text, setText] = React.useState(state.persona || '')

      React.useEffect(() => {
        if (choice === 'custom') {
          setName(state.name || '')
          setTagline(state.personaTagline || '')
          setText(state.persona || '')
          return
        }
        const selected = personas.find((entry) => entry.id === choice)
        if (selected) {
          setName(selected.name)
          setTagline(selected.tagline || '')
          setText('')
        }
      }, [choice])

      const selected = personas.find((entry) => entry.id === choice)
      const custom = choice === 'custom'
      const canApply = !busy && (custom ? Boolean(name.trim() && text.trim()) : Boolean(selected))

      function apply() {
        if (!canApply) return
        if (custom) {
          void applyPersona({ name: name.trim(), tagline: tagline.trim(), persona: text.trim() })
        } else {
          void applyPersona({ presetId: choice })
        }
      }

      return h('div', { className: 'soul-persona-card' },
        h('div', { className: 'soul-persona-head' },
          h('div', null,
            h('div', { className: 'soul-persona-name' }, `${t('personaCurrent')}：${state.name || '—'}`),
            h('div', { className: 'soul-persona-tag' }, state.personaTagline || '')
          ),
          h('span', { className: 'soul-chip' }, state.personaId === 'custom' ? t('personaCustom') : t('personaPreset'))
        ),
        h('select', {
          className: 'soul-persona-select',
          value: choice,
          onChange: (event) => setChoice(event.target.value),
          'aria-label': t('personaPreset'),
        },
          personas.map((entry) => h('option', { key: entry.id, value: entry.id }, entry.name)),
          h('option', { value: 'custom' }, t('personaCustom'))
        ),
        custom
          ? h(React.Fragment, null,
              h('div', { className: 'soul-field' },
                h('label', null, t('personaName')),
                h('input', {
                  value: name,
                  maxLength: 40,
                  onChange: (event) => setName(event.target.value),
                  placeholder: '大肥鱼',
                })
              ),
              h('div', { className: 'soul-field' },
                h('label', null, t('personaTagline')),
                h('input', {
                  value: tagline,
                  maxLength: 120,
                  onChange: (event) => setTagline(event.target.value),
                  placeholder: t('personaTagline'),
                })
              ),
              h('div', { className: 'soul-field' },
                h('label', null, t('personaText')),
                h('textarea', {
                  value: text,
                  onChange: (event) => setText(event.target.value),
                  placeholder: t('personaCustomHint'),
                })
              ),
              h('div', { className: 'soul-persona-hint' }, t('personaCustomHint'))
            )
          : h(React.Fragment, null,
              selected ? h('div', { className: 'soul-persona-preview' }, `${selected.description || ''}${selected.preview ? `\n${selected.preview}` : ''}`) : null,
              h('div', { className: 'soul-persona-hint' }, t('personaHint'))
            ),
        h('div', { className: 'soul-persona-actions' },
          h('button', {
            type: 'button',
            className: 'soul-button primary',
            disabled: !canApply,
            onClick: apply,
          }, h(Icon, { name: 'spark' }), busy ? t('personaBusy') : t('personaApply'))
        ),
        h('div', { className: 'soul-persona-hint' }, t('personaKeep'))
      )
    }

    function SettingsView({ data, state, t, saveConfig, impulse, retry, notice, busy, applyPersona, personaBusy, openDiaries }) {
      const config = state.config || {}
      const options = [10, 20, 30, 60, 120]
      const currentMinutes = Number(config.heartbeatMinutes)
      if (Number.isFinite(currentMinutes) && !options.includes(currentMinutes)) options.push(currentMinutes)
      options.sort((a, b) => a - b)
      return h('div', { className: 'soul-scroll' },
        h('div', { className: 'soul-settings-wrap' },
          notice ? h('div', { className: 'soul-notice' + (notice.error ? ' soul-error' : '') }, notice.text) : null,
          h(PersonaEditor, { data, state, t, applyPersona, busy: personaBusy }),
          h('button', { type: 'button', className: 'soul-button', onClick: () => void openDiaries() }, h(Icon, { name: 'diary' }), t('openDiaries')),
          h('div', { className: 'soul-setting-hint', style: { marginTop: -4, paddingLeft: 2 } }, t('openDiariesHint')),
          h('div', { className: 'soul-setting' },
            h('div', { className: 'soul-setting-copy' },
              h('div', { className: 'soul-setting-title' }, t('autonomy')),
              h('div', { className: 'soul-setting-hint' }, t('autonomyHint'))
            ),
            h(Switch, {
              checked: Boolean(config.autonomy),
              label: t('autonomy'),
              onChange: (value) => void saveConfig({ autonomy: value }),
            })
          ),
          h('div', { className: 'soul-setting' },
            h('div', { className: 'soul-setting-copy' },
              h('div', { className: 'soul-setting-title' }, t('interval')),
              h('div', { className: 'soul-setting-hint' }, config.autonomy ? `${t('nextAutonomy')}: ${until(data && data.nextAutonomyAt, t)}` : t('paused'))
            ),
            h('div', { className: 'soul-select-wrap' },
              h('select', {
                className: 'soul-select',
                value: config.heartbeatMinutes || 30,
                onChange: (event) => void saveConfig({ heartbeatMinutes: Number(event.target.value) }),
              }, options.map((minutes) => h('option', { key: minutes, value: minutes }, `${minutes} ${t('minutes')}`)))
            )
          ),
          h('div', { className: 'soul-setting' },
            h('div', { className: 'soul-setting-copy' },
              h('div', { className: 'soul-setting-title' }, t('nightRest')),
              h('div', { className: 'soul-setting-hint' }, t('nightRestHint'))
            ),
            h(Switch, {
              checked: config.nightRest !== false,
              label: t('nightRest'),
              onChange: (value) => void saveConfig({ nightRest: value }),
            })
          ),
          h('div', { className: 'soul-setting' },
            h('div', { className: 'soul-setting-copy' },
              h('div', { className: 'soul-setting-title' }, t('desktopPet')),
              h('div', { className: 'soul-setting-hint' }, t('desktopPetHint'))
            ),
            h(Switch, {
              checked: config.petWindow !== false,
              label: t('desktopPet'),
              onChange: (value) => void saveConfig({ petWindow: value }),
            })
          ),
          h('div', { className: 'soul-setting' },
            h('div', { className: 'soul-setting-copy' },
              h('div', { className: 'soul-setting-title' }, t('approval')),
              h('div', { className: 'soul-setting-hint' }, t('approvalHint'))
            ),
            h('div', { className: 'soul-select-wrap' },
              h('select', {
                className: 'soul-select',
                value: config.approval === 'never' ? 'never' : 'ask',
                onChange: (event) => void saveConfig({ approval: event.target.value }),
              },
                h('option', { value: 'ask' }, t('approvalAsk')),
                h('option', { value: 'never' }, t('approvalNever'))
              )
            )
          ),
          h('button', { type: 'button', className: 'soul-button primary', disabled: busy, onClick: () => void impulse() }, h(Icon, { name: 'spark' }), t('impulse')),
          h('div', { className: 'soul-setting-hint', style: { marginTop: -4, paddingLeft: 2 } }, t('impulseHint')),
          h('dl', { className: 'soul-kv' },
            h('dt', null, t('model')),
            h('dd', null, data && data.model ? `${data.model.provider}/${data.model.model}` : t('noModel')),
            h('dt', null, t('session')),
            h('dd', null, (data && data.sessionId) || '—'),
            h('dt', null, t('room')),
            h('dd', null, (data && data.home) || '—'),
            h('dt', null, t('data')),
            h('dd', null, (data && data.dataDir) || '—'),
            h('dt', null, t('diaryDir')),
            h('dd', null, (data && data.diaryDir) || '—')
          ),
          h('p', { className: 'soul-note' }, t('settingsNote')),
          data && data.error
            ? h('button', { type: 'button', className: 'soul-button', onClick: () => void retry() }, h(Icon, { name: 'retry' }), t('retry'))
            : null
        )
      )
    }

    function Connecting({ data, t, retry, error }) {
      const starting = !data || data.starting
      return h('div', { className: 'soul-connecting' },
        h(Orb, { state: data && data.state, size: 72, live: starting }),
        h('div', { className: 'soul-connecting-title' }, starting ? t('connecting') : t('sleeping')),
        h('div', { className: 'soul-connecting-text' }, error || (data && data.error) || (starting ? t('connecting') : t('unavailable'))),
        h('button', { type: 'button', className: 'soul-button', onClick: () => void retry() }, h(Icon, { name: 'retry' }), t('retry'))
      )
    }

    function SoulWidget(props) {
      const t = typeof props.t === 'function' ? props.t : (key) => zh[key] || key
      const ctx = props.ctx
      const [open, setOpen] = React.useState(() => {
        try {
          return window.localStorage.getItem('dsh-soul.open') === '1'
        } catch {
          return false
        }
      })
      const [tab, setTab] = React.useState('chat')
      const [settings, setSettings] = React.useState(false)
      const [draft, setDraft] = React.useState('')
      const [sending, setSending] = React.useState(false)
      const [notice, setNotice] = React.useState(null)
      const [busy, setBusy] = React.useState(false)
      const [personaBusy, setPersonaBusy] = React.useState(false)
      const [newChatBusy, setNewChatBusy] = React.useState(false)
      const [unread, setUnread] = React.useState(0)
      const { data, error, refresh, setData } = useSoulData(open)
      const listRef = React.useRef(null)
      const seenRef = React.useRef(0)
      const loadedRef = React.useRef(false)
      const state = (data && data.state) || { name: '大肥鱼', personaId: 'dafeiyu', personaTagline: '圆滚滚、嘴馋、会摸鱼', persona: '', mood: '平静', moodScore: 50, energy: 90, affection: 55, activity: '', thought: '', hobbies: [], diary: [], memory: '', config: { autonomy: true, heartbeatMinutes: 30, nightRest: true, approval: 'ask' } }
      const locale = (() => {
        try {
          return ctx && ctx.locale ? ctx.locale.getLocale().id : 'zh-CN'
        } catch {
          return 'zh-CN'
        }
      })()

      React.useEffect(() => {
        try {
          window.localStorage.setItem('dsh-soul.open', open ? '1' : '0')
        } catch {
          // Storage can be unavailable in a private window.
        }
      }, [open])

      React.useEffect(() => {
        if (!open) return undefined
        const onKey = (event) => {
          if (event.key !== 'Escape') return
          if (settings) setSettings(false)
          else setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [open, settings])

      const lastAssistant = React.useMemo(() => {
        if (!data || !Array.isArray(data.messages)) return 0
        for (let index = data.messages.length - 1; index >= 0; index--) {
          if (data.messages[index].role === 'assistant') return data.messages[index].seq
        }
        return 0
      }, [data])

      React.useEffect(() => {
        if (!data) return
        if (!loadedRef.current) {
          loadedRef.current = true
          seenRef.current = lastAssistant
          return
        }
        if (open) {
          seenRef.current = lastAssistant
          setUnread(0)
          return
        }
        if (lastAssistant && lastAssistant !== seenRef.current) {
          seenRef.current = lastAssistant
          setUnread((value) => value + 1)
        }
      }, [data, open, lastAssistant])

      React.useEffect(() => {
        if (!open || tab !== 'chat' || settings) return undefined
        const timer = setTimeout(() => {
          const input = document.querySelector('.soul-input')
          if (input) input.focus()
        }, 120)
        return () => clearTimeout(timer)
      }, [open, tab, settings])

      React.useEffect(() => {
        const element = listRef.current
        if (!element) return
        element.scrollTop = element.scrollHeight
      }, [lastAssistant, sending, tab, open])

      async function send() {
        const text = draft.trim()
        if (!text || sending) return
        setDraft('')
        setSending(true)
        setNotice(null)
        try {
          await post('/chat', { text })
          refresh()
        } catch (failure) {
          setDraft(text)
          setNotice({ text: failure.message, error: true })
        } finally {
          setTimeout(() => setSending(false), 500)
        }
      }

      async function saveConfig(patch) {
        setData((previous) => {
          if (!previous) return previous
          return { ...previous, state: { ...previous.state, config: { ...previous.state.config, ...patch } } }
        })
        setNotice({ text: t('settingsSaved'), error: false })
        try {
          await post('/config', patch)
          refresh()
        } catch (failure) {
          setNotice({ text: failure.message, error: true })
          refresh()
        }
      }

      async function impulse() {
        if (busy) return
        setBusy(true)
        setNotice(null)
        try {
          await post('/impulse', {})
          setNotice({ text: t('impulseSent'), error: false })
          refresh()
        } catch (failure) {
          setNotice({ text: failure.message, error: true })
        } finally {
          setBusy(false)
        }
      }

      async function retry() {
        setBusy(true)
        try {
          await post('/retry', {})
          refresh()
        } catch (failure) {
          setNotice({ text: failure.message, error: true })
        } finally {
          setBusy(false)
        }
      }

      async function changePersona(payload) {
        if (personaBusy) return
        setPersonaBusy(true)
        setNotice(null)
        try {
          await post('/persona', payload)
          setNotice({ text: t('personaApplied'), error: false })
          refresh()
        } catch (failure) {
          setNotice({ text: failure.message, error: true })
        } finally {
          setPersonaBusy(false)
        }
      }

      async function openDiaries() {
        setNotice(null)
        try {
          await post('/open-diaries', {})
          setNotice({ text: t('diaryOpened'), error: false })
        } catch (failure) {
          setNotice({ text: failure.message, error: true })
        }
      }

      async function newChat() {
        if (newChatBusy) return
        if (!window.confirm(t('newChatConfirm'))) return
        setNewChatBusy(true)
        setNotice(null)
        try {
          await post('/new-chat', {})
          setDraft('')
          setTab('chat')
          setNotice({ text: t('newChatDone'), error: false })
          refresh()
        } catch (failure) {
          setNotice({ text: failure.message, error: true })
        } finally {
          setNewChatBusy(false)
        }
      }

      function toggleSettings() {
        setSettings((value) => !value)
        setNotice(null)
      }

      const ready = Boolean(data && data.ready)
      const petLive = Boolean(data && data.pet && data.pet.running)
      return h(React.Fragment, null,
        h('style', { key: 'soul-style' }, CSS),
        h('div', { className: 'soul-layer', style: { '--soul-a': orbColors(state).a, '--soul-b': orbColors(state).b } },
          !open
            ? (petLive ? null : h('button', {
                type: 'button',
                className: 'soul-orb-button',
                'aria-label': `${t('open')} ${state.name}`,
                title: `${state.name} · ${statusText(data, t)}`,
                onClick: () => setOpen(true),
              },
                h(Orb, { state, size: 64, live: ready && data.running }),
                unread > 0 ? h('span', { className: 'soul-unread' }, unread > 9 ? '9+' : unread) : null
              ))
            : h('section', {
                className: 'soul-panel',
                role: 'dialog',
                'aria-modal': false,
                'aria-label': state.name || t('title'),
                onClick: (event) => event.stopPropagation(),
              },
                h(Header, { data, state, t, onClose: () => setOpen(false), onSettings: toggleSettings, settings }),
                h('div', { className: 'soul-body' },
                  !ready
                    ? h(Connecting, { data, t, retry, error })
                    : settings
                      ? h(SettingsView, { data, state, t, saveConfig, impulse, retry, notice, busy, applyPersona: changePersona, personaBusy, openDiaries })
                      : h(React.Fragment, null,
                          h(VitalCard, { state, t }),
                          h(ActivityCard, { state, data, t, locale }),
                          h('div', { className: 'soul-tabs' },
                            h('button', { type: 'button', className: 'soul-tab' + (tab === 'chat' ? ' active' : ''), onClick: () => setTab('chat') }, t('chat'), h('span', { className: 'soul-tab-count' }, ((data && data.messages) || []).length || '')),
                            h('button', { type: 'button', className: 'soul-tab' + (tab === 'diary' ? ' active' : ''), onClick: () => setTab('diary') }, t('diary'), h('span', { className: 'soul-tab-count' }, (state.diary || []).length || '')),
                            h('button', { type: 'button', className: 'soul-tab soul-newchat', disabled: newChatBusy, title: t('newChat'), onClick: () => void newChat() }, h(Icon, { name: 'spark', size: 12 }), newChatBusy ? t('newChatting') : t('newChat'))
                          ),
                          notice ? h('div', { className: 'soul-notice' + (notice.error ? ' soul-error' : '') }, notice.text) : null,
                          tab === 'chat'
                            ? h(ChatView, { data, state, t, locale, refresh, draft, setDraft, sending, send, listRef })
                            : h(DiaryView, { state, t, locale })
                        )
                )
              )
        )
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-soul: locale')
        ctx.effect(() => ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'dsh-soul.panel',
          order: 20,
          locale: NS,
          inject: () => ({ ctx }),
        }, SoulWidget)), 'dsh-soul: overlay')
      },
    }
  },
})

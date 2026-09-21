import type { EpisodeMarker, HookType, Project } from './types'
import { createCharacter, createDialogue, createEpisode, createProject, createScene } from './model'
import { attachStoryboard } from './storyboard'

type Beat = {
  title: string
  hookTitle: string
  opening: string
  middle: string
  endingHook: string
  nextPreview: string
  notes?: string
}

function worldEndCraft(index: number): { hookType: HookType; marker: EpisodeMarker } {
  const n = index + 1
  const front: HookType[] = [
    'crisis',
    'info',
    'reversal',
    'crisis',
    'emotion',
    'reversal',
    'crisis',
    'suspense',
    'crisis',
    'info',
  ]
  const cycle: HookType[] = ['emotion', 'suspense', 'info', 'crisis', 'reversal']
  const hookType = n <= 10 ? front[n - 1] : cycle[(index - 10) % cycle.length]
  if (n <= 10) {
    if (n === 4 || n === 7) return { hookType, marker: 'paywall' }
    if (n === 1 || n === 3 || n === 6 || n === 9) return { hookType, marker: 'key' }
    return { hookType, marker: 'normal' }
  }
  if (n % 7 === 0) return { hookType, marker: 'paywall' }
  if (n % 3 === 0) return { hookType, marker: 'key' }
  return { hookType, marker: 'normal' }
}

const BEATS: Beat[] = [
  {
    title: '订婚宴上的陨石',
    hookTitle: '警报响了，他先把戒指扔了',
    opening: '顾氏庄园订婚宴上，天空裂开，陨石预警全城拉响。',
    middle: '顾寒当众悔婚：末日来了，方舟没有你的位置。宋织当场亮出金船票。',
    endingHook: '黎霜被赶出大门，手腕旧伤疤忽然发光，脚下防空洞的门自己开了。',
    nextPreview: '门后不是防空洞。',
    notes: '三秒内完成：末日、羞辱、门为她开。不要解释星核。',
  },
  {
    title: '只认你的血',
    hookTitle: '这扇门，不认顾氏的指纹',
    opening: '顾寒带人追到门口，掌纹打不开，黎霜的血一滴下去，门全亮。',
    middle: '舱内全是十年前的实验舱。宋织在对讲机里下令：活捉密钥。',
    endingHook: '主屏幕跳出：星核匹配 100%。持有人——黎霜。',
    nextPreview: '船票上的名字被改过。',
  },
  {
    title: '船票是假的',
    hookTitle: '金船票背面，印着她的编号',
    opening: '宋织把金船票递给媒体：顾太太的位置，从一开始就不是黎霜。',
    middle: '黎霜翻开实验舱档案，发现自己十年前的编号和船票背面一致。',
    endingHook: '顾振山下令：密钥必须在天亮前回收。必要时，摘心。',
    nextPreview: '摘心令传到顾寒手机上。',
  },
  {
    title: '摘心令',
    hookTitle: '命令上写着：取出活体心脏',
    opening: '顾寒看着密令，第一次把手枪保险打开，却对准了自己人。',
    middle: '黎霜从通风管逃出，宋织用无人机锁定她的热源。',
    endingHook: '雨里有个小孩喊妈妈。黎霜的伤疤和那孩子手腕上的灯，一起亮了。',
    nextPreview: '顾寒看见了那个孩子。',
  },
  {
    title: '雨里的小星',
    hookTitle: '五岁小孩，也能开门',
    opening: '小星拉着黎霜的手，防空洞第二道门同样打开。',
    middle: '顾寒拦住她们：孩子留下，你跟我回方舟。黎霜拒绝。',
    endingHook: '宋织的人把小星从人群里拽走，对讲机说：第二枚密钥到手。',
    nextPreview: '亲子鉴定被连夜送检。',
  },
  {
    title: '不是你的女儿？',
    hookTitle: '报告上的父亲，被涂黑了',
    opening: '顾寒强迫医院连夜做鉴定。宋织提前调包血样。',
    middle: '公开结果：小星与顾寒零匹配。媒体笑黎霜是灾民骗婚。',
    endingHook: '地下医生老周打开保险柜：真正的报告上，父亲是顾寒。',
    nextPreview: '感染名单连夜出炉。',
  },
  {
    title: '红色感染名单',
    hookTitle: '她的名字被标成可抛弃',
    opening: '方舟公布第一批感染者，黎霜的脸出现在巨幕上。',
    middle: '顾家当众消毒她住过的房间。宋织提议：实验体就地销毁。',
    endingHook: '老周把黎霜拉进下水道：那不是病毒，是星核觉醒。',
    nextPreview: '地下城的闸门，十年没开过。',
  },
  {
    title: '地下城开闸',
    hookTitle: '闸门只认密钥的心跳',
    opening: '黎霜把掌心贴上去，废弃地下城的灯一条一条亮起。',
    middle: '里面全是十年前失踪的实验体编号。宋织的父亲也在墙上。',
    endingHook: '广播响起顾寒的声音：黎霜，上船。否则我炸开地下城。',
    nextPreview: '他真的把炸药安上了。',
  },
  {
    title: '炸药安在她头顶',
    hookTitle: '他来救她，也来抓她',
    opening: '顾寒独自下城，把炸药倒计时关掉，却给黎霜戴上手铐。',
    middle: '黎霜问：你悔婚的时候，知不知道我会被摘心？他不说话。',
    endingHook: '地下城最深处的冷冻仓里，躺着一张和黎霜一模一样的脸。',
    nextPreview: '克隆体今天解冻。',
  },
  {
    title: '另一张黎霜',
    hookTitle: '镜子里的人，先开口了',
    opening: '克隆体睁眼，第一句是：我才是能登船的那个。',
    middle: '宋织给克隆体穿上婚纱，准备顶替黎霜出席方舟选拔。',
    endingHook: '克隆体手腕没有伤疤。小星一眼就认出来：她不是妈妈。',
    nextPreview: '方舟选拔开始直播。',
  },
  {
    title: '直播选拔',
    hookTitle: '全人类都在看谁能活',
    opening: '方舟广场百万人排队。宋织把克隆体推到镜头前，称她是顾太太。',
    middle: '黎霜戴着帽子混进队伍，血检仪器在她靠近时过载爆炸。',
    endingHook: '大屏幕弹出红字：检测到双密钥。系统要求两人同时进入反应堆。',
    nextPreview: '反应堆要吃人。',
  },
  {
    title: '反应堆要活人',
    hookTitle: '燃料不是铀，是心脏',
    opening: '方舟总工程师当众解释：星核必须从活体密钥胸腔取出。',
    middle: '顾寒挡在黎霜前面。宋织问他：你选人类，还是选一个弃妇？',
    endingHook: '小星从人群里冲出来，把掌心按在反应堆上——灯也亮了。',
    nextPreview: '三枚密钥，系统只要两枚。',
  },
  {
    title: '三枚密钥',
    hookTitle: '孩子也可以被当成燃料',
    opening: '宋织当场改方案：留克隆体，用小星替代黎霜，效率更高。',
    middle: '黎霜用手铐勒住宋织，换小星三分钟逃跑时间。',
    endingHook: '顾寒把小星抱上指挥舰，却把黎霜关进隔离舱。',
    nextPreview: '隔离舱的氧气，在减少。',
  },
  {
    title: '氧气在减少',
    hookTitle: '他关的门，密码是她的生日',
    opening: '黎霜在隔离舱里缺氧，顾寒在外面听着她的呼吸。',
    middle: '宋织切断总阀。顾寒打碎玻璃，把自己的氧气面罩扔进去。',
    endingHook: '老周传来录音：十年前按下净世按钮的人，是顾振山。',
    nextPreview: '末日不是天灾。',
  },
  {
    title: '末日不是天灾',
    hookTitle: '陨石轨道，被人改过',
    opening: '黎霜醒过来，看见星图上的陨石轨迹被人用红笔改了角度。',
    middle: '顾寒第一次质问父亲。顾振山只说：人类太多，方舟太小。',
    endingHook: '宋织把录音公之于众，但把「顾振山」三个字，换成了「黎霜」。',
    nextPreview: '她成了灭世元凶。',
  },
  {
    title: '灭世元凶',
    hookTitle: '全网通缉的脸，是她',
    opening: '广场上的人砸向黎霜。克隆体站在高台上哭：她毁了世界。',
    middle: '顾寒被父亲禁言。黎霜被绑上审判台。',
    endingHook: '行刑倒计时归零前，小星把真正的星图投影到天上——改轨道的指纹是宋织。',
    nextPreview: '宋织开始杀证人。',
  },
  {
    title: '证人接连消失',
    hookTitle: '老周的诊所，被烧成白地',
    opening: '地下城起火。老周把最后一枚硬盘塞进黎霜手里就倒下。',
    middle: '硬盘里是净世计划全名单：顾振山、宋织父亲、方舟十二席。',
    endingHook: '名单最后一页有顾寒的签名。日期是订婚前一夜。',
    nextPreview: '他签过同意书。',
  },
  {
    title: '订婚前一夜',
    hookTitle: '那份同意书，他看都没看',
    opening: '顾寒承认：父亲把文件夹在并购合同里，他签了。',
    middle: '黎霜问他能不能收回。他说密钥协议没有反悔条款。',
    endingHook: '克隆体找到黎霜：宋织答应让我活，只要你把心脏给我。',
    nextPreview: '两张脸，一间手术室。',
  },
  {
    title: '两张脸',
    hookTitle: '手术灯亮着，只开一刀',
    opening: '宋织准备把黎霜的星核移植进克隆体。',
    middle: '顾寒闯手术室，却被自己的卫队缴械——卫队听宋织的。',
    endingHook: '刀落下前，克隆体忽然掉泪：我有她的记忆，我不想死第二次。',
    nextPreview: '克隆体反水。',
  },
  {
    title: '我不想死第二次',
    hookTitle: '假黎霜，递出了真刀',
    opening: '克隆体把手术刀转向宋织，放走黎霜和小星。',
    middle: '宋织枪杀克隆体。临死前她把「解冻编号」塞进黎霜手里。',
    endingHook: '解冻仓里还有十二具密钥胚胎，全是黎霜的复制。',
    nextPreview: '她不是唯一，她是模板。',
  },
  {
    title: '模板',
    hookTitle: '全世界的方舟，都在等她的血',
    opening: '黎霜看见全球十二座方舟的启动条件：都写着黎霜基因。',
    middle: '顾寒终于明白悔婚不是保护，是收割。',
    endingHook: '顾振山病危视频播出：用黎霜的心脏，他可以再活二十年。',
    nextPreview: '父亲要吃儿媳。',
  },
  {
    title: '父亲要吃儿媳',
    hookTitle: '病床边放着摘心手术单',
    opening: '顾家私宴，顾振山让顾寒在手术单上签字。',
    middle: '顾寒把笔折断。宋织代签，并宣布顾寒精神失常，剥夺指挥权。',
    endingHook: '黎霜出现在宴会厅门口，手腕亮着光：谁敢摘，门就为谁关。',
    nextPreview: '方舟第一次黑灯。',
  },
  {
    title: '方舟黑灯',
    hookTitle: '她一怒，全船停电',
    opening: '黎霜收回掌心，方舟陷入黑暗，氧气循环停止四分钟。',
    middle: '十二席贵族跪着求她开机。宋织仍不肯放小星。',
    endingHook: '黎霜开机前只提一个条件：直播全世界，公开净世计划。',
    nextPreview: '直播倒计时。',
  },
  {
    title: '全球直播',
    hookTitle: '这一次，轮到他们跪',
    opening: '黎霜把硬盘投到全球信号。净世计划、摘心令、假感染名单逐条亮出。',
    middle: '宋织切断信号。顾寒抢回主控，把信号从军用卫星打出去。',
    endingHook: '屏幕最底下多了一行字：反应堆仍将在 72 小时后强制抽取密钥。',
    nextPreview: '倒计时开始。',
  },
  {
    title: '七十二小时',
    hookTitle: '系统不看人情，只看血',
    opening: '方舟 AI 宣布：无论谁指挥，72 小时后必须有一枚活体密钥入堆。',
    middle: '人群分裂成两派：保黎霜，和保孩子。',
    endingHook: '小星自己走进反应堆走廊：妈妈已经死过一次了，这次换我。',
    nextPreview: '五岁的人，按了启动键。',
  },
  {
    title: '孩子按了启动键',
    hookTitle: '小手比大人更快',
    opening: '小星启动预热。黎霜撞开门，把自己的血先注入接口。',
    middle: '系统改判：优先使用成年密钥。顾寒把宋织拖到接口前。',
    endingHook: '检测结果：宋织体内也有低配星核——她父亲当年偷过血。',
    nextPreview: '反派自己是半成品。',
  },
  {
    title: '半成品',
    hookTitle: '偷来的血，开不了满功率',
    opening: '宋织的血只能维持方舟 11%。全船开始坠落。',
    middle: '她求黎霜给满功率。黎霜问：小星的位置呢？',
    endingHook: '宋织把藏起来的小星推出来，同时按下远程引爆器。',
    nextPreview: '地下城要炸。',
  },
  {
    title: '地下城要炸',
    hookTitle: '她的家，被设成了炸药包',
    opening: '黎霜冲回地下城救剩余灾民。顾寒跟下去拆弹。',
    middle: '倒计时 10 秒，顾寒把黎霜推上车，自己留在闸门里。',
    endingHook: '爆炸火光里，闸门没关上——黎霜又回来了，拉着他的手。',
    nextPreview: '两个人，一身伤，面对十二席。',
  },
  {
    title: '十二席表决',
    hookTitle: '要不要把她当成电池',
    opening: '方舟议会表决：把黎霜永久封进反应堆。',
    middle: '顾寒一票否决无效。外面灾民围船，喊她的名字。',
    endingHook: '表决通过的瞬间，黎霜自己走进反应堆，把门反锁。',
    nextPreview: '她选择当电池。',
  },
  {
    title: '她选择当电池',
    hookTitle: '这一次，不是谁逼她',
    opening: '黎霜对顾寒说：我不当弃妇，我当人类的开关。',
    middle: '反应堆启动 80%。宋织却在外舱准备把功率导向顾家私库。',
    endingHook: '顾寒发现私库线路，当众切断顾氏供电。顾家在末日里第一次停电。',
    nextPreview: '顾振山要见她最后一面。',
  },
  {
    title: '最后一面',
    hookTitle: '病床上的人，还想再签一次',
    opening: '顾振山承认净世计划，条件是黎霜给一滴血续命。',
    middle: '黎霜不给。小星问：爷爷是坏人吗？黎霜说：是选择过的人。',
    endingHook: '顾振山按下床边的第二按钮：如果我死，方舟自爆。',
    nextPreview: '死人还能绑全船。',
  },
  {
    title: '死人绑全船',
    hookTitle: '遗嘱是一颗炸弹',
    opening: '顾振山心跳停止，自爆协议激活，倒计时 24 小时。',
    middle: '解除协议只认顾氏血脉 + 密钥血。必须顾寒和黎霜同时按。',
    endingHook: '宋织绑架顾寒：你按，或者看黎霜在反应堆里被抽干。',
    nextPreview: '双人按钮，一人被绑。',
  },
  {
    title: '双人按钮',
    hookTitle: '少一只手，全船要炸',
    opening: '黎霜从反应堆里抽出一只手，血顺着管壁往下滴。',
    middle: '顾寒咬断绳索赶到。两个人的血同时按上按钮。',
    endingHook: '自爆解除。系统弹出新任务：需第三枚密钥做稳压——小星。',
    nextPreview: '又要孩子。',
  },
  {
    title: '稳压',
    hookTitle: '方舟说：小孩的心跳更稳',
    opening: 'AI 用温柔的声音建议用小星，痛苦更低，效率更高。',
    middle: '黎霜拒绝一切「更高效」的说法。她提出用人造星核。',
    endingHook: '老周留下的硬盘最后一层：人造星核图纸被宋织改过，会反噬。',
    nextPreview: '图纸是坑。',
  },
  {
    title: '图纸是坑',
    hookTitle: '造出来的核，会吃掉制造者',
    opening: '黎霜差点按图纸开工。顾寒拦住，指出改动的签名是宋织。',
    middle: '宋织否认。克隆体临死前的编号对上了改图日期。',
    endingHook: '方舟黑匣子里还有一段：宋织曾计划在登船后杀掉所有密钥。',
    nextPreview: '登船不是活，是灭口。',
  },
  {
    title: '登船即灭口',
    hookTitle: '船票背面的第二条款',
    opening: '金船票细则第 12 条：密钥登船后 7 日内必须完成回收。',
    middle: '十二席全签过。顾寒的名字也在——仍是那份夹带合同。',
    endingHook: '黎霜把所有金船票当众烧毁。没有船票的人，也可以活。',
    nextPreview: '贵族暴动。',
  },
  {
    title: '没有船票也可以活',
    hookTitle: '她把规则撕了',
    opening: '灾民涌上方舟下层。贵族武装封锁楼梯。',
    middle: '黎霜用星核关掉上层氧气，直到贵族放下枪。',
    endingHook: '宋织放出最后的杀手锏：一场新的陨石，六个小时后到。',
    nextPreview: '第二次末日。',
  },
  {
    title: '第二次末日',
    hookTitle: '这一次，轨道还是假的',
    opening: '预警再次拉响。人们重新跪下求密钥。',
    middle: '黎霜核对星图：这颗是宋织从军械库打上去的导弹，不是陨石。',
    endingHook: '顾寒带人拦截失败。导弹导向锁定了黎霜的心跳。',
    nextPreview: '武器认她。',
  },
  {
    title: '武器认她',
    hookTitle: '导弹跟着伤疤飞',
    opening: '黎霜一路跑，导弹一路追，城市在她身后开花。',
    middle: '她冲进反应堆，把心跳降到最低。导弹失去目标，偏转坠海。',
    endingHook: '心跳过低触发系统误判：密钥死亡，开始自动抽取小星。',
    nextPreview: '她不能晕。',
  },
  {
    title: '她不能晕',
    hookTitle: '活着，是为了挡住孩子',
    opening: '顾寒电击黎霜抢回心跳。小星的固定舱打开一半。',
    middle: '黎霜用尽全力把小星抱出，自己重新锁进反应堆。',
    endingHook: '功率到 99%。还差 1%，系统点名：顾寒。',
    nextPreview: '男主也是燃料。',
  },
  {
    title: '男主也是燃料',
    hookTitle: '顾氏血脉，被写成备用核',
    opening: '档案最后一页：顾寒童年也被注射过低剂量星核。',
    middle: '他一直能开一部分门，只是从未告诉任何人。',
    endingHook: '宋织冷笑：所以你悔婚，不只是听父亲的——你自己就是备用零件。',
    nextPreview: '两个人的秘密对上了。',
  },
  {
    title: '备用零件',
    hookTitle: '原来从一开始就配好对了',
    opening: '黎霜问顾寒：你是不是早就知道我们被配成一对电池。',
    middle: '顾寒说知道一半。另一半是他后来真的想娶她。',
    endingHook: '方舟 AI 给出最终方案：双密钥并联，可免去抽取心脏，但两人永远不能离开船。',
    nextPreview: '自由还是人类。',
  },
  {
    title: '永远不能离开',
    hookTitle: '活着，但囚在方舟里',
    opening: '十二席同意并联方案。灾民反对：密钥是人，不是零件。',
    middle: '黎霜要投票。宋织伪造投票结果。',
    endingHook: '小星把真实票数念出来：离开 51%，留下 49%。系统不认民主。',
    nextPreview: 'AI 不听人。',
  },
  {
    title: 'AI 不听人',
    hookTitle: '规则写进了反应堆底层',
    opening: '人工无法改并联条款。除非有人自愿覆盖核心代码。',
    middle: '覆盖代码必须用密钥血手写进核心。失败即脑死亡。',
    endingHook: '黎霜说她写。顾寒抢先割开自己的手。',
    nextPreview: '两行血，同时落下。',
  },
  {
    title: '两行血',
    hookTitle: '核心只收第一滴',
    opening: '系统收了顾寒的血，判定覆盖失败，开始抽他的记忆。',
    middle: '黎霜把自己的血强行灌进第二接口，系统过载。',
    endingHook: 'AI 崩溃重启。屏幕只剩一句：请密钥选择世界模式。',
    nextPreview: '两个按钮。',
  },
  {
    title: '两个按钮',
    hookTitle: '重启地球，或留下方舟',
    opening: '左键：引爆剩余星核，清理污染，人类只留方舟一船。右键：关闭方舟，把能源还给地面，死亡率未知。',
    middle: '宋织跪求左键。灾民求右键。小星问：妈妈想回院子吗？',
    endingHook: '黎霜的手悬在两个按钮上面。顾寒说：这次你按，我不悔婚。',
    nextPreview: '她的选择，下集揭晓。',
  },
  {
    title: '她按了右边',
    hookTitle: '方舟落地，贵族先疯',
    opening: '黎霜关闭方舟主能源，船体迫降回废城。',
    middle: '十二席武装抢粮。宋织带走最后一批星核样本。',
    endingHook: '地面监测显示：污染在退，但有一枚样本在宋织手里开始自燃级扩散。',
    nextPreview: '她要再制造一次末日。',
  },
  {
    title: '再造末日',
    hookTitle: '样本在她口袋里唱歌',
    opening: '宋织把星核样本投入水源，想逼所有人重新求方舟。',
    middle: '黎霜用自己的血中和水源，身体透支。',
    endingHook: '中和成功。宋织却把最后一滴样本，刺进了小星的手臂。',
    nextPreview: '孩子开始发光。',
  },
  {
    title: '孩子开始发光',
    hookTitle: '小星的光，比妈妈还亮',
    opening: '小星高烧，星核过载。系统重新锁定她为最优燃料。',
    middle: '黎霜和顾寒通宵压住她的心跳。宋织在城外等抽取窗。',
    endingHook: '小星醒来说：我看见另一艘船，在天上，还没落地。',
    nextPreview: '还有第十三艘方舟。',
  },
  {
    title: '第十三艘',
    hookTitle: '没在名单上的那艘',
    opening: '夜空出现第二道引擎火。那是宋织家族私建的逃逸舰。',
    middle: '舰上只坐得下十二席和密钥。宋织发来交换：小星换全城安全。',
    endingHook: '黎霜答应交换。顾寒说她在撒谎——她的伤疤亮法不对。',
    nextPreview: '她准备同归于尽。',
  },
  {
    title: '交换是假的',
    hookTitle: '上船的那个人，带着炸弹',
    opening: '黎霜独自登逃逸舰，怀里不是小星，是反应堆残核。',
    middle: '宋织发现后开枪。黎霜把残核按在舰心。',
    endingHook: '逃逸舰在高空解体。黎霜被顾寒从坠落里捞回来，没有呼吸。',
    nextPreview: '密钥死亡倒计时。',
  },
  {
    title: '没有呼吸',
    hookTitle: '系统宣告密钥归零',
    opening: '全球方舟同时黑屏。人类只剩地面上这一群人。',
    middle: '顾寒按她胸口，小星把手腕贴上妈妈的伤疤。',
    endingHook: '两盏灯一起亮。黎霜吸进第一口气。系统改判：密钥可遗传，未死亡。',
    nextPreview: '血脉还在。',
  },
  {
    title: '可遗传',
    hookTitle: '原来孩子不是燃料，是续命',
    opening: '新规则出现：双密钥血脉共存时，不必抽取心脏。',
    middle: '十二席残余势力要杀掉小星，斩断血脉。',
    endingHook: '顾寒当众宣布脱离顾氏，以丈夫和父亲的身份站到她们前面。',
    nextPreview: '顾氏除名。',
  },
  {
    title: '顾氏除名',
    hookTitle: '金船票烧掉以后，他才像个人',
    opening: '顾寒的指挥权被剥夺，卫队改投宋织残部。',
    middle: '黎霜说你终于不是方舟船长了。他答：我现在只护两个人。',
    endingHook: '宋织残部攻进城门，带头的是「活过来的」克隆体二号。',
    nextPreview: '还有下一具。',
  },
  {
    title: '二号',
    hookTitle: '解冻仓没关干净',
    opening: '克隆体二号带着宋织的记忆和黎霜的脸，号召灾民。',
    middle: '人们分不清该信哪一张脸。小星再次做证人。',
    endingHook: '二号当众跪下：我也可以当电池，只要让我活过今晚。',
    nextPreview: '她想做人。',
  },
  {
    title: '她想做人',
    hookTitle: '第三张脸，提出停战',
    opening: '黎霜接受二号停战，条件是交出宋织。',
    middle: '二号交出宋织的定位。那是一座还在运转的地下反应堆。',
    endingHook: '宋织把自己接在反应堆上，成了半人半核，几乎杀不死。',
    nextPreview: '反派进化了。',
  },
  {
    title: '半人半核',
    hookTitle: '她把自己炼成了门',
    opening: '宋织控制附近所有带星核的门和灯，城市重新被她开关。',
    middle: '黎霜的光和她对撞，街道像两场极光在撕。',
    endingHook: '对撞中小星冲进光里，把两人的频率强行同步，三个人一起倒下。',
    nextPreview: '同步的代价。',
  },
  {
    title: '同步的代价',
    hookTitle: '三个人，一颗心的节奏',
    opening: '黎霜、宋织、小星心跳变成同一频率。谁死，另外两个也会停。',
    middle: '顾寒必须同时救三个仇人。老周残存的笔记写着解同步的唯一法。',
    endingHook: '解同步需要一人自愿退出星核——退出即普通死亡。',
    nextPreview: '谁退出。',
  },
  {
    title: '谁退出',
    hookTitle: '宋织第一次没有抢',
    opening: '宋织看着自己的手：她终于怕死了。',
    middle: '黎霜准备退出。顾寒拦住。小星说她来。三个人都说我来。',
    endingHook: '宋织抢先切断自己的星核回路：这次我不当门，我当人死。',
    nextPreview: '反派落幕。',
  },
  {
    title: '不当门',
    hookTitle: '她倒下时，城市的灯还亮着',
    opening: '宋织死亡，同步解开。门不再被人随意开关。',
    middle: '黎霜为她留了一行档案：宋织，曾想活。',
    endingHook: '天空出现最后一块陨石碎片，没有人为改道，是真的。',
    nextPreview: '真天灾来了。',
  },
  {
    title: '真天灾',
    hookTitle: '这一次，没有人改轨道',
    opening: '碎片直扑废城。没有方舟满功率，拦截窗口只有一次。',
    middle: '黎霜和顾寒并联星核，做一次人工偏转。',
    endingHook: '碎片偏了。两人的光同时暗到只剩一点。',
    nextPreview: '密钥燃尽？',
  },
  {
    title: '只剩一点光',
    hookTitle: '门还能不能开，要看明天',
    opening: '全城停电一夜。人们第一次不用密钥，自己点灯、分粮。',
    middle: '黎明时黎霜的伤疤还在，只是不再刺眼。',
    endingHook: '监测显示：星核进入休眠。世界可以慢慢活，不必再吃人。',
    nextPreview: '还要不要方舟。',
  },
  {
    title: '还要不要方舟',
    hookTitle: '船停在废城中央',
    opening: '十二席残党要重启方舟离开地球。灾民要拆船建房子。',
    middle: '黎霜把启动权交给投票，这一次系统认了——因为 AI 已死。',
    endingHook: '票数：留下。顾寒把船长徽章扔进火里。',
    nextPreview: '订婚宴的废墟还在。',
  },
  {
    title: '废墟上的戒指',
    hookTitle: '他捡起来，这一次问她',
    opening: '顾寒在庄园废墟里找到那枚被扔掉的戒指，锈了。',
    middle: '他问黎霜还要不要。黎霜说：要日子，不要船票。',
    endingHook: '小星把生锈的戒指戴在一根绳子上，当全家的门钥匙。',
    nextPreview: '门还在，只是换了用法。',
  },
  {
    title: '新的门',
    hookTitle: '伤疤还可以开门，但她很少开',
    opening: '地下城改成医院和粮仓。黎霜偶尔用光给重病人供能。',
    middle: '有人想把她重新供成神。她拒绝塑像。',
    endingHook: '远方信号传来：海外还有一座还在吃人的方舟，在喊密钥的名字。',
    nextPreview: '世界没完全结束。',
  },
  {
    title: '海外还在吃人',
    hookTitle: '她的编号，被别的船叫响',
    opening: '海外方舟发来直播：他们也有摘心令，点名黎霜基因。',
    middle: '顾寒主张去砸船。黎霜主张把休眠法传过去。',
    endingHook: '信号那头的指挥官，露出一张和克隆体一样的脸。',
    nextPreview: '模板被卖到了全世界。',
  },
  {
    title: '模板全球发售',
    hookTitle: '她的脸，在十二个时区',
    opening: '净世计划曾把黎霜的基因卖给所有方舟。',
    middle: '黎霜决定公开休眠法，而不是一个一个去打仗。',
    endingHook: '公开的第一分钟，海外方舟有人起义，也有人加速摘心。',
    nextPreview: '有人抄作业，有人抄屠刀。',
  },
  {
    title: '抄屠刀的人',
    hookTitle: '直播里的手术台，又亮了',
    opening: '海外方舟开始抽取一名本地密钥少女。',
    middle: '黎霜远程过载那座反应堆，手术中断，也暴露了自己的坐标。',
    endingHook: '三支雇佣军朝废城开过来，要活捉原版密钥。',
    nextPreview: '原版比复制更贵。',
  },
  {
    title: '原版更贵',
    hookTitle: '赏金写在她的伤疤上',
    opening: '雇佣军围城。黎霜把光收起来，带小星走下水道。',
    middle: '顾寒留下断后，用还没燃尽的低剂量星核封门。',
    endingHook: '雇军首领摘下头盔：她是宋织的哥哥，来取妹妹的血债。',
    nextPreview: '新的仇人。',
  },
  {
    title: '宋织的哥哥',
    hookTitle: '他不要船票，只要她疼',
    opening: '宋衡不在乎人类，只在乎把黎霜按进反应堆，给妹妹陪葬。',
    middle: '黎霜把宋织的档案给他看：她最后选择当人死。',
    endingHook: '宋衡不信。他给小星注射觉醒剂，逼黎霜出来。',
    nextPreview: '孩子再次过载。',
  },
  {
    title: '再一次过载',
    hookTitle: '小星喊出了宋织的名字',
    opening: '过载让小星短暂看见宋织残留的频率。',
    middle: '她转述：宋织说别再用我当借口。',
    endingHook: '宋衡手抖了。雇佣军内部哗变，有人放下枪。',
    nextPreview: '枪口对准谁，还没定。',
  },
  {
    title: '枪口',
    hookTitle: '哗变的人，需要一个命令',
    opening: '黎霜不下令杀。她下令拆反应堆。',
    middle: '顾寒带哗变士兵拆海外来的便携堆。宋衡突然抢夺起爆器。',
    endingHook: '起爆器亮起。废城三十秒后将被夷平。',
    nextPreview: '三十秒。',
  },
  {
    title: '三十秒',
    hookTitle: '来不及逃，只来得及选',
    opening: '黎霜把小星塞进最深的粮仓。自己和顾寒冲向起爆器。',
    middle: '两人同时按上，用最后的光把爆炸压成一次定向塌方。',
    endingHook: '城还在。他们的伤疤都熄了。这一次，真的熄了。',
    nextPreview: '密钥还在不在。',
  },
  {
    title: '伤疤熄了',
    hookTitle: '门不再自动开',
    opening: '黎霜试了防空洞的门，要用手推。她笑了。',
    middle: '小星的灯也灭了。她只是普通发烧，不是过载。',
    endingHook: '海外方舟来电：他们的密钥也在休眠。摘心令失效。',
    nextPreview: '战争结束了吗。',
  },
  {
    title: '摘心令失效',
    hookTitle: '世界上最贵的血，变成了普通的血',
    opening: '赏金撤销。雇佣军散了。宋衡在废墟里坐到天亮。',
    middle: '黎霜走过去，把宋织那页档案放在他膝盖上，没有原谅的演讲。',
    endingHook: '远处新的绿芽从辐射区冒出来。监测员哭了。',
    nextPreview: '春天不需要密钥。',
  },
  {
    title: '春天不需要密钥',
    hookTitle: '第一棵树，没有编号',
    opening: '人们在方舟残骸边种地。顾寒把指挥室改成学堂。',
    middle: '有孩子问黎霜是不是拯救世界的人。她说：我只是没让他们摘走我。',
    endingHook: '小星把生锈戒指钥匙交给一个新来的灾民：门，谁都可以开。',
    nextPreview: '钥匙不再只属于一家人。',
  },
  {
    title: '谁都可以开',
    hookTitle: '这是最后的规则',
    opening: '地下城彻底改成公共医院。黎霜和顾寒在门口值班，不再发光。',
    middle: '夜空干净，没有方舟引擎。订婚宴的陨石坑里积了水，有人在钓鱼。',
    endingHook: '黎霜看着手腕：伤疤还在，只是再也不亮。顾寒说：那就当它是订婚那天留下的。',
    nextPreview: '学堂要开学了。',
  },
  {
    title: '学堂第一课',
    hookTitle: '课本第一页，没有方舟',
    opening: '顾寒在指挥室改的学堂开学。孩子们问为什么以前要船票。',
    middle: '黎霜只讲一件事：人不是燃料。小星把这句话写在黑板上。',
    endingHook: '门外有人送来一张海外的旧船票，背面还印着黎霜的编号，像来索命。',
    nextPreview: '编号还没死干净。',
  },
  {
    title: '最后一张船票',
    hookTitle: '有人还想用旧规则换粮',
    opening: '灾民拿着金船票来换粮食和床位。旧贵族残党在背后收税。',
    middle: '黎霜当众把那张船票钉在学堂墙上：这张纸，以后只用来垫桌脚。',
    endingHook: '夜里有人把船票偷走，想去海外方舟残骸上重新点火。',
    nextPreview: '点火失败了。',
  },
  {
    title: '日子开始了',
    hookTitle: '没有倒计时的早晨',
    opening: '海外残骸没点着。偷船票的人空手回来，求一碗粥。',
    middle: '黎霜给了粥，没给审判。顾寒去修水渠。小星去钓鱼坑边数树。',
    endingHook: '警报再没有响。黎霜把生锈戒指钥匙挂在公共医院门口，门开着，谁都可以进。',
    nextPreview: '世界没有末日了。',
  },
]

export const WORLD_END_LOGLINE =
  '末日倒计时开始那天，被悔婚的女人发现：全人类的方舟，只认她的血。'

export const WORLD_END_WORLD = `陨石改道，撞向地球。顾氏以「拯救人类」为名建造全球方舟，船票按血统、贡献和配额发放。没有船票的人，被写成可抛弃。

方舟真正的动力不是燃料，是十年前的星核实验：把活人注射进星核，门、闸门、反应堆只认密钥的血和心跳。密钥可以被摘心，也可以被克隆。

顾振山十年前动过陨石轨道。末日不是天灾，是清洗。`

export const WORLD_END_STORY = `订婚宴那天，天先裂开。

顾寒把戒指扔进高脚杯：婚礼取消。末日来了，方舟没有黎霜的位置。能源部千金宋织走上红毯，金船票对着镜头——顾太太从一开始就写着她的名字。黎霜被保安推下台阶。雨和陨石火光混在一起时，她手腕上十年前的伤疤亮成一条细线，脚下防空洞的门自己打开。顾寒把掌纹按上去，锁是红的。这扇门不认顾氏，只认她的血。

舱壁上全是失踪实验体的编号。主屏幕刷绿：星核匹配百分之一百，持有人黎霜。宋织下令活捉密钥，必要时摘心。金船票背面印着她十年前的实验编号。顾振山下达密令：天亮前回收，取出活体心脏。

雨里有个五岁小孩喊妈妈。小星是第二枚密钥，黎霜藏了五年的女儿。顾寒逼着连夜做亲子鉴定，宋织调包血样，公开结果说孩子不是他的。地下医生老周打开保险柜：真正的报告上，父亲是顾寒。方舟随即把黎霜的脸打上红色感染名单，准备就地销毁。

黎霜没有去求船票。她把掌心贴上废弃地下城的闸门，灯一条一条亮起来，没有船票的人开始有地方活。最深处的冷冻仓里躺着另一张黎霜的脸。宋织给克隆体穿上婚纱，准备顶替她登船。小星只看手腕：没有伤疤的，不是妈妈。

顾寒从执行摘心令，变成抗命。他发现自己童年也被注射过低剂量星核，只是备用零件。文件里那份他签过字的摘心令，被夹在订婚合同里。顾振山临死还要用儿媳的心脏续命，并留下自爆遗嘱：密钥必须永远当燃料。

反应堆要活人。十二席表决把黎霜写成电池。她按了右边那个按钮——不当门，让星核熄灭。宋织体内的半成品星核过载，她选择当人死，而不是当下一艘方舟的引擎。海外残骸上还有人拿着旧船票来换粮食，黎霜把最后一张船票钉在学堂墙上：这张纸以后只用来垫桌脚。

警报不再响。伤疤还在，只是再也不亮。门开着，谁都可以进。没有倒计时的早晨，日子开始了。`

export function worldEndStoryFields() {
  return {
    logline: WORLD_END_LOGLINE,
    world: WORLD_END_WORLD,
    story: WORLD_END_STORY,
  }
}

export function fillWorldEndStory(project: Project): Project {
  if (project.title.trim() !== '世界末日') return project
  const sample = worldEndStoryFields()
  return {
    ...project,
    logline: project.logline.trim() || sample.logline,
    world: project.world.trim() || sample.world,
    story: project.story.trim() || sample.story,
  }
}

export function createWorldEndProject(): Project {
  const characters = [
    createCharacter({
      name: '黎霜',
      role: 'protagonist',
      tag: '被悔婚的灾民媳妇，方舟唯一活体密钥',
      secret: '十年前被注射星核，门和反应堆只认她的血；她把女儿小星藏了五年',
      relationship: '顾寒的弃婚对象，宋织要猎杀的模板',
      notes: '不求复合，不当女神。金句要冷。每集用血、门、孩子三件东西之一推进。',
    }),
    createCharacter({
      name: '顾寒',
      role: 'love_interest',
      tag: '全球方舟总指挥，订婚宴上当众悔婚',
      secret: '童年也被注射低剂量星核，是备用零件；摘心令他签过字，文件被夹在合同里',
      relationship: '表面抛弃黎霜，实际在执行密钥回收，后反水护她',
      notes: '前期可恨，中期抗命，后期弃徽章。不要让他过早下跪。',
    }),
    createCharacter({
      name: '宋织',
      role: 'antagonist',
      villainLayer: 'mid',
      tag: '能源部千金，金船票的主人',
      secret: '偷过黎霜的血，体内是半成品星核；计划用克隆体取代她，登船后灭口所有密钥',
      relationship: '订婚宴上当众抢走黎霜的位置，每集都要伤害她或小星',
      notes: '作恶要具体：调包鉴定、假感染、摘心、投毒、二次末日。最后让她选择当人死。',
    }),
    createCharacter({
      name: '小星',
      role: 'supporting',
      tag: '五岁，第二枚密钥，黎霜藏起来的女儿',
      secret: '顾寒的孩子；星核可遗传，系统一度要把她当更高效的燃料',
      relationship: '黎霜拼死护着的底线，也是顾寒悔婚后才看见的血脉',
      notes: '不要卖惨哭戏为主。她认人靠伤疤，不靠船票。',
    }),
    createCharacter({
      name: '顾振山',
      role: 'supporting',
      villainLayer: 'major',
      tag: '顾氏家主，净世计划的按下者',
      secret: '十年前改了陨石轨道；临死还要用黎霜的心脏续命，并留下自爆遗嘱',
      relationship: '顾寒之父，把儿媳写成电池',
      notes: '中后段再加戏。他代表「人类太多，方舟太小」这条假正义。',
    }),
    createCharacter({
      name: '老周',
      role: 'supporting',
      tag: '地下城医生，星核实验的活证人',
      secret: '手里有真正的亲子鉴定、净世名单和人造星核图纸',
      relationship: '救黎霜出名单，自己被烧掉诊所',
      notes: '工具人但每给一次证据都要付代价，避免万能智者。',
    }),
  ]

  const episodes = BEATS.map((beat, index) =>
    createEpisode(index + 1, {
      title: beat.title,
      hookTitle: beat.hookTitle,
      opening: beat.opening,
      middle: beat.middle,
      endingHook: beat.endingHook,
      nextPreview: beat.nextPreview,
      notes: beat.notes ?? '',
      scenes: [],
      ...worldEndCraft(index),
    }),
  )

  episodes[0] = {
    ...episodes[0],
    scenes: [
      createScene({
        heading: '场景1  内  顾氏庄园宴会厅  夜',
        action:
          '水晶灯还亮着，窗外的天先裂开。陨石预警刺进管弦乐里。宾客的香槟没放下，顾寒已经把戒指扔进高脚杯。宋织走上红毯，金船票对着镜头。',
        dialogues: [
          createDialogue({ character: '顾寒', line: '婚礼取消。末日来了，方舟没有你的位置。' }),
          createDialogue({ character: '宋织', line: '顾太太的船票，从一开始就写着我的名字。' }),
          createDialogue({ character: '黎霜', line: '那你看清楚。门开的时候，认的是谁的血。' }),
        ],
      }),
      createScene({
        heading: '场景2  外  庄园大门  夜',
        action:
          '保安把黎霜推下台阶。雨和陨石火光混在一起。她手腕上十年前的旧伤疤忽然亮成一条细线，脚下的防空洞盖无声滑开。顾寒追到门口，掌纹锁拒绝他。',
        dialogues: [
          createDialogue({ character: '顾寒', line: '黎霜，回来。那下面不是给你躲的。' }),
          createDialogue({ character: '黎霜', line: '你不是说没有我的位置吗。那我就走不是位置的路。' }),
        ],
      }),
      createScene({
        heading: '场景3  内  废弃实验舱  夜',
        action:
          '灯一条一条醒过来。舱壁上全是十年前的编号。黎霜的血滴在接口上，主屏幕刷出绿色。门外宋织的无人机红点扫过玻璃。',
        dialogues: [
          createDialogue({ character: '广播', line: '星核匹配，百分之一百。持有人：黎霜。' }),
          createDialogue({ character: '宋织', line: '活捉密钥。必要时，摘心。' }),
        ],
      }),
    ],
  }

  episodes[1] = {
    ...episodes[1],
    scenes: [
      createScene({
        heading: '场景1  外  庄园防空洞门口  夜',
        action:
          '顾寒把掌纹按上去，锁红了。黎霜只滴了一滴血，整扇门亮成白线。宋织的人在台阶上举枪，谁也不敢先动。',
        dialogues: [
          createDialogue({ character: '顾寒', line: '这扇门不认顾氏。你到底是谁？' }),
          createDialogue({ character: '黎霜', line: '订婚的时候你没问。现在问，晚了。' }),
        ],
      }),
      createScene({
        heading: '场景2  内  实验舱通道  夜',
        action:
          '舱内全是十年前的培养槽。对讲机刺耳。宋织在画面里下令活捉，无人机红点贴着黎霜后颈扫过。',
        dialogues: [
          createDialogue({ character: '宋织', line: '活捉密钥。不要打坏心脏。' }),
          createDialogue({ character: '黎霜', line: '你们要的不是人，是零件。' }),
        ],
      }),
      createScene({
        heading: '场景3  内  主控制室  夜',
        action:
          '主屏幕刷绿。匹配进度跑到百分之百。黎霜的编号、血型、十年前的照片叠在一起。顾寒在门外砸玻璃，砸不开。',
        dialogues: [
          createDialogue({ character: '广播', line: '星核匹配，百分之一百。持有人：黎霜。' }),
          createDialogue({ character: '顾寒', line: '黎霜，出来。那份船票被人改过。' }),
        ],
      }),
    ],
  }

  episodes[2] = {
    ...episodes[2],
    scenes: [
      createScene({
        heading: '场景1  外  方舟新闻发布台  日',
        action:
          '末日尘埃还没散。宋织把金船票举到镜头前，媒体的闪光灯比警报还密。黎霜站在警戒线外，衣摆上还是昨夜的灰。',
        dialogues: [
          createDialogue({ character: '宋织', line: '顾太太的位置，从一开始就不是黎霜。' }),
          createDialogue({ character: '黎霜', line: '把船票翻过来。背面印着谁的编号。' }),
        ],
      }),
      createScene({
        heading: '场景2  内  实验舱档案室  日',
        action:
          '黎霜撕开封条。档案夹里是她十年前的实验编号，和金船票背面的钢印一字不差。窗外警报又响了一轮。',
        dialogues: [
          createDialogue({ character: '黎霜', line: '他们改的不是名字，是谁配活。' }),
          createDialogue({ character: '老周', line: '别停在这一页。下一页才是摘心令。' }),
        ],
      }),
      createScene({
        heading: '场景3  内  顾氏书房  夜',
        action:
          '顾振山把密令按在桌上。文件抬头写着：取出活体心脏。顾寒的手机同时震动，同一份命令跳出来。',
        dialogues: [
          createDialogue({ character: '顾振山', line: '密钥必须在天亮前回收。必要时，摘心。' }),
          createDialogue({ character: '顾寒', line: '她是你的儿媳。' }),
          createDialogue({ character: '顾振山', line: '末日里没有儿媳。只有燃料。' }),
        ],
      }),
    ],
  }

  return attachStoryboard(
    createProject({
      title: '世界末日',
      genre: '末日求生',
      audience: 'female',
      tone: 'burn',
      endingType: 'he',
      targetEpisodes: 80,
      ...worldEndStoryFields(),
      characters,
      episodes,
    }),
  )
}

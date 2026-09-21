import type { Project } from './types'
import { createCharacter, createDialogue, createEpisode, createProject, createScene } from './model'

export function createSampleProject(): Project {
  const characters = [
    createCharacter({
      name: '林晚',
      role: 'protagonist',
      tag: '被弃的灰姑娘，沈氏失踪千金',
      secret: '十年前车祸后被调包，真正身份是沈氏唯一继承人',
      relationship: '顾琛的弃婚妻子，苏曼的前闺蜜',
      notes: '不哭、不求、先翻盘再谈感情。金句要冷。',
    }),
    createCharacter({
      name: '顾琛',
      role: 'love_interest',
      tag: '顾氏总裁，傲慢悔婚',
      secret: '童年被父亲威胁，婚姻必须服从董事会',
      relationship: '当众羞辱林晚，后发现孩子和身份都不是他想的那样',
      notes: '前期可恨，中期慌，后期跪。每次出场都要给林晚添堵或添戏。',
    }),
    createCharacter({
      name: '苏曼',
      role: 'antagonist',
      tag: '假闺蜜，真上位者',
      secret: '调包亲子鉴定，并与顾父有交易',
      relationship: '表面是林晚伴娘，实际要抢顾太太位置',
      notes: '每集至少作恶一次：销毁证据、当众嘲讽、伪造遗嘱。',
    }),
    createCharacter({
      name: '沈老爷子',
      role: 'supporting',
      tag: '沈氏掌门，重病寻女',
      secret: '当年车祸现场还有第二份监控',
      relationship: '林晚生父，顾氏最大的合作方',
      notes: '认亲是大高潮，不要过早上场。',
    }),
  ]

  const outlines: Array<{
    title: string
    hookTitle: string
    opening: string
    middle: string
    endingHook: string
    nextPreview: string
  }> = [
    {
      title: '婚礼上的私生子',
      hookTitle: '戒指扔进香槟塔的那一秒',
      opening: '顾琛在教堂当众悔婚，说孩子不是他的。',
      middle: '苏曼拿出被调包的亲子鉴定，宾客起哄，林晚被赶出红毯。',
      endingHook: '林晚把鉴定翻到最后一页——匹配的名字是顾父。',
      nextPreview: '顾家老爷子出现在侧廊。',
    },
    {
      title: '不是你的孩子',
      hookTitle: '顾父看了一眼报告，脸色变了',
      opening: '顾父要求立刻终止婚礼，并让林晚签放弃协议。',
      middle: '林晚被丢出顾家，苏曼以「照顾顾琛」的名义住进主卧。',
      endingHook: '沈氏律师在雨里拦住林晚：沈老爷子请你回去。',
      nextPreview: '一张十年前的旧照片。',
    },
    {
      title: '弃妇的底牌',
      hookTitle: '她不是来求复合的',
      opening: '律师出示林晚与沈氏千金的童年比对。',
      middle: '苏曼连夜销毁医院档案，林晚只抢到一枚旧玉佩。',
      endingHook: '玉佩内侧刻着沈氏家训，和新闻里失踪千金的佩饰一模一样。',
      nextPreview: '车祸当晚的监控还在。',
    },
    {
      title: '十年前的车祸',
      hookTitle: '监控里，抱走孩子的人不是司机',
      opening: '林晚潜入旧档室，调出车祸监控。',
      middle: '画面里苏曼的母亲抱走了真正的千金。顾琛开始暗中调查。',
      endingHook: '顾琛在苏曼包里发现第二份鉴定——她一直知道孩子是谁的。',
      nextPreview: '林晚踏进沈氏大楼。',
    },
    {
      title: '打脸从工牌开始',
      hookTitle: '前台：沈总请您直接上顶楼',
      opening: '苏曼在宴会嘲讽林晚来打工，当众扔支票。',
      middle: '林晚别上沈氏工牌，保安请苏曼出去。',
      endingHook: '沈老爷子看见玉佩，当众叫出「晚晚」。',
      nextPreview: '记者会直播倒计时。',
    },
    {
      title: '千金归来',
      hookTitle: '全网都在等她开口',
      opening: '认亲记者会，林晚第一次以沈氏继承人身份亮相。',
      middle: '顾琛冲到现场想解释，被保安拦下。苏曼抛出一份「沈氏遗嘱」。',
      endingHook: '遗嘱显示继承人另有其人——签名日期是车祸后第二天。',
      nextPreview: '假遗嘱对董事会。',
    },
    {
      title: '假遗嘱',
      hookTitle: '签字的人，十年前就死了',
      opening: '董事会临时表决，苏曼要把林晚赶出沈氏。',
      middle: '林晚请出笔迹鉴定和死亡证明，当场拆穿假遗嘱。',
      endingHook: '顾琛当众求复合，林晚只回一句：顾氏的合同，明天作废。',
      nextPreview: '苏曼狗急跳墙。',
    },
    {
      title: '不回头',
      hookTitle: '她把戒指还回去，连盒子都不要',
      opening: '顾琛堵在沈氏地下车库，把戒指盒打开。',
      middle: '林晚路过，连车窗都没降。苏曼绑架了沈老爷子的主治医生。',
      endingHook: '急救室灯亮起，医生失踪，沈老爷子的药被换过。',
      nextPreview: '真正的仇，才刚刚开始。',
    },
  ]

  const episodes = outlines.map((item, index) =>
    createEpisode(index + 1, {
      ...item,
      scenes: [],
    }),
  )

  episodes[0] = {
    ...episodes[0],
    notes: '第一集只做三件事：当众伤害、鉴定调包、钩子砸在顾父身上。不要解释身世。',
    scenes: [
      createScene({
        heading: '场景1  内  教堂  日',
        action:
          '管风琴停了。顾琛站在红毯尽头，把戒指扔进香槟塔。玻璃碎响里，宾客全站起来。林晚穿着婚纱，手里还捧着花。',
        dialogues: [
          createDialogue({ character: '顾琛', line: '婚礼取消。孩子不是我的。' }),
          createDialogue({ character: '宾客甲', line: '天哪，顾总这是……' }),
          createDialogue({ character: '林晚', line: '那你看清楚。这是谁的亲子鉴定。' }),
        ],
      }),
      createScene({
        heading: '场景2  内  教堂侧廊  日',
        action:
          '苏曼把一份文件塞进顾琛手里，妆一张没花。林晚被伴娘们拦住，婚纱裙摆踩在花瓣里。',
        dialogues: [
          createDialogue({
            character: '苏曼',
            line: '零匹配。她骗了你整整三个月，还想骗顾家一个孩子。',
          }),
          createDialogue({ character: '顾琛', line: '从今天起，顾氏不欠她任何东西。' }),
          createDialogue({ character: '林晚', line: '把最后一页翻开。' }),
        ],
      }),
      createScene({
        heading: '场景3  外  教堂门口  日',
        action:
          '雨忽然下来。林晚把裙摆从泥水里捞起来，没哭。一辆黑色迈巴赫停在台阶下，车窗降到一半。她把鉴定报告最后一页对着镜头——匹配人：顾振山。',
        dialogues: [
          createDialogue({
            character: '林晚',
            line: '顾琛，你今天扔掉的不是我，是顾氏的未来。',
          }),
          createDialogue({ character: '律师', line: '林小姐，沈老爷子请你回去。' }),
        ],
      }),
    ],
  }

  return createProject({
    title: '被弃千金',
    genre: '霸总逆袭',
    audience: 'female',
    targetEpisodes: 80,
    logline: '被全家抛弃的灰姑娘，其实是消失十年的财阀千金。',
    characters,
    episodes,
  })
}

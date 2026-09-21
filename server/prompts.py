"""把分集剧本拆成 MiniMax H3 可用的竖屏短剧提示词。"""

from __future__ import annotations

import re
import uuid
from typing import Any

TONE_CN = {
    "sweet": "甜",
    "hurt": "虐",
    "sweet_hurt": "甜虐",
    "payoff": "爽",
    "burn": "燃",
    "comedy": "搞笑",
}

HOOK_CN = {
    "suspense": "悬念",
    "reversal": "反转",
    "emotion": "情绪",
    "info": "信息披露",
    "crisis": "危机",
}

CLOSEUP_WORDS = ("鉴定", "戒指", "血", "门", "屏幕", "玉佩", "船票", "伤疤", "心脏", "报告")


def _text(value: Any) -> str:
    return str(value or "").strip()


def _uuid() -> str:
    return str(uuid.uuid4())


def _ts(seconds: float) -> str:
    total = max(0, int(round(seconds)))
    return f"{total // 60:02d}:{total % 60:02d}"


def _split_action(action: str) -> list[str]:
    chunks = [
        part.strip(" 。；;，,")
        for part in re.split(r"[。；;\n]+", action)
        if part.strip(" 。；;，,")
    ]
    if not chunks and action:
        return [action]
    if len(chunks) <= 3:
        return chunks
    head, tail = chunks[:-1], chunks[-1]
    mid = max(1, len(head) // 2)
    return [
        "。".join(head[:mid]) + "。",
        "。".join(head[mid:]) + "。",
        tail + "。",
    ]


def _shot_size(text: str, index: int, total: int) -> str:
    if any(word in text for word in CLOSEUP_WORDS):
        return "特写"
    if index == 0:
        return "全景" if total > 1 else "中景"
    if index == total - 1:
        return "特写"
    return "近景" if index % 2 else "中景"


def _parse_heading(heading: str) -> tuple[str, str, str]:
    raw = heading.replace("·", " ").replace("／", " ")
    interior = "内" if "外" not in raw else "外"
    time = "夜" if "夜" in raw else "日"
    place = re.sub(r"场景\s*\d+", "", raw)
    place = re.sub(r"\b(内|外|日|夜)\b", " ", place)
    place = re.sub(r"\s+", " ", place).strip(" -·") or "未标明地点"
    return interior, time, place


def _soundscape(interior: str, time: str, genre: str) -> str:
    if "末日" in genre:
        return "警报余响、碎石与风声，对白压过环境。"
    if interior == "外" and time == "夜":
        return "夜风、远处车声，对白清晰，不要嘈杂人潮盖过人声。"
    if interior == "外":
        return "日间环境底噪克制，对白贴耳。"
    if time == "夜":
        return "室内低频环境声，玻璃与脚步可闻，对白清楚。"
    return "室内安静现场声，对白清楚，不要背景音乐盖过人声。"


def _music(hook: str, tone: str, genre: str) -> str:
    if hook == "crisis":
        return "低弦骤紧，短促不安，不要完整旋律。"
    if hook == "reversal":
        return "反转落点加一声冷钢琴或弦乐刺音，随即收住。"
    if hook == "emotion" or tone in {"sweet", "sweet_hurt"}:
        return "克制的钢琴或弦乐垫底，情绪到了再抬，不要甜腻。"
    if "末日" in genre or tone == "burn":
        return "低频脉冲与远处轰鸣，燃点才给鼓点。"
    return "极简氛围垫，服务对白，不要主题曲抢戏。"


def _character_lock(project: dict[str, Any], names: list[str]) -> str:
    wanted = {name for name in names if name}
    lines: list[str] = []
    for person in project.get("characters") or []:
        name = _text(person.get("name"))
        if not name or (wanted and name not in wanted):
            continue
        tag = _text(person.get("tag"))
        bits = [name]
        if tag:
            bits.append(tag)
        lines.append("- " + "，".join(bits) + "。全程同一张脸、同一套造型，不要换人。")
    if not lines:
        return "- 保持本场出场人物身份前后一致，不要换脸。"
    return "\n".join(lines)


def _dialogues(scene: dict[str, Any]) -> list[str]:
    rows = []
    for item in scene.get("dialogues") or []:
        name = _text(item.get("character")) or "角色"
        line = _text(item.get("line"))
        if not line:
            continue
        rows.append(f"{name}：{line}")
    return rows


def _scene_cast(scene: dict[str, Any]) -> list[str]:
    names = []
    for item in scene.get("dialogues") or []:
        name = _text(item.get("character"))
        if name and name not in names:
            names.append(name)
    return names


def build_clip_prompt(
    project: dict[str, Any],
    episode: dict[str, Any],
    scene: dict[str, Any],
    *,
    duration: int,
    beats: list[tuple[str, str]],
    is_last: bool,
) -> str:
    genre = _text(project.get("genre")) or "短剧"
    tone = TONE_CN.get(_text(project.get("tone")), "甜虐")
    hook = _text(episode.get("hookType"))
    hook_cn = HOOK_CN.get(hook, "冲突")
    ep_no = episode.get("number") or 1
    ep_title = _text(episode.get("title")) or "未命名"
    heading = _text(scene.get("heading")) or "场景"
    interior, time, place = _parse_heading(heading)
    spoken = _dialogues(scene)
    names = _scene_cast(scene)
    lock = _character_lock(project, names)

    span = max(duration / max(len(beats), 1), 1.5)
    timeline = []
    cursor = 0.0
    for index, (size, action) in enumerate(beats):
        start = cursor
        end = duration if index == len(beats) - 1 else min(duration, cursor + span)
        timeline.append(
            f"[Shot {index + 1}] {_ts(start)}-{_ts(end)} △{size}：{action}"
        )
        cursor = end

    hook_line = _text(episode.get("endingHook"))
    if is_last and hook_line:
        timeline.append(f"结尾必须落在这个钩子画面：{hook_line}")

    dialogue_block = "\n".join(spoken) if spoken else "本镜以动作和反应为主，少对白。"

    return "\n".join(
        [
            f"{duration}秒、9:16竖屏真人短剧镜头。不要烧录字幕，不要台标，不要慢动作炫技。",
            f"题材：{genre}。调性：{tone}。对标国内竖屏短剧，电影感，人物以中近景和特写为主。",
            f"【剧名】《{_text(project.get('title')) or '未命名短剧'}》",
            f"【本集】第{ep_no}集《{ep_title}》",
            f"【场景】{interior}景 · {place} · {time}",
            f"【情绪】{hook_cn}",
            "",
            "角色锁定：",
            lock,
            "",
            "分镜时间轴：",
            *timeline,
            "",
            "对白（口型同步，中文，语气干脆）：",
            dialogue_block,
            "",
            "镜头运动：稳定跟拍，切点干净，景别按时间轴切换。",
            f"overall_soundscape: {_soundscape(interior, time, genre)}",
            f"non_diegetic_music: {_music(hook, _text(project.get('tone')), genre)}",
        ]
    )


def build_episode_clips(project: dict[str, Any], episode_id: str) -> list[dict[str, Any]]:
    episodes = project.get("episodes") or []
    episode = next((item for item in episodes if item.get("id") == episode_id), None)
    if episode is None:
        raise ValueError("找不到这一集")

    scenes = [
        scene
        for scene in episode.get("scenes") or []
        if _text(scene.get("heading"))
        or _text(scene.get("action"))
        or any(_text(line.get("line")) for line in scene.get("dialogues") or [])
    ]
    if not scenes:
        raise ValueError("这一集还没有可拍的场景。先把剧本写成场次和对白。")

    clips: list[dict[str, Any]] = []
    for index, scene in enumerate(scenes):
        action = _text(scene.get("action")) or _text(scene.get("heading")) or "冲突发生。"
        parts = _split_action(action)
        if not parts:
            parts = [action]
        beats = [
            (_shot_size(part, beat_i, len(parts)), part)
            for beat_i, part in enumerate(parts)
        ]
        duration = min(10, max(5, 4 + len(beats) + min(2, len(_dialogues(scene)) // 2)))
        is_last = index == len(scenes) - 1
        clips.append(
            {
                "id": _uuid(),
                "sceneId": _text(scene.get("id")),
                "number": index + 1,
                "duration": duration,
                "heading": _text(scene.get("heading")) or f"镜头{index + 1}",
                "prompt": build_clip_prompt(
                    project,
                    episode,
                    scene,
                    duration=duration,
                    beats=beats,
                    is_last=is_last,
                ),
            }
        )
    return clips

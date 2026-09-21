from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import db
from .prompts import build_episode_clips

app = FastAPI(title="TvScript", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/projects")
def list_projects() -> dict[str, Any]:
    return {"projects": db.list_projects()}


@app.get("/api/projects/{project_id}")
def read_project(project_id: str) -> dict[str, Any]:
    project = db.get_project(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="剧目不存在")
    return project


@app.put("/api/projects/{project_id}")
def save_project(project_id: str, project: dict[str, Any]) -> dict[str, Any]:
    if project.get("id") != project_id:
        project = {**project, "id": project_id}
    try:
        return db.upsert_project(project)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.delete("/api/projects/{project_id}")
def remove_project(project_id: str) -> dict[str, bool]:
    db.delete_project(project_id)
    return {"ok": True}


@app.post("/api/storyboard")
def storyboard(payload: dict[str, Any]) -> dict[str, Any]:
    project = payload.get("project")
    episode_id = payload.get("episodeId")
    if not isinstance(project, dict) or not episode_id:
        raise HTTPException(status_code=400, detail="需要 project 和 episodeId")
    try:
        clips = build_episode_clips(project, str(episode_id))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"clips": clips}

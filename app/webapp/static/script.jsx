const { useState, useEffect, useMemo, useCallback, useRef } = React;

const tg = window.Telegram ? window.Telegram.WebApp : null;

const STATUS_LABEL = {
    todo: "Ã¢ Ã®Ã·Ã¥Ã°Ã¥Ã¤Ã¨",
    in_progress: "Ã¢ Ã°Ã Ã¡Ã®Ã²Ã¥",
    done: "Ã£Ã®Ã²Ã®Ã¢Ã®",
};

const STATUS_ICON = {
    todo: '\u23F3',
    in_progress: '\uD83D\uDD04',
    done: '\u2705',
};

const AREA_STATUS_ICON = {
    ok: '\u{1F7E2}',
    watch: '\u{1F7E1}',
    warning: '\u{1F7E0}',
    critical: '\u{1F534}',
};

const TOAST_TIMEOUT = 2200;

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

async function fetchJSON(url, options = {}) {
    const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!response.ok) {
        let detail = "ÃÃ¸Ã¨Ã¡ÃªÃ  Ã§Ã Ã¯Ã°Ã®Ã±Ã ";
        try {
            const payload = await response.json();
            detail = payload.detail || detail;
        } catch (err) {
            // ignore parse error
        }
        throw new Error(detail);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
}

function useDialog(isOpen) {
    const ref = useRef(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) {
            return;
        }
        if (isOpen) {
            if (!dialog.open) {
                try {
                    dialog.showModal();
                } catch (_err) {
                    dialog.setAttribute("open", "open");
                }
            }
        } else if (dialog.open) {
            dialog.close();
        }
    }, [isOpen]);

    return ref;
}

function Toast({ message }) {
    if (!message) {
        return null;
    }
    return (
        <div className="toast toast--show" role="status" aria-live="assertive">
            {message}
        </div>
    );
}

function AreasView({
    areas,
    areasLoading,
    selectedAreaId,
    areaDetail,
    onSelectArea,
    onTouchArea,
    onCreateTask,
    onOpenAreaModal,
    onRefresh,
}) {
    const selected = areaDetail?.area;
    const overview = areaDetail?.overview;
    const metrics = areaDetail?.metrics ?? {};
    const counts = metrics.counts ?? {};
    const notes = areaDetail?.notes ?? [];
    const signals = overview?.signals ?? [];
    const nextActions = overview?.next_actions ?? [];

    return (
        <section id="areas-view" className="view" role="tabpanel" aria-labelledby="tab-areas">
            <header className="view__header">
                <div>
                    <h1>ÃÃ´Ã¥Ã°Ã» Ã¦Ã¨Ã§Ã­Ã¨</h1>
                    <p className="view__subtitle">ÃÃ¡Ã§Ã®Ã° Ã¯Ã°Ã®Ã£Ã°Ã¥Ã±Ã±Ã  Ã¨ Ã±Ã«Ã¥Ã¤Ã³Ã¾Ã¹Ã¨Ãµ Ã¸Ã Ã£Ã®Ã¢</p>
                </div>
                <div className="view__actions">
                    <button className="btn" type="button" onClick={() => onRefresh()}>
                        ÃÃ¡Ã­Ã®Ã¢Ã¨Ã²Ã¼
                    </button>
                    <button className="btn btn-accent" type="button" onClick={() => onOpenAreaModal(null)}>
                        + ÃÃ´Ã¥Ã°Ã 
                    </button>
                </div>
            </header>
            <div className="areas">
                <aside className="areas__list" aria-live="polite">
                    {areasLoading ? (
                        <p className="empty">ÃÃ Ã£Ã°Ã³Ã¦Ã Ã¥Ã¬ Ã±Ã´Ã¥Ã°Ã»Â</p>
                    ) : !areas.length ? (
                        <p className="empty">ÃÃ®ÃªÃ  Ã­Ã¥Ã² Ã±Ã´Ã¥Ã°. ÃÃ®Ã¡Ã Ã¢Ã¼Ã²Ã¥ Ã¯Ã¥Ã°Ã¢Ã³Ã¾ Ã± Ã¯Ã®Ã¬Ã®Ã¹Ã¼Ã¾ ÃªÃ­Ã®Ã¯ÃªÃ¨ Ã¢Ã»Ã¸Ã¥.</p>
                    ) : (
                        areas.map((area) => {
                            const statusIcon = AREA_STATUS_ICON[area.status || "ok"] || "??";
                            return (
                                <article
                                    key={area.id}
                                    className={`area-card${selectedAreaId === area.id ? " area-card--active" : ""}`}
                                    onClick={() => onSelectArea(area.id)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="area-card__header">
                                        <span className="area-card__name">
                                            {area.icon || statusIcon} {area.name}
                                        </span>
                                        <span className="chip">HS {area.health_score ?? 0}</span>
                                    </div>
                                    {area.short_desc ? (
                                        <p className="area-card__subtitle">{area.short_desc}</p>
                                    ) : null}
                                    <div className="area-card__metrics">
                                        <span>ÃÃ¥Ã£Ã®Ã¤Ã­Ã¿ {area.tasks_today ?? 0}</span>
                                        <span>ÃÃ²Ã Ã£Ã­Ã Ã¶Ã¨Ã¿ {area.stagnation_days ?? 0} Ã¤Ã­</span>
                                        <span>ÃÃ°Ã¨Ã®Ã°Ã¨Ã²Ã¥Ã² {area.priority ?? "Â"}</span>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </aside>
                <article className="areas__detail" aria-live="polite">
                    {areaDetail ? (
                        <>
                            <div className="area-detail__header">
                                <div>
                                    <h2 className="area-detail__title">
                                        {(selected?.icon || AREA_STATUS_ICON[selected?.status || "ok"] || "??") + " " + (selected?.name || "")}
                                    </h2>
                                    {selected?.short_desc ? (
                                        <p className="area-card__subtitle">{selected.short_desc}</p>
                                    ) : null}
                                    <div className="area-detail__meta">
                                        <span className="chip">HS {metrics.health_score ?? selected?.health_score ?? 0}</span>
                                        <span className="chip">ÃÃ¥Ã£Ã®Ã¤Ã­Ã¿ {selected?.tasks_today ?? 0}</span>
                                        <span className="chip">ÃÃ²Ã Ã£Ã­Ã Ã¶Ã¨Ã¿ {selected?.stagnation_days ?? 0} Ã¤Ã­</span>
                                        <span className="chip">ÃÃ°Ã¨Ã®Ã°Ã¨Ã²Ã¥Ã² {selected?.priority ?? "Â"}</span>
                                    </div>
                                    {signals.length ? (
                                        <div className="area-detail__meta">
                                            {signals
                                                .filter((signal) => signal.label)
                                                .map((signal) => (
                                                    <span className="chip" key={signal.type}>
                                                        {signal.label}
                                                    </span>
                                                ))}
                                        </div>
                                    ) : null}
                                </div>
                                <div className="area-detail__actions">
                                    <button className="btn btn-accent" type="button" onClick={() => onTouchArea(selected.id)}>
                                        Touch
                                    </button>
                                    <button className="btn" type="button" onClick={() => onCreateTask(selected.id)}>
                                        ÃÃ®Ã¡Ã Ã¢Ã¨Ã²Ã¼ Ã§Ã Ã¤Ã Ã·Ã³
                                    </button>
                                    <button className="btn" type="button" onClick={() => onOpenAreaModal(areaDetail)}>
                                        ÃÃ¥Ã¤Ã ÃªÃ²Ã¨Ã°Ã®Ã¢Ã Ã²Ã¼
                                    </button>
                                </div>
                            </div>
                            {overview?.one_thing ? (
                                <div className="area-detail__section">
                                    <h3>One Thing</h3>
                                    <p>{overview.one_thing}</p>
                                </div>
                            ) : null}
                            <div className="area-detail__section">
                                <h3>Next Actions</h3>
                                {nextActions.length ? (
                                    <div className="next-actions">
                                        {nextActions.map((item, index) => (
                                            <div key={item.occurrence_id ?? index} className="next-actions__item">
                                                {`${index + 1}. ${STATUS_ICON[item.status] || "Â"} ${item.text || ""}`}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="empty">ÃÃ¥Ã² Next Action. ÃÃ®Ã¡Ã Ã¢Ã¼Ã²Ã¥ Ã§Ã Ã¤Ã Ã·Ã³ Ã¤Ã«Ã¿ Ã½Ã²Ã®Ã© Ã±Ã´Ã¥Ã°Ã».</p>
                                )}
                            </div>
                            <div className="area-detail__section">
                                <h3>ÃÃ¥Ã²Ã°Ã¨ÃªÃ¨</h3>
                                <div className="metrics-grid">
                                    <div className="metric-card">
                                        <strong>ÃÃªÃ²Ã¨Ã¢Ã­Ã®Ã±Ã²Ã¼ 7 Ã¤Ã­</strong>
                                        <span>{metrics.activity_last_7 ?? 0}</span>
                                    </div>
                                    <div className="metric-card">
                                        <strong>ÃÃ Ã¢Ã¥Ã°Ã¸Ã¥Ã­Ã® 7 Ã¤Ã­</strong>
                                        <span>{metrics.completion_rate_7d ?? 0}%</span>
                                    </div>
                                    <div className="metric-card">
                                        <strong>ÃÃ®ÃªÃ³Ã±</strong>
                                        <span>{metrics.focus_ratio ?? 0}%</span>
                                    </div>
                                    <div className="metric-card">
                                        <strong>ÃÃ²Ã Ã²Ã³Ã±Ã»</strong>
                                        <span>
                                            todo {counts.todo ?? 0} Â· in_progress {counts.in_progress ?? 0} Â· done {counts.done ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="area-detail__section">
                                <h3>ÃÃ Ã¬Ã¥Ã²ÃªÃ¨</h3>
                                {notes.length ? (
                                    <div className="notes-list">
                                        {notes.map((note) => {
                                            const payload = note.payload || {};
                                            const text = payload.note || payload.text || JSON.stringify(payload);
                                            return <div key={note.id}>Â {text}</div>;
                                        })}
                                    </div>
                                ) : (
                                    <p className="empty">ÃÃ®ÃªÃ  Ã­Ã¥Ã² Ã§Ã Ã¬Ã¥Ã²Ã®Ãª.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="empty">ÃÃ»Ã¡Ã¥Ã°Ã¨Ã²Ã¥ Ã±Ã´Ã¥Ã°Ã³ Ã±Ã«Ã¥Ã¢Ã , Ã·Ã²Ã®Ã¡Ã» Ã³Ã¢Ã¨Ã¤Ã¥Ã²Ã¼ Ã¯Ã®Ã¤Ã°Ã®Ã¡Ã­Ã®Ã±Ã²Ã¨.</p>
                    )}
                </article>
            </div>
        </section>
    );
}

function TasksView({
    payload,
    date,
    onShiftDate,
    onSelectDate,
    showDone,
    onToggleDone,
    onRefresh,
    onUpdateStatus,
    onReorder,
}) {
    const tasks = payload?.tasks ?? [];
    const filtered = useMemo(
        () => (showDone ? tasks : tasks.filter((task) => task.status !== "done")),
        [tasks, showDone]
    );

    const summary = payload?.summary;
    const rollover = payload?.rollover;
    const dateLabel = useMemo(() => {
        if (!date) return "";
        return new Intl.DateTimeFormat("ru-RU", {
            weekday: "short",
            month: "long",
            day: "numeric",
        }).format(new Date(date + "T00:00:00"));
    }, [date]);

    return (
        <section id="tasks-view" className="view" role="tabpanel" aria-labelledby="tab-tasks">
            <header className="toolbar">
                                <button
                    id="nav-prev"
                    type="button"
                    title="Вчера"
                    aria-label="Предыдущий день"
                    onClick={() => onShiftDate(-1)}
                >
                    ◂
                </button>
                <input type="date" value={date} onChange={(event) => onSelectDate(event.target.value)} />
                                <button
                    id="nav-next"
                    type="button"
                    title="Завтра"
                    aria-label="Следующий день"
                    onClick={() => onShiftDate(1)}
                >
                    ▸
                </button>
            </header>

            <section className="summary" aria-live="polite">
                <strong>{dateLabel}</strong>
                <span>
                    ÃÃ±Ã¥Ã£Ã®: <strong>{summary?.total ?? 0}</strong>
                </span>
                <span>
                    Todo: {summary?.by_status?.todo ?? 0} Â Ã Ã°Ã Ã¡Ã®Ã²Ã¥: {summary?.by_status?.in_progress ?? 0} Â Done: {summary?.by_status?.done ?? 0}
                </span>
                {rollover?.created ? <span>? ÃÃ¥Ã°Ã¥Ã­Ã¥Ã±Ã¥Ã­Ã® Ã±Ã® Ã¢Ã·Ã¥Ã°Ã : <strong>{rollover.created}</strong></span> : null}
            </section>

            <label className="toggle">
                <input type="checkbox" checked={showDone} onChange={(event) => onToggleDone(event.target.checked)} />
                <span>ÃÃ®ÃªÃ Ã§Ã»Ã¢Ã Ã²Ã¼ Ã¢Ã»Ã¯Ã®Ã«Ã­Ã¥Ã­Ã­Ã»Ã¥</span>
            </label>

            <section className="tasks" aria-live="polite">
                {!filtered.length ? (
                    <p className="task-empty">
                        {showDone
                            ? "ÃÃ¥Ã² Ã§Ã Ã¤Ã Ã· Ã­Ã  Ã¢Ã»Ã¡Ã°Ã Ã­Ã­Ã³Ã¾ Ã¤Ã Ã²Ã³."
                            : "ÃÃ¥Ã² Ã ÃªÃ²Ã³Ã Ã«Ã¼Ã­Ã»Ãµ Ã§Ã Ã¤Ã Ã·. ÃÃªÃ«Ã¾Ã·Ã¨Ã²Ã¥ Ã¯Ã¥Ã°Ã¥ÃªÃ«Ã¾Ã·Ã Ã²Ã¥Ã«Ã¼, Ã·Ã²Ã®Ã¡Ã» Ã³Ã¢Ã¨Ã¤Ã¥Ã²Ã¼ Ã¢Ã»Ã¯Ã®Ã«Ã­Ã¥Ã­Ã­Ã»Ã¥."}
                    </p>
                ) : (
                    filtered.map((task) => (
                        <article
                            key={task.occurrence_id}
                            className={`task-item task-item--${task.status}`}
                            draggable
                            onDragStart={(event) => {
                                event.dataTransfer.setData("text/plain", String(task.occurrence_id));
                            }}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                                event.preventDefault();
                                const sourceId = event.dataTransfer.getData("text/plain");
                                onReorder(sourceId, String(task.occurrence_id));
                            }}
                        >
                            <div className="task-item__head">
                                <h3 className="task-item__title">{task.text || "ÃÃ¥Ã§ Ã­Ã Ã§Ã¢Ã Ã­Ã¨Ã¿"}</h3>
                                <div className="task-item__controls">
                                    {[
                                        { status: "done", label: "?" },
                                        { status: "in_progress", label: "??" },
                                        { status: "todo", label: "??" },
                                    ].map((btn) => (
                                        <button
                                            key={btn.status}
                                            type="button"
                                            onClick={() => onUpdateStatus(task.occurrence_id, btn.status)}
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="task-item__meta">
                                {[task.area ? `#${task.area}` : null, STATUS_LABEL[task.status] || task.status, task.rolled_from ? "Ã¯Ã¥Ã°Ã¥Ã­Ã¥Ã±Ã¥Ã­Ã " : null]
                                    .filter(Boolean)
                                    .join(" Â ")}
                            </div>
                        </article>
                    ))
                )}
            </section>

            <footer className="footer">
                <button className="btn" type="button" onClick={() => onRefresh()}>
                    ÃÃ¡Ã­Ã®Ã¢Ã¨Ã²Ã¼
                </button>
                <button className="btn btn-accent" type="button" onClick={() => onRefresh(true)}>
                    ÃÃ¥Ã°Ã¥Ã§Ã Ã£Ã°Ã³Ã§Ã¨Ã²Ã¼
                </button>
            </footer>
        </section>
    );
}

function App() {
    const [tgId, setTgId] = useState(null);
    const [timezone, setTimezone] = useState(null);
    const [view, setView] = useState("areas");
    const [areas, setAreas] = useState([]);
    const [areasLoading, setAreasLoading] = useState(true);
    const [selectedAreaId, setSelectedAreaId] = useState(null);
    const [areaDetail, setAreaDetail] = useState(null);
    const [areaDetailLoading, setAreaDetailLoading] = useState(false);
    const [tasksPayload, setTasksPayload] = useState(null);
    const [date, setDate] = useState(todayISO());
    const [showDone, setShowDone] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [areaModalOpen, setAreaModalOpen] = useState(false);
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [areaFormState, setAreaFormState] = useState({
        id: null,
        name: "",
        icon: "",
        short_desc: "",
        priority: "",
        one_thing: "",
    });
    const [pendingAreaId, setPendingAreaId] = useState(null);
    const [taskFormState, setTaskFormState] = useState({ text: "", area: "", date: todayISO() });

    const areaDialogRef = useDialog(areaModalOpen);
    const taskDialogRef = useDialog(taskModalOpen);

    const showToast = useCallback((message) => {
        setToastMessage(message);
    }, []);

    useEffect(() => {
        if (!toastMessage) {
            return;
        }
        const timer = setTimeout(() => setToastMessage(""), TOAST_TIMEOUT);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    useEffect(() => {
        if (tg) {
            try {
                tg.ready();
                tg.expand();
                const user = tg.initDataUnsafe?.user;
                if (user?.id) {
                    setTgId(user.id);
                }
                if (user?.language_code) {
                    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
                }
            } catch (err) {
                console.error("Telegram initialisation failed", err);
            }
        }

        if (!tg || !(tg.initDataUnsafe?.user?.id)) {
            const demoId = Number(localStorage.getItem("demo-tg-id") || 1);
            localStorage.setItem("demo-tg-id", String(demoId));
            setTgId(demoId);
            setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
    }, []);

    const loadAreas = useCallback(
        async (withSpinner = true) => {
            if (!tgId) {
                return;
            }
            if (withSpinner && tg?.MainButton) {
                tg.MainButton.showProgress();
            }
            setAreasLoading(true);
            try {
                const params = new URLSearchParams({ tg_id: String(tgId) });
                if (timezone) {
                    params.set("tz", timezone);
                }
                const payload = await fetchJSON(`/api/areas?${params.toString()}`);
                const nextAreas = payload.areas || [];
                setAreas(nextAreas);
                if (payload.timezone) {
                    setTimezone(payload.timezone);
                }
                if (nextAreas.length) {
                    setSelectedAreaId((prev) => {
                        if (!prev) {
                            return nextAreas[0].id;
                        }
                        const stillExists = nextAreas.some((area) => area.id === prev);
                        return stillExists ? prev : nextAreas[0].id;
                    });
                } else {
                    setSelectedAreaId(null);
                    setAreaDetail(null);
                }
            } catch (error) {
                console.error(error);
                showToast(error.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã§Ã Ã£Ã°Ã³Ã§Ã¨Ã²Ã¼ Ã±Ã´Ã¥Ã°Ã»");
            } finally {
                setAreasLoading(false);
                if (withSpinner && tg?.MainButton) {
                    tg.MainButton.hideProgress();
                }
            }
        },
        [tgId, timezone, showToast]
    );

    const loadAreaDetail = useCallback(
        async (areaId) => {
            if (!tgId || !areaId) {
                return;
            }
            setAreaDetailLoading(true);
            try {
                const params = new URLSearchParams({ tg_id: String(tgId) });
                if (timezone) {
                    params.set("tz", timezone);
                }
                const detail = await fetchJSON(`/api/areas/${areaId}?${params.toString()}`);
                setAreaDetail(detail);
            } catch (error) {
                console.error(error);
                showToast(error.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã§Ã Ã£Ã°Ã³Ã§Ã¨Ã²Ã¼ Ã¤Ã Ã­Ã­Ã»Ã¥ Ã±Ã´Ã¥Ã°Ã»");
            } finally {
                setAreaDetailLoading(false);
            }
        },
        [tgId, timezone, showToast]
    );

    const loadTasks = useCallback(
        async (withSpinner = true) => {
            if (!tgId || !date) {
                return;
            }
            if (withSpinner && tg?.MainButton) {
                tg.MainButton.showProgress();
            }
            try {
                const params = new URLSearchParams({
                    tg_id: String(tgId),
                    date,
                    include_done: "true",
                });
                if (timezone) {
                    params.set("tz", timezone);
                }
                const payload = await fetchJSON(`/api/tasks?${params.toString()}`);
                setTasksPayload(payload);
                if (payload.timezone) {
                    setTimezone(payload.timezone);
                }
            } catch (error) {
                console.error(error);
                showToast(error.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã§Ã Ã£Ã°Ã³Ã§Ã¨Ã²Ã¼ Ã§Ã Ã¤Ã Ã·Ã¨");
            } finally {
                if (withSpinner && tg?.MainButton) {
                    tg.MainButton.hideProgress();
                }
            }
        },
        [tgId, date, timezone, showToast]
    );

    useEffect(() => {
        if (tgId) {
            loadAreas(true);
            loadTasks(false);
        }
    }, [tgId, loadAreas, loadTasks]);

    useEffect(() => {
        if (selectedAreaId) {
            loadAreaDetail(selectedAreaId);
        }
    }, [selectedAreaId, loadAreaDetail]);

    useEffect(() => {
        loadTasks(false);
    }, [date]);

    const handleOpenAreaModal = useCallback(
        (detail) => {
            if (detail?.area) {
                setAreaFormState({
                    id: detail.area.id,
                    name: detail.area.name || "",
                    icon: detail.area.icon || "",
                    short_desc: detail.area.short_desc || "",
                    priority: detail.area.priority ?? "",
                    one_thing: detail.overview?.one_thing || "",
                });
            } else {
                setAreaFormState({ id: null, name: "", icon: "", short_desc: "", priority: "", one_thing: "" });
            }
            setAreaModalOpen(true);
        },
        []
    );

    const handleAreaFormSubmit = useCallback(
        async (event) => {
            event.preventDefault();
            if (!tgId) {
                return;
            }
            if (!areaFormState.name?.trim()) {
                showToast("ÃÃ Ã§Ã¢Ã Ã­Ã¨Ã¥ Ã±Ã´Ã¥Ã°Ã» Ã­Ã¥ Ã¬Ã®Ã¦Ã¥Ã² Ã¡Ã»Ã²Ã¼ Ã¯Ã³Ã±Ã²Ã»Ã¬");
                return;
            }
            try {
                await fetchJSON("/api/areas", {
                    method: "POST",
                    body: JSON.stringify({
                        tg_id: tgId,
                        area_id: areaFormState.id,
                        name: areaFormState.name.trim(),
                        icon: areaFormState.icon?.trim() || null,
                        short_desc: areaFormState.short_desc?.trim() || null,
                        priority: areaFormState.priority ? Number(areaFormState.priority) : null,
                        one_thing: areaFormState.one_thing?.trim() || null,
                        tz: timezone,
                    }),
                });
                showToast("ÃÃ´Ã¥Ã°Ã  Ã±Ã®ÃµÃ°Ã Ã­Ã¥Ã­Ã ");
                setAreaModalOpen(false);
                await loadAreas(false);
            } catch (error) {
                console.error(error);
                showToast(error.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã±Ã®ÃµÃ°Ã Ã­Ã¨Ã²Ã¼ Ã±Ã´Ã¥Ã°Ã³");
            }
        },
        [tgId, areaFormState, timezone, loadAreas, showToast]
    );

    const handleTouchArea = useCallback(
        async (areaId) => {
            if (!tgId || !areaId) {
                return;
            }
            try {
                await fetchJSON(`/api/areas/${areaId}/touch`, {
                    method: "POST",
                    body: JSON.stringify({ tg_id: tgId, tz: timezone }),
                });
                showToast("ÃÃ´Ã¥Ã°Ã  Ã®Ã¡Ã­Ã®Ã¢Ã«Ã¥Ã­Ã ");
                await Promise.all([loadAreas(false), loadAreaDetail(areaId)]);
            } catch (error) {
                console.error(error);
                showToast(error.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã®Ã¡Ã­Ã®Ã¢Ã¨Ã²Ã¼ Ã±Ã´Ã¥Ã°Ã³");
            }
        },
        [tgId, timezone, loadAreas, loadAreaDetail, showToast]
    );

    const handleOpenTaskModal = useCallback(
        (areaId = null) => {
            setPendingAreaId(areaId);
            setTaskFormState({ text: "", area: "", date });
            if (areaId && areaDetail?.area?.slug) {
                setTaskFormState((prev) => ({ ...prev, area: areaDetail.area.slug }));
            } else if (areaId) {
                const area = areas.find((item) => item.id === areaId);
                if (area?.slug) {
                    setTaskFormState((prev) => ({ ...prev, area: area.slug }));
                }
            }
            setTaskModalOpen(true);
        },
        [date, areaDetail, areas]
    );

    const handleTaskFormSubmit = useCallback(
        async (event) => {
            event.preventDefault();
            if (!tgId) {
                return;
            }
            if (!taskFormState.text?.trim()) {
                showToast("ÃÃ¥ÃªÃ±Ã² Ã§Ã Ã¤Ã Ã·Ã¨ Ã­Ã¥ Ã¬Ã®Ã¦Ã¥Ã² Ã¡Ã»Ã²Ã¼ Ã¯Ã³Ã±Ã²Ã»Ã¬");
                return;
            }
            try {
                await fetchJSON("/api/tasks", {
                    method: "POST",
                    body: JSON.stringify({
                        tg_id: tgId,
                        text: taskFormState.text.trim(),
                        date: taskFormState.date || date,
                        area: taskFormState.area?.trim() || null,
                        area_id: pendingAreaId,
                        tz: timezone,
                    }),
                });
                showToast("ÃÃ Ã¤Ã Ã·Ã  Ã¤Ã®Ã¡Ã Ã¢Ã«Ã¥Ã­Ã ");
                setTaskModalOpen(false);
                await Promise.all([loadTasks(false), loadAreas(false)]);
                if (pendingAreaId) {
                    await loadAreaDetail(pendingAreaId);
                }
            } catch (error) {
                console.error(error);
                showToast(error.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã±Ã®ÃµÃ°Ã Ã­Ã¨Ã²Ã¼ Ã§Ã Ã¤Ã Ã·Ã³");
            } finally {
                setPendingAreaId(null);
            }
        },
        [tgId, taskFormState, pendingAreaId, date, timezone, loadTasks, loadAreas, loadAreaDetail, showToast]
    );

    const handleUpdateTaskStatus = useCallback(
        async (occurrenceId, status) => {
            if (!tgId) {
                return;
            }
            try {
                await fetchJSON(`/api/occurrences/${occurrenceId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ tg_id: tgId, status, tz: timezone }),
                });
                await loadTasks(false);
                showToast("ÃÃ²Ã Ã²Ã³Ã± Ã®Ã¡Ã­Ã®Ã¢Ã«Â¸Ã­");
            } catch (error) {
                console.error(error);
                showToast(error.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã®Ã¡Ã­Ã®Ã¢Ã¨Ã²Ã¼ Ã±Ã²Ã Ã²Ã³Ã±");
            }
        },
        [tgId, timezone, loadTasks, showToast]
    );

    const handleReorderTasks = useCallback(
        async (sourceId, targetId) => {
            if (!tasksPayload || !sourceId || !targetId || sourceId === targetId) {
                return;
            }
            const items = [...(tasksPayload.tasks || [])];
            const sourceIndex = items.findIndex((item) => String(item.occurrence_id) === String(sourceId));
            const targetIndex = items.findIndex((item) => String(item.occurrence_id) === String(targetId));
            if (sourceIndex === -1 || targetIndex === -1) {
                return;
            }
            const [moved] = items.splice(sourceIndex, 1);
            items.splice(sourceIndex < targetIndex ? targetIndex + 1 : targetIndex, 0, moved);
            setTasksPayload((prev) => (prev ? { ...prev, tasks: items } : prev));
            if (!tgId) {
                return;
            }
            try {
                await fetchJSON("/api/occurrences/reorder", {
                    method: "POST",
                    body: JSON.stringify({
                        tg_id: tgId,
                        tz: timezone,
                        items: items.map((task, index) => ({
                            occurrence_id: task.occurrence_id,
                            order_index: (index + 1) * 1000,
                        })),
                    }),
                });
            } catch (error) {
                console.error(error);
                showToast(error.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã±Ã®ÃµÃ°Ã Ã­Ã¨Ã²Ã¼ Ã¯Ã®Ã°Ã¿Ã¤Ã®Ãª");
                loadTasks(false);
            }
        },
        [tasksPayload, tgId, timezone, loadTasks, showToast]
    );

    return (
        <>
            <div className="app">
                <nav className="tabs" role="tablist">
                    <button
                        id="tab-areas"
                        type="button"
                        className={`tab${view === "areas" ? " tab--active" : ""}`}
                        role="tab"
                        aria-selected={view === "areas"}
                        onClick={() => setView("areas")}
                    >
                        ÃÃ´Ã¥Ã°Ã»
                    </button>
                    <button
                        id="tab-tasks"
                        type="button"
                        className={`tab${view === "tasks" ? " tab--active" : ""}`}
                        role="tab"
                        aria-selected={view === "tasks"}
                        onClick={() => setView("tasks")}
                    >
                        ÃÃ Ã¤Ã Ã·Ã¨
                    </button>
                </nav>

                {view === "areas" ? (
                    <AreasView
                        areas={areas}
                        areasLoading={areasLoading || areaDetailLoading}
                        selectedAreaId={selectedAreaId}
                        areaDetail={areaDetail}
                        onSelectArea={setSelectedAreaId}
                        onTouchArea={handleTouchArea}
                        onCreateTask={handleOpenTaskModal}
                        onOpenAreaModal={handleOpenAreaModal}
                        onRefresh={loadAreas}
                    />
                ) : (
                    <TasksView
                        payload={tasksPayload}
                        date={date}
                        onShiftDate={(delta) => {
                            const current = new Date(date + "T00:00:00");
                            current.setDate(current.getDate() + delta);
                            setDate(current.toISOString().slice(0, 10));
                        }}
                        onSelectDate={(nextDate) => {
                            if (nextDate) {
                                setDate(nextDate);
                            }
                        }}
                        showDone={showDone}
                        onToggleDone={setShowDone}
                        onRefresh={(withSpinner = false) => loadTasks(withSpinner)}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onReorder={handleReorderTasks}
                    />
                )}

                <dialog className="modal" ref={areaDialogRef} onClose={() => setAreaModalOpen(false)} onCancel={() => setAreaModalOpen(false)}>
                    <form className="modal__content" onSubmit={handleAreaFormSubmit}>
                        <h2>{areaFormState.id ? "ÃÃ¥Ã¤Ã ÃªÃ²Ã¨Ã°Ã®Ã¢Ã Ã­Ã¨Ã¥ Ã±Ã´Ã¥Ã°Ã»" : "ÃÃ®Ã¢Ã Ã¿ Ã±Ã´Ã¥Ã°Ã "}</h2>
                        <label>
                            ÃÃ Ã§Ã¢Ã Ã­Ã¨Ã¥
                            <input
                                type="text"
                                value={areaFormState.name}
                                onChange={(event) => setAreaFormState((prev) => ({ ...prev, name: event.target.value }))}
                                required
                            />
                        </label>
                        <label>
                            ÃÃªÃ®Ã­ÃªÃ  (emoji)
                            <input
                                type="text"
                                value={areaFormState.icon}
                                onChange={(event) => setAreaFormState((prev) => ({ ...prev, icon: event.target.value }))}
                                placeholder='\uD83E\uDDE0'
                            />
                        </label>
                        <label>
                            ÃÃ°Ã Ã²ÃªÃ®Ã¥ Ã®Ã¯Ã¨Ã±Ã Ã­Ã¨Ã¥
                            <textarea
                                value={areaFormState.short_desc}
                                rows={2}
                                onChange={(event) =>
                                    setAreaFormState((prev) => ({ ...prev, short_desc: event.target.value }))
                                }
                            />
                        </label>
                        <label>
                            ÃÃ°Ã¨Ã®Ã°Ã¨Ã²Ã¥Ã² (1-5)
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={areaFormState.priority}
                                onChange={(event) =>
                                    setAreaFormState((prev) => ({ ...prev, priority: event.target.value }))
                                }
                            />
                        </label>
                        <label>
                            One Thing
                            <textarea
                                rows={2}
                                value={areaFormState.one_thing}
                                onChange={(event) =>
                                    setAreaFormState((prev) => ({ ...prev, one_thing: event.target.value }))
                                }
                            />
                        </label>
                        <div className="modal__actions">
                            <button type="button" className="btn" onClick={() => setAreaModalOpen(false)}>
                                ÃÃ²Ã¬Ã¥Ã­Ã 
                            </button>
                            <button type="submit" className="btn btn-accent">
                                ÃÃ®ÃµÃ°Ã Ã­Ã¨Ã²Ã¼
                            </button>
                        </div>
                    </form>
                </dialog>

                <dialog className="modal" ref={taskDialogRef} onClose={() => setTaskModalOpen(false)} onCancel={() => setTaskModalOpen(false)}>
                    <form className="modal__content" onSubmit={handleTaskFormSubmit}>
                        <h2>ÃÃ®Ã¢Ã Ã¿ Ã§Ã Ã¤Ã Ã·Ã </h2>
                        <label>
                            ÃÃ¥ÃªÃ±Ã²
                            <textarea
                                value={taskFormState.text}
                                rows={3}
                                onChange={(event) => setTaskFormState((prev) => ({ ...prev, text: event.target.value }))}
                                required
                            />
                        </label>
                        <label>
                            ÃÃ´Ã¥Ã°Ã  (slug, Ã®Ã¯Ã¶Ã¨Ã®Ã­Ã Ã«Ã¼Ã­Ã®)
                            <input
                                type="text"
                                value={taskFormState.area}
                                onChange={(event) => setTaskFormState((prev) => ({ ...prev, area: event.target.value }))}
                                placeholder="work"
                            />
                        </label>
                        <label>
                            ÃÃ Ã²Ã 
                            <input
                                type="date"
                                value={taskFormState.date}
                                onChange={(event) => setTaskFormState((prev) => ({ ...prev, date: event.target.value }))}
                                required
                            />
                        </label>
                        <div className="modal__actions">
                            <button type="button" className="btn" onClick={() => setTaskModalOpen(false)}>
                                ÃÃ²Ã¬Ã¥Ã­Ã 
                            </button>
                            <button type="submit" className="btn btn-accent">
                                ÃÃ®ÃµÃ°Ã Ã­Ã¨Ã²Ã¼
                            </button>
                        </div>
                    </form>
                </dialog>
            </div>

            <div id="toast-container">{toastMessage ? <Toast message={toastMessage} /> : null}</div>
        </>
    );
}

const rootElement = document.getElementById("app-root");
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

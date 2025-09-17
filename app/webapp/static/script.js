(() => {
    const tg = window.Telegram ? window.Telegram.WebApp : null;

    const els = {
        date: document.getElementById("date-picker"),
        prev: document.getElementById("nav-prev"),
        next: document.getElementById("nav-next"),
        summary: document.getElementById("summary"),
        toggleDone: document.getElementById("toggle-done"),
        taskList: document.getElementById("task-list"),
        refresh: document.getElementById("refresh-btn"),
        openAdd: document.getElementById("open-add"),
        modal: document.getElementById("task-modal"),
        form: document.getElementById("task-form"),
        formText: document.getElementById("task-text"),
        formArea: document.getElementById("task-area"),
        formDate: document.getElementById("task-date"),
        cancelAdd: document.getElementById("cancel-add"),
        toast: document.getElementById("toast"),
    };

    const state = {
        tgId: null,
        timezone: null,
        date: null,
        showDone: false,
        payload: null,
        dragSourceId: null,
        reorderPending: false,
    };

    const STATUS_LABEL = {
        todo: "в очереди",
        in_progress: "в работе",
        done: "готово",
    };

    const STATUS_ICON = {
        todo: "⬜️",
        in_progress: "🟡",
        done: "✅",
    };

    function initTelegram() {
        if (!tg) {
            return;
        }
        tg.ready();
        tg.expand();
        const user = tg.initDataUnsafe?.user;
        if (user?.id) {
            state.tgId = user.id;
        }
        if (tg.initDataUnsafe?.user?.language_code) {
            state.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
    }

    function ensureUserId() {
        if (!state.tgId) {
            const demoId = Number(localStorage.getItem("demo-tg-id") || 1);
            state.tgId = demoId;
            localStorage.setItem("demo-tg-id", String(demoId));
        }
    }

    function todayISO() {
        return new Date().toISOString().slice(0, 10);
    }

    function showToast(message, timeout = 2200) {
        if (!els.toast) {
            return;
        }
        els.toast.textContent = message;
        els.toast.classList.add("toast--show");
        setTimeout(() => els.toast.classList.remove("toast--show"), timeout);
    }

    async function fetchJSON(url, options = {}) {
        const response = await fetch(url, {
            headers: { "Content-Type": "application/json" },
            ...options,
        });
        if (!response.ok) {
            let detail = "Ошибка запроса";
            try {
                const payload = await response.json();
                detail = payload.detail || detail;
            } catch (err) {
                // ignore parse error
            }
            throw new Error(detail);
        }
        return response.json();
    }

    function setDate(dateStr) {
        state.date = dateStr;
        if (els.date) {
            els.date.value = dateStr;
        }
    }

    function shiftDate(days) {
        if (!state.date) return;
        const current = new Date(state.date + "T00:00:00");
        current.setDate(current.getDate() + days);
        setDate(current.toISOString().slice(0, 10));
        loadTasks();
    }

    async function loadTasks(showSpinner = true) {
        if (!state.tgId || !state.date) {
            return;
        }
        try {
            if (showSpinner && tg) {
                tg.MainButton.showProgress();
            }
            const params = new URLSearchParams({
                tg_id: String(state.tgId),
                date: state.date,
                include_done: "true",
            });
            const payload = await fetchJSON(`/api/tasks?${params.toString()}`);
            state.payload = payload;
            if (payload.timezone) {
                state.timezone = payload.timezone;
            }
            renderSummary();
            renderTasks();
        } catch (error) {
            console.error(error);
            showToast(error.message || "Не удалось загрузить задачи");
        } finally {
            if (tg) {
                tg.MainButton.hideProgress();
            }
        }
    }

    function renderSummary() {
        if (!els.summary || !state.payload) return;
        const { summary, rollover } = state.payload;
        const total = summary?.total ?? 0;
        const done = summary?.by_status?.done ?? 0;
        const inProgress = summary?.by_status?.in_progress ?? 0;
        const todo = summary?.by_status?.todo ?? 0;

        const dateLabel = new Intl.DateTimeFormat("ru-RU", {
            weekday: "short",
            month: "long",
            day: "numeric",
        }).format(new Date(state.date + "T00:00:00"));

        const rolloverLine = rollover?.created
            ? `<span>↺ Перенесено со вчера: <strong>${rollover.created}</strong></span>`
            : "";

        els.summary.innerHTML = `
            <strong>${dateLabel}</strong>
            <span>Всего: <strong>${total}</strong></span>
            <span>Todo: ${todo} • В работе: ${inProgress} • Done: ${done}</span>
            ${rolloverLine}
        `;
    }

    function renderTasks() {
        if (!els.taskList || !state.payload) return;
        els.taskList.innerHTML = "";

        const tasks = state.payload.tasks || [];
        const filtered = state.showDone ? tasks : tasks.filter((task) => task.status !== "done");

        if (!filtered.length) {
            const empty = document.createElement("p");
            empty.className = "task-empty";
            empty.textContent = state.showDone
                ? "Нет задач на выбранную дату."
                : "Нет актуальных задач. Включите переключатель, чтобы увидеть выполненные.";
            els.taskList.append(empty);
            return;
        }

        filtered.forEach((task) => {
            const item = document.createElement("article");
            item.className = `task-item task-item--${task.status}`;
            if (task.status === "done") {
                item.classList.add("task-item--done");
            } else if (task.status === "in_progress") {
                item.classList.add("task-item--in-progress");
            }
            item.draggable = true;
            item.dataset.id = String(task.occurrence_id);

            const head = document.createElement("div");
            head.className = "task-item__head";

            const title = document.createElement("h3");
            title.className = "task-item__title";
            title.innerHTML = `${STATUS_ICON[task.status] || ""} ${task.text}`;
            head.append(title);

            const controls = document.createElement("div");
            controls.className = "task-item__controls";
            [
                { key: "done", label: "✅" },
                { key: "in_progress", label: "▶️" },
                { key: "todo", label: "↩️" },
            ].forEach(({ key, label }) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.dataset.action = key;
                btn.dataset.id = String(task.occurrence_id);
                btn.textContent = label;
                controls.append(btn);
            });
            head.append(controls);
            item.append(head);

            const meta = document.createElement("div");
            meta.className = "task-item__meta";
            const statusSpan = document.createElement("span");
            statusSpan.textContent = STATUS_LABEL[task.status] || task.status;
            meta.append(statusSpan);
            if (task.area) {
                const areaSpan = document.createElement("span");
                areaSpan.textContent = `#${task.area}`;
                meta.append(areaSpan);
            }
            const idSpan = document.createElement("span");
            idSpan.textContent = `ID ${task.occurrence_id}`;
            meta.append(idSpan);
            item.append(meta);

            els.taskList.append(item);
        });
    }

    async function updateStatus(occurrenceId, status) {
        try {
            await fetchJSON(`/api/occurrences/${occurrenceId}`, {
                method: "PATCH",
                body: JSON.stringify({ tg_id: state.tgId, status }),
            });
            showToast("Статус обновлён");
            await loadTasks(false);
        } catch (error) {
            console.error(error);
            showToast(error.message || "Не удалось обновить статус");
        }
    }

    async function persistReorder() {
        if (!state.payload || state.reorderPending) return;
        state.reorderPending = true;
        try {
            const updates = state.payload.tasks.map((task, index) => ({
                occurrence_id: task.occurrence_id,
                order_index: task.order_index ?? (index + 1) * 100,
            }));
            await fetchJSON("/api/occurrences/reorder", {
                method: "POST",
                body: JSON.stringify({ tg_id: state.tgId, items: updates }),
            });
            showToast("Порядок сохранён", 1600);
        } catch (error) {
            console.error(error);
            showToast(error.message || "Не удалось сохранить порядок");
        } finally {
            state.reorderPending = false;
        }
    }

    function handleDragStart(event) {
        const target = event.target.closest(".task-item");
        if (!target) return;
        state.dragSourceId = target.dataset.id;
        event.dataTransfer.effectAllowed = "move";
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }

    function handleDrop(event) {
        event.preventDefault();
        const target = event.target.closest(".task-item");
        if (!target || !state.payload || !state.dragSourceId) return;
        const sourceId = Number(state.dragSourceId);
        const targetId = Number(target.dataset.id);
        if (sourceId === targetId) return;

        const tasks = state.payload.tasks;
        const sourceIndex = tasks.findIndex((task) => task.occurrence_id === sourceId);
        const targetIndex = tasks.findIndex((task) => task.occurrence_id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) return;

        const [moved] = tasks.splice(sourceIndex, 1);
        tasks.splice(targetIndex, 0, moved);
        tasks.forEach((task, index) => {
            task.order_index = (index + 1) * 100;
        });
        renderTasks();
        persistReorder();
    }

    async function handleAddTask(event) {
        event.preventDefault();
        const text = els.formText.value.trim();
        if (!text) {
            showToast("Опишите задачу");
            return;
        }
        const body = {
            tg_id: state.tgId,
            text,
            area: els.formArea.value.trim() || null,
            date: els.formDate.value,
        };
        try {
            await fetchJSON("/api/tasks", {
                method: "POST",
                body: JSON.stringify(body),
            });
            showToast("Задача добавлена");
            els.modal.close();
            els.form.reset();
            els.formDate.value = state.date;
            await loadTasks();
        } catch (error) {
            console.error(error);
            showToast(error.message || "Ошибка при добавлении");
        }
    }

    function openModal() {
        els.form.reset();
        els.formDate.value = state.date;
        els.modal.showModal();
        els.formText.focus();
    }

    function attachListeners() {
        els.prev.addEventListener("click", () => shiftDate(-1));
        els.next.addEventListener("click", () => shiftDate(1));
        els.refresh.addEventListener("click", () => loadTasks());
        els.openAdd.addEventListener("click", openModal);
        els.cancelAdd.addEventListener("click", () => els.modal.close());
        els.form.addEventListener("submit", handleAddTask);

        els.date.addEventListener("change", (event) => {
            setDate(event.target.value);
            loadTasks();
        });

        els.toggleDone.addEventListener("change", (event) => {
            state.showDone = Boolean(event.target.checked);
            renderTasks();
        });

        els.taskList.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-action]");
            if (!button) return;
            const status = button.dataset.action;
            const occurrenceId = Number(button.dataset.id);
            updateStatus(occurrenceId, status);
        });

        els.taskList.addEventListener("dragstart", handleDragStart);
        els.taskList.addEventListener("dragover", handleDragOver);
        els.taskList.addEventListener("drop", handleDrop);
    }

    function init() {
        initTelegram();
        ensureUserId();
        attachListeners();
        setDate(todayISO());
        if (els.toggleDone) {
            state.showDone = Boolean(els.toggleDone.checked);
        }
        loadTasks();
    }

    init();
})();

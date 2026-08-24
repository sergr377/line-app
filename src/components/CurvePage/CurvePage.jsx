import React, { useCallback, useEffect, useRef, useState } from 'react';
import s from './CurvePage.module.css';
import { bezierPoint } from './bezier';

const SIZE = 320;        //логический размер холста, px
const GRID_STEP = 10;    //шаг сетки, px
const T_STEP = 0.04;     //шаг параметра t между засечками
const TICK_MS = 100;     //пауза между засечками, мс
const TICKS = Math.round(1 / T_STEP);
const HIT_RADIUS = 12;   //радиус захвата точки мышью, px
const AXES = ['x', 'y'];

//контрастность к фону холста проверена по WCAG: направляющие и засечки
//дают больше 3:1, сетка намеренно ниже — она чисто декоративная
const GRID_COLOR = '#DCDCDC';
const GUIDE_COLOR = '#757575';
const TICK_COLOR = '#FF0000';
const CANVAS_BG = '#FAF0E6';
const INK = '#1A1A1A';
const LABEL_FONT = '14px "Segoe UI", Roboto, Arial, sans-serif';

//не выпускаем точку за пределы холста
function clamp(value) {
    return Math.min(SIZE, Math.max(0, Math.round(value)));
}

//битмап под плотность пикселей экрана, иначе на HiDPI холст мылит
function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;  //в jsdom canvas не реализован

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);  //дальше рисуем в логических координатах
    return ctx;
}

//сетка, опорная ломаная и сами точки — всё, что не зависит от анимации
function drawStatic(ctx, points) {
    ctx.clearRect(0, 0, SIZE, SIZE);

    //рисуем сетку
    ctx.beginPath();
    for (let x = 0.5; x < SIZE; x += GRID_STEP) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, SIZE);
    }
    for (let y = 0.5; y < SIZE; y += GRID_STEP) {
        ctx.moveTo(0, y);
        ctx.lineTo(SIZE, y);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = GRID_COLOR;
    ctx.stroke();

    //опорная ломаная: только соседние точки, хорда start-end к построению не относится
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = GUIDE_COLOR;
    ctx.stroke();

    drawPoints(ctx, points);
}

//концевые точки закрашены, контрольная полая — она лежит вне кривой
function drawPoints(ctx, points) {
    ctx.font = LABEL_FONT;
    ctx.textAlign = 'center';
    ctx.lineWidth = 2;

    points.forEach((point) => {
        ctx.strokeStyle = INK;

        if (point.role === 'control') {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = CANVAS_BG;
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillStyle = INK;
            ctx.fillRect(point.x - 3, point.y - 3, 6, 6);
        }

        //подпись не должна уезжать за край холста
        ctx.fillStyle = INK;
        ctx.fillText(
            point.label,
            Math.min(SIZE - 18, Math.max(18, point.x)),
            point.y - 10 < 14 ? point.y + 22 : point.y - 10
        );
    });
}

//засечка на кривой в точке t
function drawTick(ctx, points, t) {
    const pt = bezierPoint(points, t);
    ctx.fillStyle = TICK_COLOR;
    ctx.fillRect(pt.x - 1.5, pt.y - 1.5, 3, 3);
}

//готовая кривая: сэмплируем мелким шагом, поэтому степень может быть любой
function drawCurve(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= 100; i++) {
        const pt = bezierPoint(points, i / 100);
        ctx.lineTo(pt.x, pt.y);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = INK;
    ctx.stroke();
}

//поле ввода принимает только конечное число
function isValid(draft) {
    return draft.trim() !== '' && Number.isFinite(Number(draft));
}

//поля ввода стартуют с текущих координат и дальше следуют за холстом
function draftsFromPoints(points) {
    const drafts = {};
    points.forEach((point) => {
        drafts[point.id + 'x'] = String(point.x);
        drafts[point.id + 'y'] = String(point.y);
    });
    return drafts;
}

export default function CurvePage({ title, initialPoints }) {
    const canvasRef = useRef(null);
    const [points, setPoints] = useState(initialPoints);
    const [armed, setArmed] = useState(null);      //точка, ожидающая клика по холсту
    const [dragId, setDragId] = useState(null);    //точка, которую тащат мышью
    const [hoverId, setHoverId] = useState(null);
    const [drafts, setDrafts] = useState(() => draftsFromPoints(initialPoints));

    //отрисовка живёт в эффекте, поэтому анимация гасится при размонтировании
    //и при любом изменении точек — параллельных циклов не остаётся
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas && setupCanvas(canvas);
        if (!ctx) return undefined;

        drawStatic(ctx, points);

        //пока точку тащат, засечки не гоняем: анимация перезапускалась бы каждый кадр
        if (dragId) return undefined;

        //засечки идут по таймеру, а не по requestAnimationFrame: rAF молчит там,
        //где страница не компонует кадры (фоновая вкладка), и анимации не видно
        let drawn = 0;
        const timer = setInterval(() => {
            drawTick(ctx, points, drawn * T_STEP);
            drawn += 1;

            if (drawn >= TICKS) {
                clearInterval(timer);
                if (points.length > 2) drawCurve(ctx, points);
            }
        }, TICK_MS);

        return () => clearInterval(timer);
    }, [points, dragId]);

    //координаты с холста сразу попадают в поля ввода
    const movePoint = useCallback((id, x, y) => {
        const nextX = clamp(x);
        const nextY = clamp(y);
        setPoints((prev) => prev.map((point) => (
            point.id === id ? { ...point, x: nextX, y: nextY } : point
        )));
        setDrafts((prev) => ({ ...prev, [id + 'x']: String(nextX), [id + 'y']: String(nextY) }));
    }, []);

    //значение из поля: показываем обратно уже обрезанным по границам холста
    const setCoord = useCallback((id, axis, value) => {
        const next = clamp(value);
        setPoints((prev) => prev.map((point) => (
            point.id === id ? { ...point, [axis]: next } : point
        )));
        setDrafts((prev) => ({ ...prev, [id + axis]: String(next) }));
    }, []);

    //холст может быть ужат по ширине, поэтому переводим координаты через масштаб
    const positionFromEvent = (event) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const scale = SIZE / rect.width;
        return { x: (event.clientX - rect.left) * scale, y: (event.clientY - rect.top) * scale };
    };

    const findPoint = (position) => {
        let best = null;
        let bestDistance = HIT_RADIUS;
        points.forEach((point) => {
            const distance = Math.hypot(point.x - position.x, point.y - position.y);
            if (distance <= bestDistance) {
                best = point;
                bestDistance = distance;
            }
        });
        return best;
    };

    const handlePointerDown = (event) => {
        const position = positionFromEvent(event);

        //выбранная кнопкой точка ставится по клику
        if (armed) {
            movePoint(armed, position.x, position.y);
            setArmed(null);
            return;
        }

        //иначе тащим ближайшую точку под курсором
        const hit = findPoint(position);
        if (!hit) return;
        setDragId(hit.id);
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
        const position = positionFromEvent(event);

        if (dragId) {
            movePoint(dragId, position.x, position.y);
            return;
        }

        const hit = findPoint(position);
        const nextHover = hit ? hit.id : null;
        setHoverId((prev) => (prev === nextHover ? prev : nextHover));
    };

    const handlePointerUp = (event) => {
        if (!dragId) return;
        setDragId(null);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    let cursor = 'default';
    if (dragId) cursor = 'grabbing';
    else if (armed) cursor = 'crosshair';
    else if (hoverId) cursor = 'grab';

    const description = title + ': ' + points
        .map((point) => point.label + ' (' + point.role + ') ' + point.x + ', ' + point.y)
        .join('; ');

    return (
        <div className={s.mainPage}>
            <h1 className={s.title}>{title}</h1>

            <div className={s.layout}>
                <div className={s.canvasColumn}>
                    <div className={s.canvasFrame}>
                        <canvas
                            ref={canvasRef}
                            className={s.canvasField}
                            style={{ cursor }}
                            role="img"
                            aria-label={description}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={() => setHoverId(null)}
                        />
                    </div>

                    <p className={s.hint1}>Drag a point, or pick one and click the chart:</p>
                    <div className={s.pointButtons}>
                        {points.map((point) => (
                            <button
                                key={point.id}
                                type="button"
                                className={point.id === armed ? s.buttonArmed : s.button}
                                aria-pressed={point.id === armed}
                                onClick={() => setArmed(point.id === armed ? null : point.id)}
                            >
                                {point.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={s.controlsColumn}>
                    <p className={s.hint1}>Put the coordinates:</p>
                    {points.map((point) => (
                        <fieldset key={point.id} className={s.pointGroup}>
                            <legend className={s.pointLegend}>{point.label} — {point.role}</legend>
                            {AXES.map((axis) => {
                                const key = point.id + axis;
                                const draft = drafts[key] === undefined ? '' : drafts[key];
                                return (
                                    <form
                                        key={key}
                                        className={s.buttonGroup}
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            setCoord(point.id, axis, Number(draft));
                                        }}
                                    >
                                        <label className={s.fieldLabel} htmlFor={key}>
                                            {point.label} {axis.toUpperCase()}
                                        </label>
                                        <input
                                            id={key}
                                            className={s.inputField}
                                            type="number"
                                            min={0}
                                            max={SIZE}
                                            step={1}
                                            value={draft}
                                            onChange={(event) => {
                                                const { value } = event.target;
                                                setDrafts((prev) => ({ ...prev, [key]: value }));
                                            }}
                                        />
                                        <button type="submit" className={s.button} disabled={!isValid(draft)}>
                                            Put
                                        </button>
                                    </form>
                                );
                            })}
                        </fieldset>
                    ))}
                </div>
            </div>
        </div>
    );
}

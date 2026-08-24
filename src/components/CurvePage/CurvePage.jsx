import React, { useCallback, useEffect, useRef, useState } from 'react';
import s from './CurvePage.module.css';
import { bezierPoint } from './bezier';

const SIZE = 250;      //сторона холста, px
const GRID_STEP = 10;  //шаг сетки, px
const T_STEP = 0.04;   //шаг параметра t между засечками
const TICK_MS = 100;   //пауза между засечками, мс
const TICKS = Math.round(1 / T_STEP);

//не выпускаем точку за пределы холста
function clamp(value) {
    return Math.min(SIZE, Math.max(0, Math.round(value)));
}

//сетка, направляющие и опорные точки — всё, что не зависит от анимации
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
    ctx.strokeStyle = '#DCDCDC';
    ctx.stroke();

    //направляющие между всеми парами опорных точек
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
        }
    }
    ctx.strokeStyle = 'DarkGray';
    ctx.stroke();

    //рисуем точки
    ctx.fillStyle = 'black';
    ctx.font = '15px Roboto';
    points.forEach((point) => {
        ctx.fillText(point.label, point.x, point.y - 10);
        ctx.fillRect(point.x - 2.5, point.y - 2.5, 5, 5);
    });
}

//засечка на кривой в точке t
function drawTick(ctx, points, t) {
    const pt = bezierPoint(points, t);
    ctx.fillStyle = 'rgba(255,0,0,0.5)';
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
    ctx.strokeStyle = 'black';
    ctx.stroke();
}

//поле ввода принимает только конечное число
function isValid(draft) {
    return draft.trim() !== '' && Number.isFinite(Number(draft));
}

export default function CurvePage({ initialPoints }) {
    const canvasRef = useRef(null);
    const [points, setPoints] = useState(initialPoints);
    const [armed, setArmed] = useState(null);  //точка, ожидающая клика по холсту
    const [drafts, setDrafts] = useState({});  //необработанный ввод из полей

    //отрисовка живёт в эффекте, поэтому анимация гасится при размонтировании
    //и при любом изменении точек — параллельных циклов не остаётся
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas && canvas.getContext('2d');
        if (!ctx) return undefined;  //в jsdom canvas не реализован

        drawStatic(ctx, points);

        let rafId = null;
        let startedAt = null;
        let drawn = 0;

        const frame = (timestamp) => {
            if (startedAt === null) startedAt = timestamp;

            //сколько засечек должно быть видно к этому моменту
            const due = Math.min(TICKS, Math.floor((timestamp - startedAt) / TICK_MS));
            while (drawn < due) {
                drawTick(ctx, points, drawn * T_STEP);
                drawn += 1;
            }

            if (drawn < TICKS) {
                rafId = requestAnimationFrame(frame);
            } else if (points.length > 2) {
                drawCurve(ctx, points);
            }
        };

        rafId = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(rafId);
    }, [points]);

    const movePoint = useCallback((id, x, y) => {
        setPoints((prev) => prev.map((point) => (
            point.id === id ? { ...point, x: clamp(x), y: clamp(y) } : point
        )));
    }, []);

    const setCoord = useCallback((id, axis, value) => {
        setPoints((prev) => prev.map((point) => (
            point.id === id ? { ...point, [axis]: clamp(value) } : point
        )));
    }, []);

    //без выбранной точки клик по холсту ничего не меняет
    const handleCanvasClick = (event) => {
        const canvas = canvasRef.current;
        if (!armed || !canvas) return;

        const field = canvas.getBoundingClientRect();
        movePoint(
            armed,
            event.clientX - field.left - canvas.clientLeft,
            event.clientY - field.top - canvas.clientTop
        );
        setArmed(null);
    };

    const putDraft = (id, axis, key) => {
        setCoord(id, axis, Number(drafts[key]));
        setDrafts((prev) => ({ ...prev, [key]: '' }));
    };

    return (
        <div className={s.mainPage}>
            <div className={s.mainField}>
                <canvas
                    ref={canvasRef}
                    className={s.canvasField}
                    width={SIZE}
                    height={SIZE}
                    onClick={handleCanvasClick}
                />
            </div>

            <p className={s.hint1}>Put a dot on the chart:</p>
            <div>
                {points.map((point) => (
                    <button
                        key={point.id}
                        type="button"
                        className={point.id === armed ? s.buttonArmed : s.button}
                        onClick={() => setArmed(point.id === armed ? null : point.id)}
                    >
                        {point.label}
                    </button>
                ))}
            </div>

            <p className={s.hint1}>Put the coordinates:</p>
            {points.map((point) => (
                <div key={point.id} className={s.pointGroup}>
                    <p className={s.hint1}>{point.label} — {point.role}</p>
                    {['x', 'y'].map((axis) => {
                        const key = point.id + axis;
                        const draft = drafts[key] || '';
                        return (
                            <div key={key} className={s.buttonGroup}>
                                <input
                                    className={s.inputField}
                                    type="number"
                                    value={draft}
                                    aria-label={point.label + ' ' + axis.toUpperCase()}
                                    onChange={(event) => {
                                        const { value } = event.target;
                                        setDrafts((prev) => ({ ...prev, [key]: value }));
                                    }}
                                />
                                <button
                                    type="button"
                                    className={s.button}
                                    disabled={!isValid(draft)}
                                    onClick={() => putDraft(point.id, axis, key)}
                                >
                                    Put
                                </button>
                                {point.label} {axis.toUpperCase()}:&nbsp;<span>{point[axis]}</span>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

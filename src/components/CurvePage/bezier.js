//точка на кривой Безье любой степени, алгоритм де Кастельжо
//для двух опорных точек это обычная линейная интерполяция, для трёх — квадратичная кривая
export function bezierPoint(points, t) {
    let xs = points.map((point) => point.x);
    let ys = points.map((point) => point.y);

    while (xs.length > 1) {
        const nextXs = [];
        const nextYs = [];
        for (let i = 0; i < xs.length - 1; i++) {
            nextXs.push(xs[i] + (xs[i + 1] - xs[i]) * t);
            nextYs.push(ys[i] + (ys[i + 1] - ys[i]) * t);
        }
        xs = nextXs;
        ys = nextYs;
    }

    return { x: xs[0], y: ys[0] };
}

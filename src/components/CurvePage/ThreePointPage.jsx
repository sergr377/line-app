import React from 'react';
import CurvePage from './CurvePage';

//квадратичная кривая Безье: P = (1-t)²P1 + 2(1-t)tP2 + t²P3
//порядок точек — start, control, end, как в самой формуле
const POINTS = [
    { id: 'pt1', label: 'pt1', role: 'start', x: 120, y: 40 },
    { id: 'pt2', label: 'pt2', role: 'control', x: 230, y: 230 },
    { id: 'pt3', label: 'pt3', role: 'end', x: 60, y: 130 },
];

export default function ThreePointPage() {
    return <CurvePage title="Three points curve" initialPoints={POINTS} />;
}

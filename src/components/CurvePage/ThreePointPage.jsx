import React from 'react';
import CurvePage from './CurvePage';

//квадратичная кривая Безье: P = (1-t)²P1 + 2(1-t)tP2 + t²P3
//порядок точек — start, control, end, как в самой формуле
const POINTS = [
    { id: 'pt1', label: 'pt1', role: 'start', x: 100, y: 30 },
    { id: 'pt2', label: 'pt2', role: 'control', x: 175, y: 175 },
    { id: 'pt3', label: 'pt3', role: 'end', x: 50, y: 100 },
];

export default function ThreePointPage() {
    return <CurvePage initialPoints={POINTS} />;
}

import React from 'react';
import CurvePage from './CurvePage';

//кривая Безье первой степени: P = (1-t)P1 + tP2, то есть отрезок
const POINTS = [
    { id: 'pt1', label: 'pt1', role: 'start', x: 120, y: 40 },
    { id: 'pt2', label: 'pt2', role: 'end', x: 60, y: 130 },
];

export default function TwoPointPage() {
    return <CurvePage title="Two points curve" initialPoints={POINTS} />;
}

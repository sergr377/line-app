import React from 'react';
import s from './EmptyPage.module.css';

export default function TwoPointPage() {

    //2 точки P = (1-t)P1 + tP2
    function getQBezierValue(t, p1, p2) {
        let iT = 1 - t;
        return iT * p1 + t * p2;
    }

    //2 точки
    function getQuadraticCurvePoint(startX, startY, endX, endY, position) {
        return {
            x: getQBezierValue(position, startX, endX),
            y: getQBezierValue(position, startY, endY)
        };
    }

    //начальные координаты
    let startPointX = 100;
    let startPointY = 30;
    let EndPointX = 50;
    let EndPointY = 100;

    //присваиваем значениям полей начальные координаты
    let valuePt1X = startPointX
    let valuePt1Y = startPointY

    let valuePt2X = EndPointX
    let valuePt2Y = EndPointY

    // hooks для кнопок
    let i = 0

    let pt1 = function () {
        i = 1
    }
    let pt2 = function () {
        i = 2
    }

    let canvasField = function (event) {

        //получение координат
        let fieldCoords = document.getElementById('canvasField').getBoundingClientRect();
        let mouseCoords = {
            top: (event.clientY - fieldCoords.top - document.getElementById('canvasField').clientTop).toFixed(0),
            left: (event.clientX - fieldCoords.left - document.getElementById('canvasField').clientLeft).toFixed(0)
        };

        //передаём данные с клика
        switch (i) {
            case 0:
                break;
            case 1:
                startPointX = mouseCoords.left
                startPointY = mouseCoords.top
                document.getElementById('resultPt1X').innerHTML = startPointX
                document.getElementById('resultPt1Y').innerHTML = startPointY
                break;
            case 2:
                EndPointX = mouseCoords.left
                EndPointY = mouseCoords.top
                document.getElementById('resultPt2X').innerHTML = EndPointX
                document.getElementById('resultPt2Y').innerHTML = EndPointY
                break;
        }

        //создаём поле
        if (document.querySelector('canvas') !== null) {
            document.querySelector('canvas').remove()
        }
        let position = 0.0;
        let startPt = { x: startPointX, y: startPointY };
        let endPt = { x: EndPointX, y: EndPointY };
        let canvas = document.createElement("canvas");
        canvas.width = canvas.height = 250;

        //добавляем поле с canvas в DOM
        document.getElementById('canvasField').append(canvas);

        let ctx = canvas.getContext("2d");
        //рисуем сетку
        for (let x = 0.5; x < 250; x += 10) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 400);
        }

        for (let y = 0.5; y < 250; y += 10) {
            ctx.moveTo(0, y);
            ctx.lineTo(400, y);
        }
        ctx.strokeStyle = "#DCDCDC";
        ctx.stroke();

        //start-end линия
        ctx.beginPath()
        ctx.strokeStyle = "DarkGray";
        ctx.moveTo(startPt.x, startPt.y);
        ctx.lineTo(endPt.x, endPt.y);
        ctx.stroke();

        //рисуем точки 
        ctx.font = "15px Roboto";
        ctx.fillText("pt1", startPointX, startPointY - 10);
        ctx.fillText("pt2", EndPointX, EndPointY - 10);
        ctx.fillRect(startPointX - 2.5, startPointY - 2.5, 5, 5)
        ctx.fillRect(EndPointX - 2.5, EndPointY - 2.5, 5, 5)

        //рисуем засечку
        function drawNextPoint() {
            console.log(position)
            let pt = getQuadraticCurvePoint(startPt.x, startPt.y, endPt.x, endPt.y, position);
            position = (position + 0.04) % 1.0;

            ctx.fillStyle = "rgba(255,0,0,0.5)";
            ctx.fillRect(pt.x - 1.5, pt.y - 1.5, 3, 3,);
        }

        //запускаем отрисовку засечек
        setTimeout(function run() {
            drawNextPoint();
            if (position < 0.96) {
                setTimeout(run, 100)
            }
        }, 100);
    }
    // получение координат из полей воода
    let setCoord = (event) => {
        let buttonId = event.target.id
        let fieldValue = document.getElementById('value' + buttonId)
        console.log(fieldValue)
        let result = document.getElementById('result' + buttonId)
        result.innerHTML = fieldValue.value;
        console.log(result)

        switch (buttonId) {
            case 'Pt1X':
                startPointX = fieldValue.value
                break;
            case 'Pt1Y':
                startPointY = fieldValue.value
                break;
            case 'Pt2X':
                EndPointX = fieldValue.value
                break;
            case 'Pt2Y':
                EndPointY = fieldValue.value
                break;
        }

        i = 0;
        canvasField(event)
    }

    return (
        <div className={s.mainPage}>
            <div className={s.mainField}>
                <div id={'canvasField'} className={s.canvasField} onClick={canvasField}></div>
            </div>
            <div>
                <p className={s.hint1}>Put a dot on the chart:</p>
                <button id={'button1'} className={s.button} onClick={pt1}>pt1</button>
                <button id={'button2'} className={s.button} onClick={pt2}>pt2</button>
            </div>
            <p className={s.hint1}>Put the coordinates:</p>
            <div className={s.buttonGroup}>
                <input className={s.inputField} type="text" id="valuePt1X" />
                <button id={'Pt1X'} onClick={setCoord} className={s.button}  >Put </button> pt1 X:<span id="resultPt1X">{valuePt1X}</span>
            </div>
            <div className={s.buttonGroup}>
                <input className={s.inputField} type="text" id="valuePt1Y" />
                <button id={'Pt1Y'} onClick={setCoord} className={s.button}  >Put </button> pt1 Y:<span id="resultPt1Y">{valuePt1Y}</span>
            </div>
            -----------------------------------------------------------------------------------------------
            <div className={s.buttonGroup}>
                <input className={s.inputField} type="text" id="valuePt2X" />
                <button id={'Pt2X'} onClick={setCoord} className={s.button}  >Put </button> pt2 X: <span id="resultPt2X">{valuePt2X}</span>
            </div>
            <div className={s.buttonGroup}>
                <input className={s.inputField} type="text" id="valuePt2Y" />
                <button id={'Pt2Y'} onClick={setCoord} className={s.button}  >Put </button> pt2 Y: <span id="resultPt2Y">{valuePt2Y}</span>
            </div>
        </div>
    );
}



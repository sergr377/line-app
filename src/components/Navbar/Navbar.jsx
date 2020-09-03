import React from 'react';
import { Link } from "react-router-dom"
import s from './Navbar.module.css';


function Navbar() {

    return (
        <div className={s.navbar}>
            <div className={s.logo}>
                <div className={s.backgroundBlock}></div>
            </div>
            <div className={s.navbuttonCenter}>
                <Link className={s.navLink} to={'/twoPointPage'}>two points curve</Link>
                <Link className={s.navLink} to={'/threePointPage'}>Three points curve</Link>
            </div>
            <div className={s.logo}>
                <div className={s.backgroundBlock}>
                    <div className={s.iconBurger}>
                        <div className={s.shape1}></div>
                        <div className={s.shape2}></div>
                        <div className={s.shape1}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar


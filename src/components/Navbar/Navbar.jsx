import React from 'react';
import { NavLink } from 'react-router-dom';
import s from './Navbar.module.css';

function Navbar() {

    return (
        <div className={s.navbar}>
            <div className={s.logo}>
                <div className={s.backgroundBlock}></div>
            </div>
            <div className={s.navbuttonCenter}>
                <NavLink className={s.navLink} activeClassName={s.navLinkActive} to={'/twoPointPage'}>two points curve</NavLink>
                <NavLink className={s.navLink} activeClassName={s.navLinkActive} to={'/threePointPage'}>Three points curve</NavLink>
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

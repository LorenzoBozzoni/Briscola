import React from 'react'

import {Link} from 'react-router-dom'
import {startGame} from '../index.js'

export function InitialPage() {
    return (
    <>
    <div className="d-grid gap-2 d-md-block">
        <button className="btn btn-primary" type="button" onClick={() => startGame("single")}><Link to="./partita">Single Player</Link></button>
        <button className="btn btn-primary" type="button" onClick={() => startGame("multi")}>Random multiplayer</button>
        <button className="btn btn-primary" type="button" onClick={() => startGame("friend")}>Play with a friend</button>
    </div>
    </>
  )
}

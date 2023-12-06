
import React, { useState, useRef, useEffect } from 'react'
import { Button, Col, Container, Row, Accordion, Stack } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import {EditNameModal} from './EditNameModal';
import { JoinModal } from './JoinModal'
import HowToPlay from './HowToPlay'

export function Home() {

  const navigate = useNavigate();
  const howToPlayRef = useRef(null)

  const [showCreateLobby, setShowCreateLobby] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [createLobbyLoading, setCreateLobbyLoading] = useState(false)
  const [canRejoin, setCanRejoin] = useState(false)

  //Checks if we can rejoin a game in progress
  useEffect(()=>{
    let oldLobby = JSON.parse(localStorage.getItem('wikislam-lobby'))
    let oldUser = JSON.parse(localStorage.getItem('wikislam-user'))

    let clearStateOnError = err => {
      localStorage.clearItem('wikislam-lobby')
      localStorage.clearItem('wikislam-user')
    };

    if(oldLobby && oldUser){
      axios.get(`api/lobby/${oldLobby.id}`).then((res)=>{
        axios.get(`api/lobby/${oldLobby.id}`).then((res)=>{
          setCanRejoin(true);
        }).catch(clearStateOnError)
      }).catch(clearStateOnError)
    }
  }, [])

  function createLobby(userName){
    setCreateLobbyLoading(true)
    axios({url: `api/lobby`, method: "post", data: {admin: null, name: userName}}).then(result =>{
      localStorage.removeItem('wikislam-gamestate')
      navigate("/lobby", {state:{lobby: result.data.lobby, user: result.data.admin}})
      setCreateLobbyLoading(false)
    }).catch(err => {
      console.log(err)
      setCreateLobbyLoading(false)
    })
  }

  function rejoin(){
    let oldLobby = JSON.parse(localStorage.getItem('wikislam-lobby'))
    let oldUser = JSON.parse(localStorage.getItem('wikislam-user'))
    let duration = oldLobby.roundDuration.split(":")
    duration = (parseInt(duration[0]) * 3600) + (parseInt(duration[1]) * 60) + (parseInt(duration[2]))
    let startTime = oldLobby.roundStartTimestamp.split(":")
    startTime = (parseInt(startTime[0]) * 3600) + (parseInt(startTime[1]) * 60) + (parseInt(startTime[2]))
    
    localStorage.setItem('wikislam-gamestate', (Date.now() + duration > startTime) ? "Lobby" : "Game")
    navigate("/lobby", {state:{lobby: oldLobby, user: oldUser}});
  }

  return (
    <>
    <EditNameModal show={showCreateLobby} handleClose={()=>{setShowCreateLobby(false)}} handleCreate={createLobby} isLoading={createLobbyLoading}/>
    <JoinModal show={showJoin} handleClose={()=>{setShowJoin(false)}} />
    <div className='d-flex align-items-center flex-column' style={{height: "94vh"}}>
    <h1 className='m-5' style={{"font-size": "100pt"}}>
      <motion.div className='d-inline-block' animate={{x:[-1000, 0]}} transition={{ ease: "easeOut", duration: 0.2 }}>WIKI</motion.div>
      <motion.div className='d-inline-block' animate={{x:[1000, 0]}}transition={{ ease: "easeOut", duration: 0.2 }}>SLAM!</motion.div>
    </h1>
    {canRejoin && <motion.div className="mt-auto w-50" whileHover={{scale: 1.2}}><Button className='fs-2 w-100' onClick={rejoin}>Rejoin</Button></motion.div>}
    <motion.div className="mt-auto w-50" whileHover={{scale: 1.2}}><Button className='fs-2 w-100' onClick={()=>{setShowJoin(true)}}>Play</Button></motion.div>
    <motion.div className="mx-auto m-5 w-25" whileHover={{scale: 1.1}}><Button className='fs-5 w-100' onClick={()=>{setShowCreateLobby(true)}}>Create Lobby</Button></motion.div>
    </div>
    <Accordion className='w-100' ref={howToPlayRef} >
      <Accordion.Item eventKey="0">
        <Accordion.Header><div className='text-center fs-3 text-light' style={{position: "absolute", left: "50%", transform: "translate(-50%, 0%)"}}>HOW TO PLAY</div></Accordion.Header>
        <Accordion.Body onEntered={()=>{howToPlayRef.current.scrollIntoView()}}>
          <HowToPlay/>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
    </>
  )
}


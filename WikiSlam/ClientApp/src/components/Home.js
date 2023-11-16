
import React, { useState } from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {LobbyCreationModal} from './LobbyCreationModal';

export function Home() {

  const navigate = useNavigate();

  const [showCreateLobby, setShowCreateLobby] = useState(false)

  function join(){
    
  }

  function createLobby(userName){
    console.log("create")
    axios({url: `api/lobby`, method: "post", data: {admin: null, name: userName}}).then(result =>{
      navigate("/lobby", {state:{lobbyId: result.data.lobby.id, user: result.data.admin, lobbyCode:result.data.lobby.code}})
    })
  }

  return (
    <>
    <LobbyCreationModal show={showCreateLobby} handleClose={()=>{setShowCreateLobby(false)}} handleCreate={createLobby}/>
    <Container>
      <Row><Col>
        <h1>WikiSlam!</h1>
      </Col></Row>
      <Row><Col>
        <Button onClick={join}>Play</Button>
      </Col></Row>
      <Row><Col>
        <Button onClick={()=>{setShowCreateLobby(true)}}>Create Lobby</Button>
      </Col></Row>
    </Container></>
  )
}



import React from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export function Home() {

  const navigate = useNavigate();

  function join(){
    
  }

  function createLobby(){
    axios({url: `api/lobby`, method: "post", data: {admin: null, name: "adminName"}}).then(result =>{
      navigate("/lobby", {state:{lobbyId: result.data.lobby.id, user: result.data.admin, lobbyCode:result.data.lobby.code}})
    })
  }

  return (
    <Container>
      <Row><Col>
        <h1>WikiSlam!</h1>
      </Col></Row>
      <Row><Col>
        <Button onClick={join}>Play</Button>
      </Col></Row>
      <Row><Col>
        <Button onClick={createLobby}>Create Lobby</Button>
      </Col></Row>
    </Container>
  )
}


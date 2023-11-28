import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Stack, Card, Badge, Button, Placeholder, Spinner } from 'react-bootstrap';

import axios from 'axios';



export default function Results() {

  const navigate = useNavigate()
  const location = useLocation()

  if(!location.state){
    navigate("/")
  }

  const lobby = location.state.lobby
  const user = location.state.user
  const users = location.state.users

  if(!lobby || !users || !user){
    navigate("/")
  }

    const [results, setResults] = useState({ "resultsList": [ { "article": { "id": 48, "userId": 45, "title": "Marial Shayok", "level": 0, "strength": 24, "dexterity": 24, "willpower": 25 }, "user": { "id": 45, "lobbyId": 19, "name": "cap", "isAdmin": false }, "winLossRecord": { "47": 1, "49": 1 }, "score": 22 }, { "article": { "id": 49, "userId": 46, "title": "1969 Cotton Bowl Classic", "level": 0, "strength": 15, "dexterity": 11, "willpower": 3 }, "user": { "id": 46, "lobbyId": 19, "name": "corp", "isAdmin": false }, "winLossRecord": { "47": 1, "48": -1 }, "score": 20 }, { "article": { "id": 47, "userId": 44, "title": "Bârna", "level": 0, "strength": 12, "dexterity": 8, "willpower": 10 }, "user": { "id": 44, "lobbyId": 19, "name": "kip", "isAdmin": true }, "winLossRecord": { "48": -1, "49": -1 }, "score": 18 } ], "winner": 48, "lobbyId": 19 })
    const [resultsLoading, setResultsLoading] = useState(true)

    useEffect(()=>{
        axios.get(`api/lobby/${lobby.id}/results`).then(res => {
            setResults(res.data)
            setResultsLoading(false)
        })
        setResultsLoading(false)
      }, [])

  return (
    <Container>
        <Row>
            <Col>
                <h1>Results</h1>
                <h2>{lobby.code}</h2>
            </Col>
            <Col>
              {
                (resultsLoading) ?
                <Spinner/> :
                <Stack gap={3}>
                  {results.resultsList.map((r) => {
                    return(<Card key={r.article.id}>
                      <Card.Header>{r.user.name}</Card.Header>
                      <Card.Body>
                        {r.article.title} : 
                        LVL {r.article.level} 
                        STR {r.article.strength} 
                        DEX {r.article.dexterity} 
                        WIL {r.article.willpower}
                      </Card.Body>
                    </Card>)
                  })}
                </Stack>
              }
            </Col>
            <Col>
            <Button onClick={()=>{navigate("/lobby", {state:{lobby: lobby, user: user, users: users}})}}>Play Again</Button>
            <Button onClick={()=>{console.log(results.resultsList)}}>Grop</Button>
            </Col>
        </Row>
        
    </Container>
  )
}

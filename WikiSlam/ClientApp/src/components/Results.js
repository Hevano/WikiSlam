import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Stack, Card, Badge, Button, Placeholder, Spinner } from 'react-bootstrap';

import axios from 'axios';



export default function Results({lobby, user, users, playAgainCallback}) {

    const [results, setResults] = useState()
    const [resultsLoading, setResultsLoading] = useState(true)

    useEffect(()=>{
        axios.get(`api/lobby/${lobby.id}/results`).then(res => {
            setResults(res.data)
            setResultsLoading(false)
        })
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
            <Button onClick={playAgainCallback}>Play Again</Button>
            </Col>
        </Row>
        
    </Container>
  )
}

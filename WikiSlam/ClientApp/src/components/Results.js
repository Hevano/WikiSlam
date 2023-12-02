import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Stack, Card, Button, Placeholder, Spinner, Alert, ListGroup, ListGroupItem } from 'react-bootstrap';
import ArticleCard from './ArticleCard';
import axios from 'axios';
import LevelBadge from './LevelBadge';
import { motion } from 'framer-motion'



export default function Results({lobby, user, users, playAgainCallback}) {

    const [results, setResults] = useState()
    const [resultsLoading, setResultsLoading] = useState(true)

    useEffect(()=>{
        axios.get(`api/lobby/${lobby.id}/results`).then(res => {
            setResults(res.data)
            setResultsLoading(false)

            //TODO: Load image from wikipedia api
        })
      }, [])

  let count = 1

  return (
    <motion.div animate={{x:[-2000, 0]}} transition={{ ease: "easeOut", duration: 0.5 }}>
    <Container fluid className='p-0'>
      <div className='result-shape'/>
        <Row className='p-5'>
            <Col>
                <h3 className='m-0 text-light' style={{fontSize:"50pt"}}>RESULTS</h3>
                <h1 className='mb-5' style={{fontSize:"20pt", lineHeight: "75%"}}>CODE: {lobby.code ? lobby.code : "???"}</h1>
            </Col>
            <Col className='col-6'>
              {
                (resultsLoading) ?
                <div className='d-flex'><Spinner className='m-auto'/></div> :
                <Stack gap={3}>
                  <ArticleCard 
                    article={results.resultsList[0].article} 
                    articleLoading={false} 
                    showLevel={true} 
                    children={<Alert className="text-center" style={{position: "absolute", top: "-1.5em", width: "80%", left: "10%"}}><h3>{results.resultsList[0].user.name} Wins!</h3></Alert>}
                  />
                  <ListGroup>
                  {results.resultsList.slice(1).map((r) => {

                    return(
                      <motion.div whileHover={{x: -5}}>
                      <ListGroupItem className="d-flex justify-content-between align-items-start p-3">
                        <div className="ms-2 me-auto">
                          <div className="fw-bold">#{++count}: "{r.article.title}" by {r.user.name}</div>
                          STR {r.article.strength} DEX {r.article.dexterity} WIL {r.article.willpower}
                        </div>
                        <LevelBadge article={r.article} isLoading={false} size={1}/>
                      </ListGroupItem>
                      </motion.div>
                    )

                    // return(<Card key={r.article.id}>
                    //   <Card.Header>#{++count}: {r.user.name}</Card.Header>
                    //   <Card.Body>
                    //     {r.article.title} : 
                    //     LVL {r.article.level} 
                    //     STR {r.article.strength} 
                    //     DEX {r.article.dexterity} 
                    //     WIL {r.article.willpower}
                    //   </Card.Body>
                    // </Card>)
                  })}
                  </ListGroup>
                </Stack>
              }
            </Col>
            <Col>
            <div className="d-flex align-items-end flex-column bd-highlight mb-3 h-100">
              <motion.div whileHover={{scale: 1.5}} className="mt-auto p-2 bd-highlight"><Button className="fs-2 " onClick={playAgainCallback}>Play Again</Button></motion.div>
            </div>
            
            </Col>
        </Row>
        
    </Container>
    </motion.div>
  )
}

import React from 'react'
import { Card, Badge, Container, Row, Col, Placeholder } from 'react-bootstrap'
import LevelBadge from './LevelBadge'

export default function ArticleCard({article, articleLoading, strRef, dexRef, wilRef, showLevel, children}) {
  return (
    <Card className='p-md-5 mx-auto' style={{"max-width": "65%"}}>
      {children}
      {showLevel && <div style={{position: "absolute", top: "40%", left: "-3em"}}><LevelBadge size={3} isLoading={articleLoading} article={article}/></div>}
      <Card.Body>
        {(articleLoading) ? <Placeholder as={Card.Title} animation="glow" className="m-1"><Placeholder xs={12} /></Placeholder> : <Card.Title className="text-center">{article.title}</Card.Title>}
        <div className='d-flex h-50' style={{"maxHeight": "25vh"}}><Card.Img className="mx-auto" style={{"objectFit": "contain"}} src={(!articleLoading && article.image) ? article.image : "https://placehold.co/600x400?text=Loading"} /></div>
        <Card.Text>
          <div className='mx-auto text-center'>{(articleLoading) ? "" : article.desc}</div>
          <Container fluid>
            <Row>
              <Col xs={6} sm={4}>
              <div className='d-flex'>
                <Badge ref={strRef} className='mx-auto mt-4 d-none d-md-block fs-5'>STR: {(!articleLoading) ? article.strength : "???"}</Badge>
                <Badge ref={strRef} className='mx-auto mt-1 d-block d-md-none'>STR: {(!articleLoading) ? article.strength : "???"}</Badge>
              </div>
              
              </Col>
              <Col xs={6} sm={4}>
              <div className='d-flex'>
                <Badge ref={strRef} className='mx-auto mt-4 d-none d-md-block fs-5'>DEX: {(!articleLoading) ? article.dexterity : "???"}</Badge>
                <Badge ref={strRef} className='mx-auto mt-1 d-block d-md-none'>DEX: {(!articleLoading) ? article.dexterity : "???"}</Badge>
              </div>
              </Col>
              <Col xs={12} sm={4}>
                <div className='d-flex'>
                  <Badge ref={strRef} className='mx-auto mt-4 d-none d-md-block fs-5'>WIL: {(!articleLoading) ? article.willpower : "???"}</Badge>
                  <Badge ref={strRef} className='mx-auto mt-1 d-block d-md-none'>WIL: {(!articleLoading) ? article.willpower : "???"}</Badge>
                </div>
              </Col>
            </Row>
          </Container>
        </Card.Text>
      </Card.Body>
    </Card>
  )
}
